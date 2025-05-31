<template>
  <div class="grid">
    <div>
      <h2>Total Procedures</h2>
      <p>{{ aggregateMetrics.totalProcedures }}</p>
    </div>
    <div>
      <h2>Success Rate (%)</h2>
      <p>{{ aggregateMetrics.successRate.toFixed(1) }}</p>
    </div>
    <div>
      <h2>Economic Impact (USD)</h2>
      <p>{{ formatUSD(aggregateMetrics.economicImpact) }}</p>
    </div>
    <div>
      <h2>Professionals Trained</h2>
      <p>{{ aggregateMetrics.professionalsTrained }}</p>
    </div>
    <div>
      <h2>QOL Improvement (%)</h2>
      <p>{{ aggregateMetrics.qolImprovement.toFixed(1) }}</p>
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
    console.warn('MetricDashboard: Invalid metrics, returning default values');
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

<style scoped>
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px; /* 卡片间距 */
  justify-content: flex-start;
}

.grid > div {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  flex: 0 0 140px; /* 固定宽度 */
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: default;
  transition: box-shadow 0.2s ease;
}

.grid > div:hover {
  box-shadow: 0 6px 12px rgba(0,0,0,0.12);
}

.grid > div h2 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 6px;
  color: #1e3a8a;
}

.grid > div p {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2563eb;
  line-height: 1;
  margin: 0;
  user-select: text;
}

/* 响应式，移动端竖排 */
@media (max-width: 600px) {
  .grid {
    flex-direction: column;
    gap: 8px;
  }
  .grid > div {
    flex-basis: 100%;
    max-width: 100%;
  }
}
</style>

