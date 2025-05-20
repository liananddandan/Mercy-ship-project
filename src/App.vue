<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4">Mercy Ships Africa Charity Visualization</h1>
    <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>
    <div v-else-if="loading" class="text-blue-500 mb-4">正在加载数据...</div>
    <div v-else>
      <ErrorBoundary @error="handleComponentError">
        <FilterPanel @update="updateData" :procedures="procedures" />
      </ErrorBoundary>
      <ErrorBoundary @error="handleComponentError">
        <MapView :metrics="filteredMetrics" />
      </ErrorBoundary>
      <ErrorBoundary @error="handleComponentError">
        <MetricDashboard :metrics="filteredMetrics" />
      </ErrorBoundary>
      <ErrorBoundary @error="handleComponentError">
        <ProcedureChart :procedures="filteredProcedures" />
      </ErrorBoundary>
      <ErrorBoundary @error="handleComponentError">
        <DemographicChart :demographics="filteredDemographics" />
      </ErrorBoundary>
      <p>已选择：年份 {{ selectedYear || '无' }}，港口 {{ selectedPort || '无' }}，程序 {{ selectedProcedure || '无' }}</p>
      <p>过滤后的 Impact Metrics 记录数：{{ filteredMetrics.length }}</p>
      <p>Patient Demographics 记录数：{{ filteredDemographics.length }}</p>
      <p>Procedures 记录数：{{ filteredProcedures.length }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Papa from 'papaparse';
import FilterPanel from '@/components/FilterPanel.vue';
import MapView from '@/components/MapView.vue';
import MetricDashboard from '@/components/MetricDashboard.vue';
import ProcedureChart from '@/components/ProcedureChart.vue';
import DemographicChart from '@/components/DemographicChart.vue';
import ErrorBoundary from '@/components/ErrorBoundary.vue';

const impactMetrics = ref([]);
const patientDemographics = ref([]);
const procedures = ref([]);
const selectedYear = ref('');
const selectedPort = ref('');
const selectedProcedure = ref('');
const error = ref(null);
const loading = ref(true);

const handleComponentError = (err) => {
  console.error('App: 组件错误:', err);
  error.value = `组件错误：${err.message}`;
};

const loadData = async () => {
  console.log('App: 开始加载数据...');
  const loadCSV = (url) =>
    new Promise((resolve, reject) => {
      console.log(`App: 正在获取 ${url}`);
      Papa.parse(url, {
        download: true,
        header: true,
        complete: (result) => {
          console.log(`App: 加载 ${url} 完成：${result.data.length} 条记录`);
          resolve(result.data);
        },
        error: (err) => {
          console.error(`App: 加载 ${url} 失败：`, err);
          reject(err);
        },
      });
    });

  try {
    impactMetrics.value = (await loadCSV('/data/impact_metrics.csv')).map((d) => ({
      ...d,
      Year: String(d.Year || '').trim(),
      Country: String(d.Country || '').trim(),
      Port_City: String(d.Port_City || '').trim(),
    }));
    patientDemographics.value = (await loadCSV('/data/patient_demographics.csv')).map((d) => ({
      ...d,
      Year: String(d.Year || '').trim(),
      Country: String(d.Country || '').trim(),
    }));
    procedures.value = (await loadCSV('/data/procedures_by_location.csv')).map((d) => ({
      ...d,
      Year: String(d.Year || '').trim(),
      Country: String(d.Country || '').trim(),
    }));
    console.log('App: 所有数据加载成功');
    console.log('App: impactMetrics 示例:', impactMetrics.value.slice(0, 2));
    console.log('App: 2013 和 Douala 记录:', impactMetrics.value.filter(d => d.Year === '2013' && d.Port_City === 'Douala'));
  } catch (err) {
    error.value = `数据加载失败：${err.message}`;
    console.error('App: 加载错误:', err);
  } finally {
    loading.value = false;
  }
};

const filteredMetrics = computed(() => {
  console.log('App: 计算 filteredMetrics，selectedYear:', selectedYear.value, 'selectedPort:', selectedPort.value);
  try {
    return impactMetrics.value.filter((d) => {
      if (!d || !d.Year || !d.Country || !d.Port_City) {
        console.warn('App: 无效数据项:', d);
        return false;
      }
      const year = String(d.Year).trim();
      const port = `${String(d.Country).trim()} - ${String(d.Port_City).trim()}`;
      const matchesYear = !selectedYear.value || year === String(selectedYear.value).trim();
      const matchesPort = !selectedPort.value || port === String(selectedPort.value).trim();
      console.log('App: 检查数据项:', { year, port, matchesYear, matchesPort, selectedPort: selectedPort.value });
      return matchesYear && matchesPort;
    });
  } catch (err) {
    console.error('App: 过滤数据错误:', err);
    error.value = `过滤数据失败：${err.message}`;
    return [];
  }
});

const filteredDemographics = computed(() => {
  return patientDemographics.value.filter((d) => {
    const year = String(d.Year).trim();
    const country = String(d.Country).trim();
    const matchesYear = !selectedYear.value || year === String(selectedYear.value).trim();
    const matchesPort = !selectedPort.value || country === (selectedPort.value.split(' - ')[0] || '');
    return matchesYear && matchesPort;
  });
});

const filteredProcedures = computed(() => {
  return procedures.value.filter((d) => {
    const year = String(d.Year).trim();
    const country = String(d.Country).trim();
    const matchesYear = !selectedYear.value || year === String(selectedYear.value).trim();
    const matchesPort = !selectedPort.value || country === (selectedPort.value.split(' - ')[0] || '');
    const matchesProcedure = !selectedProcedure.value || Object.keys(d).some(key => key === selectedProcedure.value && Number(d[key]) > 0);
    return matchesYear && matchesPort && matchesProcedure;
  });
});

const updateData = ({ year, port, procedure }) => {
  console.log('App: 更新过滤器：', { year, port, procedure });
  try {
    selectedYear.value = year;
    selectedPort.value = port;
    selectedProcedure.value = procedure;
  } catch (err) {
    console.error('App: 更新过滤器错误:', err);
    error.value = `更新过滤器失败：${err.message}`;
  }
};

console.log('App: 初始化');
loadData();
</script>