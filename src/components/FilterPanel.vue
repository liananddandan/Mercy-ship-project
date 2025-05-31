<template>
  <div class="filter-panel">
    <div class="selected-year-text">
      Selected Year:
      <span>{{ selectedYear !== null ? selectedYear : 'All Years' }}</span>
      <button v-if="selectedYear !== null" @click="resetYear" class="reset-btn">Reset</button>
    </div>
    <v-chart
      :option="chartOption"
      autoresize
      style="height: 200px; width: 100%; cursor: pointer;"
      @click="handleChartClick"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import VChart from 'vue-echarts';

const props = defineProps({
  procedures: {
    type: Array,
    default: () => [],
  },
  year: {
    type: Number,
    default: null,
  }
});
const emit = defineEmits(['update:year']);

const selectedYear = ref(props.year);

watch(() => props.year, (newVal) => {
  selectedYear.value = newVal;
});

const yearTotals = computed(() => {
  const totals = {};
  props.procedures.forEach((item) => {
    const y = String(item.Year).trim();
    if (!totals[y]) totals[y] = 0;
    const sum = Object.entries(item).reduce((acc, [key, val]) => {
      if (key === 'Year' || key === 'Country' || key === 'Port_City') return acc;
      return acc + (Number(val) || 0);
    }, 0);
    totals[y] += sum;
  });
  return totals;
});

const years = computed(() => Object.keys(yearTotals.value).sort());

const data = computed(() => years.value.map(y => yearTotals.value[y] || 0));

const chartOption = computed(() => {
  const _ = selectedYear.value
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    xAxis: {
      type: 'category',
      data: years.value,
      axisTick: { alignWithLabel: true },
      axisLabel: { color: '#374151' }
    },
    yAxis: {
      type: 'value',
      name: 'Number of Treatments',
      axisLabel: { color: '#374151' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '20%',
      containLabel: true
    },
    series: [
      {
        name: 'Treatments',
        type: 'bar',
        data: data.value,
        itemStyle: {
          color: (params) => {
            const year = Number(years.value[params.dataIndex]);
            console.log('Bar index:', params.dataIndex, 'year:', year, 'selectedYear:', selectedYear.value);
            return selectedYear.value === year ? '#2563eb' : '#bfdbfe';
          }
        },
        emphasis: {
          itemStyle: { color: '#1e40af' }
        }
      }
    ]
  };
});

function handleChartClick(params) {
  if (!params || typeof params.dataIndex !== 'number') return;
  const clickedYear = Number(years.value[params.dataIndex]);
  if (selectedYear.value === clickedYear) {
    selectedYear.value = null;
  } else {
    selectedYear.value = clickedYear;
  }
  emit('update:year', selectedYear.value);
}

function resetYear() {
  selectedYear.value = null;
  emit('update:year', null);
}

watch(selectedYear, (newVal) => {
  console.log('selectedYear changed:', newVal);
});
</script>

<style scoped>
.filter-panel {
  width: 100%;
}

.panel-label {
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
  color: #1e3a8a;
}

.selected-year-text {
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #374151;
}

.reset-btn {
  margin-left: 12px;
  background-color: #dc2626;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.3s ease;
}
.reset-btn:hover {
  background-color: #b91c1c;
}
</style>
