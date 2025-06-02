<template>
  <div class="container">
    <!-- Top Banner -->
    <section class="banner">
      <img class="banner-icon" src="/images/logo.svg" alt="Logo" />
      <h1 class="banner-title">
        Mercy Ships Medical Missions - Visualization
        <span class="banner-subtitle">Make a difference in Africa together</span>
      </h1>
    </section>

    <div class="main-layout">
      <!-- Left Menu -->
      <aside class="sidebar left-menu">
        <h3>Menu</h3>
        <ul>
          <li>
            <button :class="{ active: currentView === 'mercy-ships' }" @click="currentView = 'mercy-ships'">Mercy Ships</button>
          </li>
          <li>
            <button :class="{ active: currentView === 'map' }" @click="currentView = 'map'">Map</button>
          </li>
          <li>
            <button :class="{ active: currentView === 'medical' }" @click="currentView = 'medical'">Medical
              Statistics</button>
          </li>
          <li>
            <button :class="{ active: currentView === 'demographics' }"
              @click="currentView = 'demographics'">Demographics</button>
          </li>
          <li>
            <button :class="{ active: currentView === 'journey' }" @click="currentView = 'journey'">Patient Journey</button>
          </li>
          <li>
            <button :class="{ active: currentView === 'resources' }" @click="currentView = 'resources'">Resource Allocation</button>
          </li>
          <li>
            <button :class="{ active: currentView === 'impact' }" @click="currentView = 'impact'">Impact Analysis</button>
          </li>
          <li>
            <button :class="{ active: currentView === 'cost-benefit' }" @click="currentView = 'cost-benefit'">Cost-Benefit Analysis</button>
          </li>
          <li>
            <button :class="{ active: currentView === 'stories' }" @click="currentView = 'stories'">Patient Stories</button>
          </li>
          <li>
            <!-- 这里用a标签替代button，添加target="_blank"新窗口打开 -->
            <a href="https://mercyships.org.nz/get-involved/become-a-volunteer/" target="_blank"
              rel="noopener noreferrer" class="external-link">
              Volunteer
            </a>
          </li>
        </ul>
        <div class="copyright">© 2025 Mercy Ships Medical Missions</div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <ErrorBoundary @error="handleComponentError">
          <template v-if="currentView === 'mercy-ships'">
            <div class="mercy-ships-intro">
              <img src="/images/mercy-shipsintro1920x690.webp" alt="Mercy Ships Introduction" class="intro-image" />
            </div>
          </template>

          <template v-else-if="currentView === 'map'">
            <div class="map-container">
              <MapView :metrics="filteredMetrics" :selectedYear="selectedYear" />
            </div>
            <div class="filter-panel">
              <FilterPanel v-model:year="selectedYear" :procedures="procedures" />
            </div>
          </template>

          <template v-else-if="currentView === 'medical'">
            <ProcedureTrendChart :procedures="procedures" />
            <!-- More medical stats components can be added here -->
          </template>

          <template v-else-if="currentView === 'demographics'">
            <DemographicChart :demographics="filteredDemographics" />
          </template>

          <template v-else-if="currentView === 'journey'">
            <PatientJourneySankey />
          </template>

          <template v-else-if="currentView === 'resources'">
            <ResourceAllocationDashboard />
          </template>

          <template v-else-if="currentView === 'impact'">
            <ImpactAnalysisMatrix />
          </template>

          <template v-else-if="currentView === 'cost-benefit'">
            <CostBenefitMatrix />
          </template>

          <template v-else-if="currentView === 'stories'">
            <AnnualStories />
          </template>

          <template v-else>
            <div class="welcome-message">
              <h2>Welcome to Mercy Ships Medical Missions Visualization</h2>
              <p>Please select a view from the menu to begin exploring our data.</p>
            </div>
          </template>
        </ErrorBoundary>
      </main>

      <!-- Right Sidebar (only show for Map view) -->
      <aside v-if="currentView === 'map'" class="sidebar right-bar">
        <ErrorBoundary @error="handleComponentError">
          <MetricDashboard :metrics="filteredMetrics" />
        </ErrorBoundary>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Papa from 'papaparse';
import FilterPanel from '@/components/FilterPanel.vue';
import MapView from '@/components/MapView.vue';
import MetricDashboard from '@/components/MetricDashboard.vue';
import DemographicChart from '@/components/DemographicChart.vue';
import ProcedureTrendChart from '@/components/ProcedureTrendChart.vue';
import ErrorBoundary from '@/components/ErrorBoundary.vue';
import AnnualStories from '@/components/AnnualStories.vue';
import PatientJourneySankey from '@/components/PatientJourneySankey.vue';
import ResourceAllocationDashboard from '@/components/ResourceAllocationDashboard.vue';
import ImpactAnalysisMatrix from '@/components/ImpactAnalysisMatrix.vue';
import CostBenefitMatrix from '@/components/CostBenefitMatrix.vue';


const impactMetrics = ref([]);
const patientDemographics = ref([]);
const procedures = ref([]);

const selectedYear = ref(2023);
const selectedPort = ref('');
const selectedProcedure = ref('');

const currentView = ref('map'); // Default to map view

const error = ref(null);
const loading = ref(true);

const handleComponentError = (err) => {
  error.value = `Component error: ${err.message}`;
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
    impactMetrics.value = (await loadCSV('/data/impact_metrics.csv')).map(d => ({
      ...d,
      Year: String(d.Year || '').trim(),
      Country: String(d.Country || '').trim(),
      Port_City: String(d.Port_City || '').trim(),
    }));
    patientDemographics.value = (await loadCSV('/data/patient_demographics.csv')).map(d => ({
      ...d,
      Year: String(d.Year || '').trim(),
      Country: String(d.Country || '').trim(),
    }));
    procedures.value = (await loadCSV('/data/procedures_by_location.csv')).map(d => ({
      ...d,
      Year: String(d.Year || '').trim(),
      Country: String(d.Country || '').trim(),
    }));
  } catch (err) {
    error.value = `Failed to load data: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

const filteredMetrics = computed(() => {
  return impactMetrics.value.filter(d => {
    const year = String(d.Year).trim();
    const port = `${String(d.Country).trim()} - ${String(d.Port_City).trim()}`;
    const matchesYear = !selectedYear.value || year === String(selectedYear.value).trim();
    const matchesPort = !selectedPort.value || port === String(selectedPort.value).trim();
    return matchesYear && matchesPort;
  });
});

const filteredDemographics = computed(() => patientDemographics.value);

loadData();
</script>



<style>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f0fe 0%, #f9fbff 100%);
  display: flex;
  flex-direction: column;
}

.banner {
  background: #003eab;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2rem;
  height: 5.5rem;
  border-radius: 0.75rem;
  margin: 1.5rem 2rem 0 2rem;
}

.banner-icon {
  width: 3.5rem;
  height: 3.5rem;
  margin-right: 1rem;
}

.banner-title {
  font-size: 1.8rem;
  /* 加大标题字体 */
  font-weight: 700;
  line-height: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  /* 标题和副标题间距 */
}

.main-layout {
  flex: 1;
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  margin: 1.5rem 2rem 2rem 2rem;
  min-height: 0;
}

.sidebar {
  width: 210px;
  min-width: 180px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  padding: 1.5rem 1rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: calc(100vh - 9rem);
}

.sidebar.left-menu {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgb(0 0 0 / 0.1);
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  width: 220px;
  font-family: 'Inter', sans-serif;
}

.sidebar.left-menu h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 1.5rem;
  text-align: center;
  user-select: none;
}

.sidebar.left-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.sidebar.left-menu li button {
  display: block;
  width: 100%;
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1e3a8a;
  background-color: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  user-select: none;
  text-align: left;
}

.sidebar.left-menu li button:hover {
  background-color: #e0e7ff;
  /* 淡蓝背景 */
  color: #2563eb;
  /* 亮蓝字 */
}

.sidebar.left-menu li button.active {
  background-color: #2563eb;
  /* 主蓝 */
  color: white;
  box-shadow: 0 0 10px #2563ebaa;
}

.sidebar.left-menu li button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.sidebar.left-menu .copyright {
  font-size: 0.8rem;
  color: #666;
  text-align: center;
  margin-top: auto;
  user-select: none;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.right-bar {
  margin-left: 0.5rem;
  gap: 2rem;
}

.sidebar h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
}

.sidebar ul {
  margin-bottom: 2rem;
}

.sidebar li {
  margin-bottom: 0.4rem;
}

.sidebar button {
  background: none;
  border: none;
  color: #1a237e;
  font-size: 1rem;
  cursor: pointer;
}

.sidebar button:hover {
  color: #2563eb;
}

.sidebar button.active {
  font-weight: 700;
  color: #2563eb;
}

.copyright {
  font-size: 0.85rem;
  color: #999;
  margin-top: auto;
}

.main-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: calc(100vh - 9rem);
  overflow-y: auto;
}

.map-container {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 1rem;
  min-height: 400px;
  max-height: 500px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  height: 320px;
}

.filter-panel {
  margin-bottom: 1rem;
}

.banner-subtitle {
  background-color: #f59e0b;
  /* Tailwind yellow-500 */
  color: #1f2937;
  /* 深灰色 */
  padding: 0.3rem 0.8rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.1rem;
  /* 副标题字体稍大 */
  line-height: 1;
  box-shadow: 0 2px 6px rgb(245 158 11 / 0.5);
  user-select: none;
}

.external-link {
  display: block;
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1e3a8a;
  text-decoration: none;
  border-radius: 8px;
  transition: background-color 0.3s ease, color 0.3s ease;
  user-select: none;
  text-align: left;
  cursor: pointer;
}

.external-link:hover {
  background-color: #e0e7ff;
  color: #2563eb;
}

.welcome-message {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  margin: 2rem auto;
  max-width: 800px;
}

.welcome-message h2 {
  color: #1e3a8a;
  font-size: 2rem;
  margin-bottom: 1rem;
}

.welcome-message p {
  color: #4b5563;
  font-size: 1.2rem;
  line-height: 1.6;
}

.mercy-ships-intro {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  margin: 2rem 0;
  text-align: center;
}

.intro-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

</style>
