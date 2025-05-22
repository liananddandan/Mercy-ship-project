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
    console.log('MapView: Initializing map');
    await nextTick();
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      throw new Error('Map container #map not found');
    }
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
    console.log('MapView: Map initialized successfully');
    map.value.invalidateSize();
  } catch (err) {
    console.error('MapView: Map initialization failed:', err);
    mapError.value = err.message;
  }
};

const updateMarkers = (metrics) => {
  if (!map.value) {
    console.warn('MapView: Map not initialized, skipping marker update');
    return;
  }
  map.value.eachLayer((layer) => {
    if (layer instanceof L.Marker) map.value.removeLayer(layer);
  });

  console.log('MapView: Updating markers, metrics:', metrics);
  if (!metrics || !Array.isArray(metrics)) {
    console.warn('MapView: Invalid metrics:', metrics);
    return;
  }

  metrics.forEach((d) => {
    if (!d || !d.Port_City || !d.Country) {
      console.warn('MapView: Invalid data item:', d);
      return;
    }
    const coords = portCoordinates[d.Port_City];
    if (coords) {
      L.marker(coords)
        .addTo(map.value)
        .bindPopup(`
          <div class="popup-content max-w-[300px]">
            <h3>${d.Country} - ${d.Port_City} (${d.Year})</h3>
            <p><b>Total Procedures:</b> ${d.Total_Procedures || 'N/A'}</p>
            <p><b>Success Rate:</b> ${d.Successful_Outcomes_Percent || 'N/A'}%</p>
            <p><b>Economic Impact:</b> $${Number(d.Economic_Impact_USD || 0).toLocaleString()}</p>
            <p><b>Local Professionals Trained:</b> ${d.Local_Professionals_Trained || 'N/A'}</p>
            <p><b>Patient QOL Improvement:</b> ${d.Patient_QOL_Improvement_Percent || 'N/A'}%</p>
          </div>
        `);
      console.log('MapView: Added marker:', d.Port_City, coords);
    } else {
      console.warn('MapView: Coordinates not found for:', d.Port_City);
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
