<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
    <div class="border p-4 rounded">
      <h2 class="text-xl font-semibold">Total Procedures</h2>
      <p class="text-2xl">{{ aggregateMetrics.totalProcedures }}</p>
    </div>
    <div class="border p-4 rounded">
      <h2 class="text-xl font-semibold">Success Rate (%)</h2>
      <p class="text-2xl">{{ aggregateMetrics.successRate.toFixed(1) }}</p>
    </div>
    <div class="border p-4 rounded">
      <h2 class="text-xl font-semibold">Economic Impact (USD)</h2>
      <p class="text-2xl">{{ formatUSD(aggregateMetrics.economicImpact) }}</p>
    </div>
    <div class="border p-4 rounded">
      <h2 class="text-xl font-semibold">Professionals Trained</h2>
      <p class="text-2xl">{{ aggregateMetrics.professionalsTrained }}</p>
    </div>
    <div class="border p-4 rounded">
      <h2 class="text-xl font-semibold">QOL Improvement (%)</h2>
      <p class="text-2xl">{{ aggregateMetrics.qolImprovement.toFixed(1) }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  metrics: {
    type: Array,
    default: () => [],
  },
});

const aggregateMetrics = computed(() => {
  if (!props.metrics || !Array.isArray(props.metrics)) {
    console.warn('MetricDashboard: metrics 无效，返回默认值');
    return {
      totalProcedures: 0,
      successRate: 0,
      economicImpact: 0,
      professionalsTrained: 0,
      qolImprovement: 0,
    };
  }

  return props.metrics.reduce(
    (acc, d) => ({
      totalProcedures: acc.totalProcedures + Number(d.Total_Procedures || 0),
      successRate: acc.successRate + Number(d.Successful_Outcomes_Percent || 0) / (props.metrics.length || 1),
      economicImpact: acc.economicImpact + Number(d.Economic_Impact_USD || 0),
      professionalsTrained: acc.professionalsTrained + Number(d.Local_Professionals_Trained || 0),
      qolImprovement: acc.qolImprovement + Number(d.Patient_QOL_Improvement_Percent || 0) / (props.metrics.length || 1),
    }),
    {
      totalProcedures: 0,
      successRate: 0,
      economicImpact: 0,
      professionalsTrained: 0,
      qolImprovement: 0,
    }
  );
});

const formatUSD = (value) => `$${Number(value).toLocaleString()}`;
</script>