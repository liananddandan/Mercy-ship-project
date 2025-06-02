<template>
  <div class="cost-benefit-matrix">
    <h2 class="matrix-title">Cost-Benefit Analysis Matrix - Bubble Chart (Scatter Plot)</h2>
    
    <div class="matrix-description">
      <p>Analysis of procedure costs, outcomes, and volumes to identify cost-effective interventions:</p>
      <ul>
        <li>Cost per procedure vs. Success rate</li>
        <li>Volume of procedures vs. ROI</li>
        <li>Cost-effectiveness by procedure type</li>
      </ul>
    </div>

    <div class="controls">
      <div class="control-group">
        <label>Time Period:</label>
        <select v-model="selectedYear" @change="updateChart">
          <option value="all">All Years</option>
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>
      <div class="control-group">
        <label>View Mode:</label>
        <select v-model="viewMode" @change="updateChart">
          <option value="cost">Cost vs Success</option>
          <option value="roi">Volume vs ROI</option>
          <option value="effectiveness">Cost-Effectiveness</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      Loading data...
    </div>

    <div v-else-if="error" class="error-state">
      Error: {{ error }}
    </div>

    <div v-else class="chart-container">
      <v-chart :option="chartOption" autoresize style="height: 600px;" />
    </div>

    <div class="metrics-summary" v-if="!loading && !error">
      <h3>Key Metrics</h3>
      <div class="metrics-grid">
        <div class="metric-card">
          <h4>Most Cost-Effective</h4>
          <p>{{ mostCostEffective }}</p>
        </div>
        <div class="metric-card">
          <h4>Highest ROI</h4>
          <p>{{ highestROI }}</p>
        </div>
        <div class="metric-card">
          <h4>Best Success Rate</h4>
          <p>{{ bestSuccessRate }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import VChart from 'vue-echarts';
import Papa from 'papaparse';

const loading = ref(true);
const error = ref(null);
const selectedYear = ref('all');
const viewMode = ref('cost');
const procedureData = ref([]);

// Load data from CSV file
const loadData = async () => {
  try {
    loading.value = true;
    const response = await fetch('/src/data/cost_benefit_analysis.csv');
    const csvText = await response.text();
    
    Papa.parse(csvText, {
      header: true,
      complete: (results) => {
        procedureData.value = results.data;
        loading.value = false;
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        error.value = 'Failed to load data';
        loading.value = false;
      }
    });
  } catch (err) {
    console.error('Error loading data:', err);
    error.value = 'Failed to load data';
    loading.value = false;
  }
};

const availableYears = computed(() => {
  const years = new Set(procedureData.value.map(item => item.Year));
  return Array.from(years).sort().reverse();
});

const filteredData = computed(() => {
  if (selectedYear.value === 'all') {
    return procedureData.value;
  }
  return procedureData.value.filter(item => item.Year === selectedYear.value);
});

const chartOption = computed(() => {
  const data = filteredData.value.map(item => ({
    name: item.Procedure,
    value: [
      viewMode.value === 'cost' ? Number(item.Cost) : 
      viewMode.value === 'roi' ? Number(item.Volume) : 
      Number(item.Cost) / Number(item.Success_Rate),
      viewMode.value === 'cost' ? Number(item.Success_Rate) :
      viewMode.value === 'roi' ? Number(item.ROI) :
      Number(item.Success_Rate),
      Number(item.Volume)
    ]
  }));

  return {
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const data = params.data;
        const item = filteredData.value.find(d => d.Procedure === data.name);
        return `${data.name}<br/>
                ${viewMode.value === 'cost' ? 
                  `Cost: $${data.value[0]}<br/>Success Rate: ${data.value[1]}%` :
                  viewMode.value === 'roi' ?
                  `Volume: ${data.value[0]}<br/>ROI: ${data.value[1]}x` :
                  `Cost-Effectiveness: $${data.value[0]}<br/>Success Rate: ${data.value[1]}%`}<br/>
                Volume: ${data.value[2]}<br/>
                Training Hours: ${item.Training_Hours}<br/>
                Equipment Cost: $${item.Equipment_Cost}<br/>
                Follow-up Rate: ${item.Follow_Up_Rate}%`;
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: viewMode.value === 'cost' ? 'Cost per Procedure ($)' :
             viewMode.value === 'roi' ? 'Volume' :
             'Cost-Effectiveness ($/%)',
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: {
        formatter: viewMode.value === 'cost' ? '${value}' :
                  viewMode.value === 'roi' ? '{value}' :
                  '${value}'
      }
    },
    yAxis: {
      type: 'value',
      name: viewMode.value === 'cost' ? 'Success Rate (%)' :
             viewMode.value === 'roi' ? 'ROI (x)' :
             'Success Rate (%)',
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: {
        formatter: viewMode.value === 'cost' ? '{value}%' :
                  viewMode.value === 'roi' ? '{value}x' :
                  '{value}%'
      }
    },
    series: [{
      type: 'scatter',
      symbolSize: function(data) {
        return Math.sqrt(data[2]) * 5;
      },
      data: data,
      label: {
        show: true,
        formatter: function(params) {
          return params.data.name;
        },
        position: 'top'
      },
      emphasis: {
        focus: 'self',
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        }
      }
    }]
  };
});

const mostCostEffective = computed(() => {
  const data = filteredData.value.map(item => ({
    procedure: item.Procedure,
    effectiveness: Number(item.Cost) / Number(item.Success_Rate)
  }));
  const mostEffective = data.reduce((a, b) => 
    a.effectiveness < b.effectiveness ? a : b
  );
  return `${mostEffective.procedure} ($${mostEffective.effectiveness.toFixed(2)}/%)`;
});

const highestROI = computed(() => {
  const data = filteredData.value.map(item => ({
    procedure: item.Procedure,
    roi: Number(item.ROI)
  }));
  const highest = data.reduce((a, b) => 
    a.roi > b.roi ? a : b
  );
  return `${highest.procedure} (${highest.roi}x)`;
});

const bestSuccessRate = computed(() => {
  const data = filteredData.value.map(item => ({
    procedure: item.Procedure,
    successRate: Number(item.Success_Rate)
  }));
  const best = data.reduce((a, b) => 
    a.successRate > b.successRate ? a : b
  );
  return `${best.procedure} (${best.successRate}%)`;
});

const updateChart = () => {
  // Data is already filtered through computed properties
  // No need for additional loading state
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.cost-benefit-matrix {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.matrix-title {
  font-size: 1.5em;
  color: #2c3e50;
  margin-bottom: 1em;
}

.matrix-description {
  margin-bottom: 2em;
  color: #666;
}

.matrix-description ul {
  list-style-type: none;
  padding-left: 1em;
}

.matrix-description li {
  margin: 0.5em 0;
  position: relative;
}

.matrix-description li:before {
  content: "•";
  color: #3498db;
  position: absolute;
  left: -1em;
}

.controls {
  display: flex;
  gap: 20px;
  margin-bottom: 2em;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-group label {
  font-weight: 500;
  color: #666;
}

.control-group select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
}

.chart-container {
  margin: 2em 0;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 1em;
}

.metrics-summary {
  margin-top: 2em;
}

.metrics-summary h3 {
  color: #2c3e50;
  margin-bottom: 1em;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.metric-card {
  background: #f8f9fa;
  padding: 1em;
  border-radius: 4px;
  text-align: center;
}

.metric-card h4 {
  color: #666;
  margin-bottom: 0.5em;
}

.metric-card p {
  color: #2c3e50;
  font-weight: 500;
}

.loading-state, .error-state {
  text-align: center;
  padding: 2em;
  color: #666;
}

.error-state {
  color: #e74c3c;
}
</style> 