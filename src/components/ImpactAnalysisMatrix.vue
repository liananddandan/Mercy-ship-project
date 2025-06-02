<template>
  <div class="impact-analysis-matrix">
    <h2 class="matrix-title">Impact Analysis Matrix</h2>
    
    <div class="matrix-description">
      <p>Multi-dimensional analysis of Mercy Ships' impact across different metrics:</p>
      <ul>
        <li>Economic impact vs. Quality of Life improvement</li>
        <li>Number of procedures vs. Success rate</li>
        <li>Training hours vs. Local professional development</li>
      </ul>
    </div>

    <div v-if="loading" class="loading-state">
      Loading data...
    </div>

    <div v-else-if="error" class="error-state">
      Error: {{ error }}
    </div>

    <div v-else-if="!impactData.length" class="no-data-state">
      No data available. Please check the data files.
    </div>

    <div v-else class="charts-grid">
      <!-- Economic Impact vs Quality of Life -->
      <div class="chart-container">
        <h3>Economic Impact vs. Quality of Life</h3>
        <div class="chart-wrapper">
          <v-chart :option="economicQualityOption" autoresize style="height: 400px;" />
        </div>
      </div>

      <!-- Procedures vs Success Rate -->
      <div class="chart-container">
        <h3>Procedures vs. Success Rate</h3>
        <div class="chart-wrapper">
          <v-chart :option="proceduresSuccessOption" autoresize style="height: 400px;" />
        </div>
      </div>

      <!-- Training vs Development -->
      <div class="chart-container">
        <h3>Training vs. Professional Development</h3>
        <div class="chart-wrapper">
          <v-chart :option="trainingDevelopmentOption" autoresize style="height: 400px;" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import VChart from 'vue-echarts';
import Papa from 'papaparse';

const impactData = ref([]);
const loading = ref(true);
const error = ref(null);

// Load data from CSV files
const loadData = async () => {
  try {
    const loadCSV = (url) =>
      new Promise((resolve, reject) => {
        Papa.parse(url, {
          download: true,
          header: true,
          complete: (result) => resolve(result.data),
          error: reject,
        });
      });

    const impactMetrics = await loadCSV('/data/impact_metrics.csv');
    
    // Process the data
    impactData.value = impactMetrics.map(metric => ({
      country: metric.Country,
      year: metric.Year,
      economicImpact: parseFloat(metric.Economic_Impact_USD) / 1000000, // Convert to millions
      qualityOfLife: parseFloat(metric.Patient_QOL_Improvement_Percent) || 0,
      procedures: parseInt(metric.Total_Procedures) || 0,
      successRate: parseFloat(metric.Successful_Outcomes_Percent) || 0,
      trainingHours: parseInt(metric.Training_Hours) || 0,
      development: parseInt(metric.Local_Professionals_Trained) || 0
    }));

    loading.value = false;
  } catch (err) {
    error.value = `Failed to load data: ${err.message}`;
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

// Economic Impact vs Quality of Life scatter plot
const economicQualityOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: function(params) {
      const data = params.data;
      return `${data.country} (${data.year})<br/>
              Economic Impact: $${data.economicImpact.toFixed(1)}M<br/>
              Quality of Life: ${data.qualityOfLife.toFixed(1)}%<br/>
              Procedures: ${data.procedures}`;
    }
  },
  grid: {
    top: '15%',
    left: '15%',
    right: '10%',
    bottom: '15%'
  },
  xAxis: {
    type: 'value',
    name: 'Economic Impact (Millions USD)',
    nameLocation: 'middle',
    nameGap: 30,
    min: 0,
    axisLabel: {
      formatter: '${value}M'
    }
  },
  yAxis: {
    type: 'value',
    name: 'Quality of Life Improvement (%)',
    nameLocation: 'middle',
    nameGap: 30,
    min: 0,
    max: 100,
    axisLabel: {
      formatter: '{value}%'
    }
  },
  visualMap: {
    show: true,
    dimension: 2,
    min: 0,
    max: 2000,
    inRange: {
      color: ['#91cc75', '#5470c6']
    },
    text: ['High', 'Low'],
    calculable: true
  },
  series: [{
    type: 'scatter',
    symbolSize: function(data) {
      return Math.sqrt(data.procedures) * 2;
    },
    data: impactData.value.map(item => ({
      value: [item.economicImpact, item.qualityOfLife, item.procedures],
      country: item.country,
      year: item.year,
      procedures: item.procedures
    })),
    label: {
      show: true,
      formatter: function(params) {
        return params.data.country;
      },
      position: 'top',
      fontSize: 10
    },
    emphasis: {
      focus: 'self',
      label: {
        show: true,
        fontSize: 12,
        fontWeight: 'bold'
      }
    }
  }]
}));

// Procedures vs Success Rate scatter plot
const proceduresSuccessOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: function(params) {
      const data = params.data;
      return `${data.country} (${data.year})<br/>
              Procedures: ${data.procedures}<br/>
              Success Rate: ${data.successRate.toFixed(1)}%<br/>
              Economic Impact: $${data.economicImpact.toFixed(1)}M`;
    }
  },
  grid: {
    top: '15%',
    left: '15%',
    right: '10%',
    bottom: '15%'
  },
  xAxis: {
    type: 'value',
    name: 'Number of Procedures',
    nameLocation: 'middle',
    nameGap: 30,
    min: 0,
    axisLabel: {
      formatter: '{value}'
    }
  },
  yAxis: {
    type: 'value',
    name: 'Success Rate (%)',
    nameLocation: 'middle',
    nameGap: 30,
    min: 90,
    max: 100,
    axisLabel: {
      formatter: '{value}%'
    }
  },
  visualMap: {
    show: true,
    dimension: 2,
    min: 0,
    max: 6000000,
    inRange: {
      color: ['#fac858', '#ee6666']
    },
    text: ['High', 'Low'],
    calculable: true
  },
  series: [{
    type: 'scatter',
    symbolSize: function(data) {
      return Math.sqrt(data.economicImpact) * 2;
    },
    data: impactData.value.map(item => ({
      value: [item.procedures, item.successRate, item.economicImpact],
      country: item.country,
      year: item.year,
      economicImpact: item.economicImpact
    })),
    label: {
      show: true,
      formatter: function(params) {
        return params.data.country;
      },
      position: 'top',
      fontSize: 10
    },
    emphasis: {
      focus: 'self',
      label: {
        show: true,
        fontSize: 12,
        fontWeight: 'bold'
      }
    }
  }]
}));

// Training vs Development scatter plot
const trainingDevelopmentOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: function(params) {
      const data = params.data;
      return `${data.country} (${data.year})<br/>
              Training Hours: ${data.trainingHours}<br/>
              Local Professionals Trained: ${data.development}<br/>
              Procedures: ${data.procedures}`;
    }
  },
  grid: {
    top: '15%',
    left: '15%',
    right: '10%',
    bottom: '15%'
  },
  xAxis: {
    type: 'value',
    name: 'Training Hours',
    nameLocation: 'middle',
    nameGap: 30,
    min: 0,
    axisLabel: {
      formatter: '{value}'
    }
  },
  yAxis: {
    type: 'value',
    name: 'Local Professionals Trained',
    nameLocation: 'middle',
    nameGap: 30,
    min: 0,
    axisLabel: {
      formatter: '{value}'
    }
  },
  visualMap: {
    show: true,
    dimension: 2,
    min: 0,
    max: 2000,
    inRange: {
      color: ['#73c0de', '#3ba272']
    },
    text: ['High', 'Low'],
    calculable: true
  },
  series: [{
    type: 'scatter',
    symbolSize: function(data) {
      return Math.sqrt(data.procedures) * 2;
    },
    data: impactData.value.map(item => ({
      value: [item.trainingHours, item.development, item.procedures],
      country: item.country,
      year: item.year,
      procedures: item.procedures
    })),
    label: {
      show: true,
      formatter: function(params) {
        return params.data.country;
      },
      position: 'top',
      fontSize: 10
    },
    emphasis: {
      focus: 'self',
      label: {
        show: true,
        fontSize: 12,
        fontWeight: 'bold'
      }
    }
  }]
}));
</script>

<style scoped>
.impact-analysis-matrix {
  background: var(--color-background);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  margin: 2rem 0;
}

.loading-state,
.error-state,
.no-data-state {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: var(--color-text);
  background: var(--color-background-soft);
  border-radius: 8px;
  margin: 1rem 0;
}

.error-state {
  color: #dc2626;
}

.matrix-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-heading);
}

.matrix-description {
  margin-bottom: 2rem;
  color: var(--color-text);
  max-width: 800px;
}

.matrix-description p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.matrix-description ul {
  list-style-type: none;
  padding-left: 1rem;
}

.matrix-description li {
  margin-bottom: 0.5rem;
  position: relative;
  padding-left: 1.5rem;
  font-size: 1.1rem;
}

.matrix-description li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: var(--color-accent);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.chart-container {
  background: var(--color-background-soft);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  min-height: 550px;
}

.chart-wrapper {
  position: relative;
  height: 100%;
  min-height: 450px;
}

.chart-container h3 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-heading);
  text-align: center;
}

@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    min-height: 500px;
  }
}

@media (max-width: 768px) {
  .impact-analysis-matrix {
    padding: 1rem;
  }
  
  .matrix-title {
    font-size: 1.5rem;
  }
  
  .chart-container {
    min-height: 450px;
  }
}
</style> 