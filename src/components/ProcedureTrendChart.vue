<template>
    <div class="procedure-trend-chart">
      <h2 class="chart-title">Yearly Trend by Procedure Type</h2>
      <div class="procedure-type-selector">
        <label v-for="type in procedureTypes" :key="type" class="type-checkbox">
          <input type="checkbox" :value="type" v-model="selectedTypes" />
          {{ type.replace('_', ' ') }}
        </label>
      </div>
      <v-chart
        v-if="years.length && series.length"
        :option="chartOption"
        autoresize
        style="height: 400px; width: 100%;"
      />
      <div v-else class="text-gray-400 text-sm">No data for selected types/years</div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  import VChart from 'vue-echarts';
  
  const procedureTypes = [
    'Maxillofacial',
    'General_Surgery',
    'Orthopedic',
    'Reconstructive_Plastic',
    'Womens_Health',
    'Ophthalmic',
    'Dental'
  ];
  
  const props = defineProps({
    procedures: {
      type: Array,
      required: true,
      default: () => [],
    }
  });
  
  const selectedTypes = ref([...procedureTypes]);
  
  // 计算所有出现过的年份（已排序）
  const years = computed(() => {
    const set = new Set();
    props.procedures.forEach(row => {
      if (row.Year) set.add(String(row.Year).trim());
    });
    return Array.from(set).sort();
  });
  
  // 计算各年份各类型手术总数
  const yearTypeTotals = computed(() => {
    const totals = {};
    props.procedures.forEach(row => {
      const year = String(row.Year).trim();
      if (!totals[year]) totals[year] = {};
      procedureTypes.forEach(type => {
        if (!totals[year][type]) totals[year][type] = 0;
        // 字符串转数字，有些数据本身就是字符串
        const v = Number(row[type]);
        if (!isNaN(v)) totals[year][type] += v;
      });
    });
    return totals;
  });
  
  // 构建series数据
  const series = computed(() =>
    selectedTypes.value
      .map(type => ({
        name: type,
        type: 'bar',
        stack: 'total',
        emphasis: { focus: 'series' },
        data: years.value.map(y => yearTypeTotals.value[y]?.[type] ?? 0),
      }))
      .filter(s => s.data.some(v => v > 0))
  );
  
  const legendData = computed(() => series.value.map(s => s.name));
  
  // 防止警告：没有数据时，legend/series/xAxis 设空
  const chartOption = computed(() => {
    if (!years.value.length || !series.value.length) {
      return {
        xAxis: { type: 'category', data: [] },
        yAxis: { type: 'value', name: 'Procedures' },
        series: [],
        legend: { data: [] }
      };
    }
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: legendData.value },
      xAxis: { type: 'category', data: years.value },
      yAxis: { type: 'value', name: 'Procedures' },
      series: series.value,
      grid: { left: 40, right: 30, bottom: 40, top: 50 }
    };
  });
  
  // Debug：确认流程
  watch(
    [() => props.procedures, years, series],
    ([data, y, s]) => {
      console.log('Procedures:', data?.length);
      console.log('Years:', y);
      console.log('Series:', s);
    },
    { immediate: true }
  );
  </script>
  
  <style scoped>
  .procedure-trend-chart {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    margin: 2rem 0;
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }
  .chart-title {
    font-size: 1.15rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #1e3a8a;
  }
  .procedure-type-selector {
    margin-bottom: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem 2rem;
  }
  .type-checkbox {
    font-size: 0.95rem;
    color: #2563eb;
    font-weight: 500;
  }
  </style>
  