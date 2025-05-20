<template>
  <div id="map" class="h-[500px] mb-4 border border-gray-300"></div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
});

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

const map = ref(null);
const mapError = ref(null);

const initMap = async () => {
  try {
    console.log('MapView: 初始化地图');
    await nextTick();
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      throw new Error('Map container #map not found');
    }
    map.value = L.map('map', {
      maxBounds: [[-35, -20], [37, 55]],
      maxBoundsViscosity: 1.0,
      minZoom: 4,
      maxZoom: 10,
    }).setView([5, 10], 3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      noWrap: true,
    }).addTo(map.value);
    console.log('MapView: 地图初始化成功');
    map.value.invalidateSize();
  } catch (err) {
    console.error('MapView: 地图初始化失败:', err);
    mapError.value = err.message;
  }
};

const updateMarkers = (metrics) => {
  if (!map.value) {
    console.warn('MapView: 地图未初始化，跳过更新标记');
    return;
  }
  map.value.eachLayer((layer) => {
    if (layer instanceof L.Marker) map.value.removeLayer(layer);
  });

  console.log('MapView: 更新标记，metrics:', metrics);
  if (!metrics || !Array.isArray(metrics)) {
    console.warn('MapView: metrics 无效:', metrics);
    return;
  }

  metrics.forEach((d) => {
    if (!d || !d.Port_City || !d.Country) {
      console.warn('MapView: 无效数据项:', d);
      return;
    }
    const coords = portCoordinates[d.Port_City];
    if (coords) {
      L.marker(coords)
        .addTo(map.value)
        .bindPopup(`
          <div class="popup-content max-w-[300px]">
            <h3>${d.Country} - ${d.Port_City} (${d.Year})</h3>
            <p><b>总手术量:</b> ${d.Total_Procedures || 'N/A'}</p>
            <p><b>成功率:</b> ${d.Successful_Outcomes_Percent || 'N/A'}%</p>
            <p><b>经济影响:</b> $${Number(d.Economic_Impact_USD || 0).toLocaleString()}</p>
            <p><b>培训专业人员:</b> ${d.Local_Professionals_Trained || 'N/A'}</p>
            <p><b>生活质量提升:</b> ${d.Patient_QOL_Improvement_Percent || 'N/A'}%</p>
          </div>
        `);
      console.log('MapView: 添加标记:', d.Port_City, coords);
    } else {
      console.warn('MapView: 未找到坐标:', d.Port_City);
    }
  });
};

onMounted(async () => {
  await initMap();
  updateMarkers(props.metrics);
});

watch(() => props.metrics, updateMarkers, { deep: true });
</script>

<style scoped>
#map {
  width: 100%;
  min-height: 500px !important;
  position: relative;
  background: #e0e0e0;
}
</style>