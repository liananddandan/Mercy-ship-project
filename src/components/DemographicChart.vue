<template>
  <div class="demographic-chart">
    <v-chart :option="chartOption" autoresize style="height: 500px; width: 100%;" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import VChart from 'vue-echarts';

const props = defineProps({
  demographics: {
    type: Array,
    default: () => [],
  },
});

const ageGroups = ['0-5', '6-18', '19-40', '41-60', '60+'];
const genders = ['Male', 'Female'];

// 统计所有年份
const years = computed(() => {
  const ys = new Set(props.demographics.map(d => d.Year));
  return Array.from(ys).sort();
});

// 构建数据结构： { [year]: { Male: {...}, Female: {...} } }
const dataMap = computed(() => {
  const map = {};
  years.value.forEach(y => {
    map[y] = { Male: {}, Female: {} };
    ageGroups.forEach(age => {
      map[y].Male[age] = 0;
      map[y].Female[age] = 0;
    });
  });
  props.demographics.forEach(d => {
    const y = d.Year;
    if (!map[y]) return;
    const total = Number(d.Total_Patients || 0);
    if (total === 0) return;
    const malePct = Number(d.Gender_Male_Percent || 0) / 100;
    const femalePct = Number(d.Gender_Female_Percent || 0) / 100;
    const agePercents = [
      Number(d.Age_0_5_Percent || 0) / 100,
      Number(d.Age_6_18_Percent || 0) / 100,
      Number(d.Age_19_40_Percent || 0) / 100,
      Number(d.Age_41_60_Percent || 0) / 100,
      Number(d.Age_60Plus_Percent || 0) / 100,
    ];
    ageGroups.forEach((age, i) => {
      map[y].Male[age] += total * malePct * agePercents[i];
      map[y].Female[age] += total * femalePct * agePercents[i];
    });
  });
  return map;
});

// series数组生成，分别为男女*年龄组，每个年龄组堆叠名唯一（保证同性别年龄堆叠）
// 男女柱间距用barGap来控制
const ageGroupColorsMale = ['#0B69C6', '#1E90FF', '#3FA9F5', '#1E90FF', '#0B69C6'];
const ageGroupColorsFemale = ['#B22222', '#FF4C4C', '#FF7F7F', '#FF4C4C', '#B22222'];

const series = computed(() => {
  const map = dataMap.value;
  const result = [];

  ageGroups.forEach((age, i) => {
    // 男性系列
    result.push({
      name: `Male ${age}`,
      type: 'bar',
      stack: `Male`,
      emphasis: { focus: 'series' },
      data: years.value.map(y => map[y].Male[age] || 0),
      barGap: '0%',
      barCategoryGap: '30%',
      itemStyle: { color: ageGroupColorsMale[i] },
    });
    // 女性系列
    result.push({
      name: `Female ${age}`,
      type: 'bar',
      stack: `Female`,
      emphasis: { focus: 'series' },
      data: years.value.map(y => map[y].Female[age] || 0),
      barGap: '0%',
      barCategoryGap: '30%',
      itemStyle: { color: ageGroupColorsFemale[i] },
    });
  });

  return result;
});

const chartOption = computed(() => ({
  tooltip: {
  trigger: 'item',
  formatter: (params) => {
    // params.name 是年龄组，params.seriesName 是 性别+年龄组，params.data 是数值
    return `
      ${params.seriesName}<br/>
      Age Group: ${params.name}<br/>
      Patients: ${params.data ? params.data.toFixed(0) : 0}
    `;
  }
},
  legend: {
    data: series.value.map(s => s.name),
    textStyle: { color: '#333' },
  },
  grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
  xAxis: {
    type: 'category',
    data: years.value,
    axisLabel: { rotate: 30, color: '#555' },
  },
  yAxis: {
    type: 'value',
    name: 'Number of Patients',
    axisLabel: { color: '#555' },
  },
  series: series.value,
}));
</script>

<style scoped>
.demographic-chart {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
</style>
