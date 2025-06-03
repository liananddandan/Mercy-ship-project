<template>
  <div class="resource-allocation-dashboard">
    <h2 class="dashboard-title">Resource Allocation Dashboard - Heat Map</h2>
    
    <div class="dashboard-description">
      <p>Monitor and optimize resource utilization across different specialties and departments:</p>
      <ul>
        <li>Medical staff distribution</li>
        <li>Equipment utilization rates</li>
        <li>Operating room usage</li>
        <li>Bed occupancy rates</li>
      </ul>
    </div>

    <div class="charts-grid">
      <!-- Staff Distribution Heat Map -->
      <div class="chart-container">
        <h3>Medical Staff Distribution</h3>
        <div class="chart-wrapper">
          <v-chart :option="staffDistributionOption" autoresize style="height: 400px;" />
        </div>
      </div>

      <!-- Equipment Utilization Heat Map -->
      <div class="chart-container">
        <h3>Equipment Utilization</h3>
        <div class="chart-wrapper">
          <v-chart :option="equipmentUtilizationOption" autoresize style="height: 400px;" />
        </div>
      </div>

      <!-- Operating Room Usage Heat Map -->
      <div class="chart-container">
        <h3>Operating Room Usage</h3>
        <div class="chart-wrapper">
          <v-chart :option="orUsageOption" autoresize style="height: 400px;" />
        </div>
      </div>

      <!-- Bed Occupancy Heat Map -->
      <div class="chart-container">
        <h3>Bed Occupancy Rates</h3>
        <div class="chart-wrapper">
          <v-chart :option="bedOccupancyOption" autoresize style="height: 400px;" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import VChart from 'vue-echarts';

// Sample data for staff distribution
const staffData = [
  { specialty: 'Surgery', staff: 25, utilization: 85 },
  { specialty: 'Anesthesiology', staff: 15, utilization: 90 },
  { specialty: 'Nursing', staff: 40, utilization: 75 },
  { specialty: 'Pediatrics', staff: 20, utilization: 80 },
  { specialty: 'Orthopedics', staff: 18, utilization: 88 },
  { specialty: 'Ophthalmology', staff: 12, utilization: 82 }
];

// Sample data for equipment utilization
const equipmentData = [
  { equipment: 'Surgical Tools', utilization: 92 },
  { equipment: 'Anesthesia Machines', utilization: 88 },
  { equipment: 'Patient Monitors', utilization: 95 },
  { equipment: 'Imaging Equipment', utilization: 78 },
  { equipment: 'Lab Equipment', utilization: 85 }
];

// Sample data for OR usage
const orData = [
  { time: '08:00', usage: 75 },
  { time: '10:00', usage: 90 },
  { time: '12:00', usage: 85 },
  { time: '14:00', usage: 88 },
  { time: '16:00', usage: 82 }
];

// Sample data for bed occupancy
const bedData = [
  { ward: 'Surgery', occupancy: 85 },
  { ward: 'Pediatrics', occupancy: 78 },
  { ward: 'ICU', occupancy: 92 },
  { ward: 'Recovery', occupancy: 88 },
  { ward: 'General', occupancy: 75 }
];

// Staff Distribution Heat Map
const staffDistributionOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: function(params) {
      return `${params.name}<br/>Staff: ${params.value[1]}<br/>Utilization: ${params.value[2]}%`;
    }
  },
  grid: {
    top: '15%',
    left: '20%',
    right: '10%',
    bottom: '35%'
  },
  xAxis: {
    type: 'category',
    data: staffData.map(item => item.specialty),
    axisLabel: {
      interval: 0,
      rotate: 45,
      fontSize: 12,
      margin: 15
    }
  },
  yAxis: {
    type: 'category',
    data: ['Staff Count', 'Utilization'],
    name: 'Metrics',
    nameLocation: 'middle',
    nameGap: 50
  },
  visualMap: {
    min: 0,
    max: 100,
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: '5%',
    itemWidth: 20,
    itemHeight: 150,
    textStyle: {
      fontSize: 12
    },
    inRange: {
      color: ['#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026']
    }
  },
  series: [{
    type: 'heatmap',
    data: staffData.flatMap(item => [
      [item.specialty, 'Staff Count', item.staff],
      [item.specialty, 'Utilization', item.utilization]
    ]),
    label: {
      show: true,
      formatter: function(params) {
        return params.value[2];
      },
      fontSize: 12
    }
  }]
}));

// Equipment Utilization Heat Map
const equipmentUtilizationOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: function(params) {
      return `${params.name}<br/>Utilization: ${params.value[1]}%`;
    }
  },
  grid: {
    top: '15%',
    left: '20%',
    right: '10%',
    bottom: '35%'
  },
  xAxis: {
    type: 'category',
    data: equipmentData.map(item => item.equipment),
    axisLabel: {
      interval: 0,
      rotate: 45,
      fontSize: 12,
      margin: 15
    }
  },
  yAxis: {
    type: 'category',
    data: ['Utilization'],
    name: 'Metrics',
    nameLocation: 'middle',
    nameGap: 50
  },
  visualMap: {
    min: 0,
    max: 100,
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: '5%',
    itemWidth: 20,
    itemHeight: 150,
    textStyle: {
      fontSize: 12
    },
    inRange: {
      color: ['#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026']
    }
  },
  series: [{
    type: 'heatmap',
    data: equipmentData.map(item => [item.equipment, 'Utilization', item.utilization]),
    label: {
      show: true,
      formatter: function(params) {
        return params.value[2] + '%';
      },
      fontSize: 12
    }
  }]
}));

// Operating Room Usage Heat Map
const orUsageOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: function(params) {
      return `${params.name}<br/>Usage: ${params.value[1]}%`;
    }
  },
  grid: {
    top: '15%',
    left: '20%',
    right: '10%',
    bottom: '35%'
  },
  xAxis: {
    type: 'category',
    data: orData.map(item => item.time),
    name: 'Time Slot',
    nameLocation: 'middle',
    nameGap: 30,
    axisLabel: {
      fontSize: 12,
      margin: 15
    }
  },
  yAxis: {
    type: 'category',
    data: ['Usage'],
    name: 'Metrics',
    nameLocation: 'middle',
    nameGap: 50
  },
  visualMap: {
    min: 0,
    max: 100,
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: '5%',
    itemWidth: 20,
    itemHeight: 150,
    textStyle: {
      fontSize: 12
    },
    inRange: {
      color: ['#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026']
    }
  },
  series: [{
    type: 'heatmap',
    data: orData.map(item => [item.time, 'Usage', item.usage]),
    label: {
      show: true,
      formatter: function(params) {
        return params.value[2] + '%';
      },
      fontSize: 12
    }
  }]
}));

// Bed Occupancy Heat Map
const bedOccupancyOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: function(params) {
      return `${params.name}<br/>Occupancy: ${params.value[1]}%`;
    }
  },
  grid: {
    top: '15%',
    left: '20%',
    right: '10%',
    bottom: '35%'
  },
  xAxis: {
    type: 'category',
    data: bedData.map(item => item.ward),
    name: 'Ward',
    nameLocation: 'middle',
    nameGap: 30,
    axisLabel: {
      fontSize: 12,
      margin: 15
    }
  },
  yAxis: {
    type: 'category',
    data: ['Occupancy'],
    name: 'Metrics',
    nameLocation: 'middle',
    nameGap: 50
  },
  visualMap: {
    min: 0,
    max: 100,
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: '5%',
    itemWidth: 20,
    itemHeight: 150,
    textStyle: {
      fontSize: 12
    },
    inRange: {
      color: ['#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026']
    }
  },
  series: [{
    type: 'heatmap',
    data: bedData.map(item => [item.ward, 'Occupancy', item.occupancy]),
    label: {
      show: true,
      formatter: function(params) {
        return params.value[2] + '%';
      },
      fontSize: 12
    }
  }]
}));
</script>

<style scoped>
.resource-allocation-dashboard {
  background: var(--color-background);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  margin: 2rem 0;
}

.dashboard-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-heading);
}

.dashboard-description {
  margin-bottom: 2rem;
  color: var(--color-text);
  max-width: 800px;
}

.dashboard-description p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.dashboard-description ul {
  list-style-type: none;
  padding-left: 1rem;
}

.dashboard-description li {
  margin-bottom: 0.5rem;
  position: relative;
  padding-left: 1.5rem;
  font-size: 1.1rem;
}

.dashboard-description li::before {
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
  .resource-allocation-dashboard {
    padding: 1rem;
  }
  
  .dashboard-title {
    font-size: 1.5rem;
  }
  
  .chart-container {
    min-height: 450px;
  }
}
</style> 