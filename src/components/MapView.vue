<template>
  <div class="map-container">
    <div id="map" class="map" />
    <div class="map-controls">
      <div class="layer-control">
        <label class="control-label">Layer:</label>
        <select v-model="selectedLayer" @change="updateLayer">
          <option value="markers">Ship Locations</option>
          <option value="heatmap">Patient Origins</option>
          <option value="density">Treatment Density</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// 修正默认图标路径，确保正常显示默认marker图标
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const props = defineProps({
  metrics: {
    type: Array,
    default: () => [],
  },
  selectedYear: {
    type: Number,
    required: true,
    default: null,
  }
});

const selectedLayer = ref('markers');
// 时间段相关的变量移除
// const selectedTimePeriod = ref('all');

const map = ref(null);
const mapError = ref(null);
const currentMarkers = ref([]);
const heatmapLayer = ref(null);
const densityLayer = ref(null);

// 港口名称对应经纬度（示例数据，根据实际数据调整）
const portCoordinates = {
  Dakar: [14.6928, -17.4467],
  Conakry: [9.6412, -13.5783],
  Douala: [4.0511, 9.7679],
  Lomé: [6.1256, 1.2258],
  Cotonou: [6.3703, 2.3912],
  Freetown: [8.4657, -13.2317],
  Monrovia: [6.3156, -10.8074],
  'Pointe-Noire': [-4.7692, 11.8664],
  Toamasina: [-18.1492, 49.4023],
  Banjul: [13.4549, -16.5790],
};

const createPopupContent = (data) => {
  return `
    <div class="popup-content" style="max-width: 300px;">
      <h3>${data.Country} - ${data.Port_City} (${data.Year})</h3>
      <p><b>Total Procedures:</b> ${data.Total_Procedures || 'N/A'}</p>
      <p><b>Success Rate:</b> ${data.Successful_Outcomes_Percent || 'N/A'}%</p>
      <p><b>Economic Impact:</b> $${Number(data.Economic_Impact_USD || 0).toLocaleString()}</p>
      <p><b>Professionals Trained:</b> ${data.Local_Professionals_Trained || 'N/A'}</p>
      <p><b>Patient QOL Improvement:</b> ${data.Patient_QOL_Improvement_Percent || 'N/A'}%</p>
    </div>
  `;
};

const getFilteredMetrics = computed(() => {
  if (!props.metrics) return [];

  // 去掉时间段过滤，只基于props.metrics直接使用
  return props.metrics;
});

const initMap = async () => {
  await nextTick();
  const mapContainer = document.getElementById('map');
  if (!mapContainer) throw new Error('Map container #map not found');

  map.value = L.map('map', {
    maxBounds: [[-35, -20], [37, 55]],
    maxBoundsViscosity: 1.0,
    minZoom: 1,
    maxZoom: 10,
  }).setView([5, 10], 4);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    noWrap: true,
  }).addTo(map.value);

  map.value.invalidateSize();
};

const updateMarkers = () => {
  if (!map.value) return;

  // 清除旧的 markers 和图层
  currentMarkers.value.forEach(marker => map.value.removeLayer(marker));
  currentMarkers.value = [];

  if (heatmapLayer.value) {
    map.value.removeLayer(heatmapLayer.value);
    heatmapLayer.value = null;
  }

  if (densityLayer.value) {
    map.value.removeLayer(densityLayer.value);
    densityLayer.value = null;
  }

  const filteredMetrics = getFilteredMetrics.value;

  switch (selectedLayer.value) {
    case 'markers':
      filteredMetrics.forEach(data => {
        if (!data || !data.Port_City || !data.Country) {
          console.warn('MapView: Invalid data item:', data);
          return;
        }
        const coords = portCoordinates[data.Port_City];
        if (coords) {
          const marker = L.marker(coords)
            .addTo(map.value)
            .bindPopup(createPopupContent(data));
          currentMarkers.value.push(marker);
        }
      });
      break;

    case 'heatmap':
      const heatData = filteredMetrics.map(data => {
        const coords = portCoordinates[data.Port_City];
        return coords ? [...coords, data.Total_Procedures || 1] : null;
      }).filter(Boolean);

      if (heatData.length > 0) {
        heatmapLayer.value = L.heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 10,
        }).addTo(map.value);

        // 调整地图视野，包含所有热力图点
        const latlngs = heatData.map(([lat, lng]) => L.latLng(lat, lng));
        const bounds = L.latLngBounds(latlngs);
        map.value.fitBounds(bounds.pad(0.1), {
          maxZoom: 4,
          padding: [50, 50],
        });
      }
      break;

    case 'density':
      filteredMetrics.forEach(data => {
        const coords = portCoordinates[data.Port_City];
        if (coords) {
          const radius = Math.sqrt(data.Total_Procedures || 1) * 2000;
          const circle = L.circle(coords, {
            radius: radius,
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.3,
            weight: 1,
          }).addTo(map.value);

          circle.bindPopup(createPopupContent(data));
          currentMarkers.value.push(circle);
        }
      });
      break;
  }

  // 如果是markers或circle图层，则用已有markers调整视野
  if (selectedLayer.value !== 'heatmap' && currentMarkers.value.length > 0) {
    const group = L.featureGroup(currentMarkers.value);
    map.value.fitBounds(group.getBounds().pad(0.1), {
      maxZoom: 4,
      padding: [50, 50],
    });
  }
};


const updateLayer = () => {
  updateMarkers();
};

onMounted(async () => {
  try {
    await initMap();
    updateMarkers();
  } catch (err) {
    console.error('MapView: Map initialization failed:', err);
    mapError.value = err.message;
  }
});

watch(() => props.metrics, updateMarkers, { deep: true });
watch(selectedLayer, updateMarkers);

</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  min-height: 500px;
  background: #e0e0e0;
  border: 1px solid #ccc;
  border-radius: 12px;
  overflow: hidden;
}

#map {
  width: 100%;
  height: 100%;
  min-height: 500px !important;
  position: relative;
}

.map-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  background: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 10px;
}

.control-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-right: 4px;
}

select {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  font-size: 0.875rem;
}

.popup-content {
  font-size: 0.875rem;
  line-height: 1.5;
}

.popup-content h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1e3a8a;
}

.popup-content p {
  margin: 4px 0;
}
</style>
