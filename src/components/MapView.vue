<template>
    <div id="map" class="h-[500px] mb-4 border border-gray-300"></div>
  </template>
  
  <script setup>
  import { ref, watch, onMounted, nextTick } from 'vue';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  
  // 修复 Leaflet 图标问题
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
  
  // 接收 filteredMetrics 数据
  const props = defineProps(['metrics']);
  
  // 港口坐标（基于 impact_metrics.csv 中的 Port_City）
  const portCoordinates = {
    Dakar: [14.6928, -17.4467], // Senegal
    Conakry: [9.6412, -13.5783], // Guinea
    Douala: [4.0511, 9.7679], // Cameroon
    Lomé: [6.1256, 1.2258], // Togo
    Cotonou: [6.3703, 2.3912], // Benin
    Freetown: [8.4657, -13.2317], // Sierra Leone
    Monrovia: [6.3156, -10.8074], // Liberia
    'Pointe-Noire': [-4.7692, 11.8664], // Congo
    Toamasina: [-18.1492, 49.4023], // Madagascar
    Banjul: [13.4549, -16.5790], // Gambia
  };
  
  const map = ref(null);
  const mapError = ref(null);
  
  const initMap = async () => {
    try {
      console.log('MapView: 初始化地图');
      await nextTick(); // 确保 DOM 已渲染
      const mapContainer = document.getElementById('map');
      if (!mapContainer) {
        throw new Error('Map container #map not found');
      }
      map.value = L.map('map', {
        maxBounds: [
          [-35, -20], // 非洲西南角
          [37, 55], // 非洲东北角
        ],
        maxBoundsViscosity: 1.0, // 防止拖出边界
        minZoom: 3, // 限制最小缩放
        maxZoom: 10, // 限制最大缩放
      }).setView([0, 20], 4); // 初始中心为非洲
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        noWrap: true, // 禁用无限滚动
      }).addTo(map.value);
      console.log('MapView: 地图初始化成功');
      map.value.invalidateSize(); // 确保地图尺寸正确
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
    // 清除现有标记
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
  
  // 初始化地图
  onMounted(async () => {
    await initMap();
    updateMarkers(props.metrics); // 初次更新标记
  });
  
  // 监听 metrics 变化，更新标记
  watch(() => props.metrics, updateMarkers, { deep: true });
  </script>
  
  <style scoped>
  #map {
    width: 100%;
    min-height: 500px !important; /* 确保高度生效 */
    position: relative;
  }
  </style>