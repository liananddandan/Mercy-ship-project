<template>
  <div class="patient-journey-sankey">
    <h2 class="chart-title">Patient Journey Timeline</h2>
    <div class="chart-description">
      <p>Visualizing the flow of patients through different stages of care:</p>
      <ul>
        <li>Initial Screening</li>
        <li>Pre-operative Care</li>
        <li>Surgery</li>
        <li>Post-operative Care</li>
        <li>Follow-up</li>
      </ul>
    </div>
    <v-chart :option="chartOption" autoresize style="height: 500px; width: 100%;" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import VChart from 'vue-echarts';

// Sample data for the patient journey with more realistic numbers
const nodes = [
  { name: 'Initial Screening' },
  { name: 'Pre-operative Care' },
  { name: 'Surgery' },
  { name: 'Post-operative Care' },
  { name: 'Follow-up' }
];

const links = [
  { source: 'Initial Screening', target: 'Pre-operative Care', value: 1500 },
  { source: 'Initial Screening', target: 'Not Eligible', value: 300 },
  { source: 'Pre-operative Care', target: 'Surgery', value: 1200 },
  { source: 'Pre-operative Care', target: 'Cancelled', value: 150 },
  { source: 'Surgery', target: 'Post-operative Care', value: 1150 },
  { source: 'Surgery', target: 'Complications', value: 50 },
  { source: 'Post-operative Care', target: 'Follow-up', value: 1100 },
  { source: 'Post-operative Care', target: 'Extended Care', value: 50 }
];

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    triggerOn: 'mousemove',
    backgroundColor: 'var(--color-background)',
    borderColor: 'var(--color-border)',
    textStyle: { color: 'var(--color-text)' },
    formatter: ({ data }) => {
      if (data.source && data.target) {
        return `${data.source} → ${data.target}<br/>Patients: ${data.value}`;
      }
      return data.name;
    }
  },
  series: [
    {
      type: 'sankey',
      data: nodes,
      links: links,
      emphasis: { focus: 'adjacency' },
      lineStyle: {
        color: 'gradient',
        curveness: 0.5
      },
      label: {
        color: 'var(--color-text)',
        fontWeight: 'bold',
        fontSize: 14,
        position: 'right'
      },
      itemStyle: {
        borderColor: 'var(--color-border)',
        borderWidth: 1
      },
      levels: [
        {
          depth: 0,
          itemStyle: {
            color: '#fbbf24'
          },
          lineStyle: {
            color: 'gradient',
            opacity: 0.6
          }
        },
        {
          depth: 1,
          itemStyle: {
            color: '#60a5fa'
          }
        },
        {
          depth: 2,
          itemStyle: {
            color: '#34d399'
          }
        },
        {
          depth: 3,
          itemStyle: {
            color: '#818cf8'
          }
        },
        {
          depth: 4,
          itemStyle: {
            color: '#f472b6'
          }
        }
      ]
    }
  ]
}));
</script>

<style scoped>
.patient-journey-sankey {
  background: var(--color-background);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  margin: 2rem 0;
}

.chart-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-heading);
}

.chart-description {
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.chart-description p {
  margin-bottom: 0.5rem;
}

.chart-description ul {
  list-style-type: none;
  padding-left: 1rem;
}

.chart-description li {
  margin-bottom: 0.25rem;
  position: relative;
  padding-left: 1.5rem;
}

.chart-description li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: var(--color-accent);
}
</style> 