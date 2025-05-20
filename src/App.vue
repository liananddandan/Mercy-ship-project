<template>
  <div class="container">
    <section class="banner">
      <div class="banner-content">
        <img class="banner-icon" src="/images/logo.svg" alt="Logo" />
        <h1 class="banner-title">Mercy Ships Africa Charity Visualization</h1>
      </div>
    </section>

    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-else-if="loading" class="loading-message">正在加载数据...</div>
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
  const loadCSV = (url) =>
    new Promise((resolve, reject) => {
      Papa.parse(url, {
        download: true,
        header: true,
        complete: (result) => resolve(result.data),
        error: reject,
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
  } catch (err) {
    error.value = `数据加载失败：${err.message}`;
    console.error('App: 加载错误:', err);
  } finally {
    loading.value = false;
  }
};

const filteredMetrics = computed(() => {
  return impactMetrics.value.filter((d) => {
    const year = String(d.Year).trim();
    const port = `${String(d.Country).trim()} - ${String(d.Port_City).trim()}`;
    const matchesYear = !selectedYear.value || year === String(selectedYear.value).trim();
    const matchesPort = !selectedPort.value || port === String(selectedPort.value).trim();
    return matchesYear && matchesPort;
  });
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
  selectedYear.value = year;
  selectedPort.value = port;
  selectedProcedure.value = procedure;
};

loadData();
</script>

<style scoped>
.container {
  margin: 0 auto;
  padding: 1.5rem 2rem;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #e8f0fe 0%, #f9fbff 100%);
  border-radius: 1rem;
  box-shadow: 0 8px 20px rgba(0, 62, 171, 0.1);
  color: #1e3a8a;
  min-height: 100vh;
  max-width: 1280px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header-card {
  position: relative;
  width: 100%;
  height: 10rem;
  /* 40 * 0.25rem */
  border-radius: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #d1d5db;
  /* gray-300 */
  background-color: #2563eb;
  /* blue-600 */
}

.header-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: #2563eb;
  opacity: 0.9;
  border-radius: 1rem;
  z-index: 0;
}

.header-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  /* text-2xl */
  font-weight: 700;
  /* font-bold */
  padding: 0 1.5rem;
  /* px-6 */
}

.header-icon {
  height: 0.25rem;
  /* h-1 */
  width: 0.25rem;
  /* w-1 */
  margin-right: 0.25rem;
  /* mr-1 */
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.error-message {
  color: #ef4444;
  /* red-500 */
  margin-bottom: 1rem;
}

.loading-message {
  color: #3b82f6;
  /* blue-500 */
  margin-bottom: 1rem;
}


/* banner */
/* Banner 区域背景与高度 */
.banner {
  background-color: #003EAB; /* Tailwind 的 blue-600 */
  height: 4.5rem;             /* 更紧凑的高度 */
  border-radius: 0.75rem;     /* rounded-xl */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 内容布局 */
.banner-content {
  display: flex;
  align-items: center;
  gap: 2rem;         /* 缩小图标与文字的间距 */
  z-index: 1;
  text-align: center;
}

/* 图标样式 */
.banner-icon {
  width: 4rem;
  height: 4rem;
}

/* 标题文字样式 */
.banner-title {
  font-size: 1.25rem;  /* text-xl 大小 */
  font-weight: 600;
  color: white;
  line-height: 1.2;
}

</style>
