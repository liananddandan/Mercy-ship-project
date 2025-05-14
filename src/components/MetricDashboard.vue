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
        <h2 class="text-xl font-semibold">Hospital Partnerships</h2>
        <p class="text-2xl">{{ aggregateMetrics.hospitalPartnerships }}</p>
      </div>
      <div class="border p-4 rounded">
        <h2 class="text-xl font-semibold">QOL Improvement (%)</h2>
        <p class="text-2xl">{{ aggregateMetrics.qolImprovement.toFixed(1) }}</p>
      </div>
      <div class="border p-4 rounded">
        <h2 class="text-xl font-semibold">Training Hours</h2>
        <p class="text-2xl">{{ aggregateMetrics.trainingHours }}</p>
      </div>
      <div class="border p-4 rounded">
        <h2 class="text-xl font-semibold">Days On Site</h2>
        <p class="text-2xl">{{ aggregateMetrics.daysOnSite }}</p>
      </div>
      <div class="border p-4 rounded">
        <h2 class="text-xl font-semibold">Follow-up Care (%)</h2>
        <p class="text-2xl">{{ aggregateMetrics.followupCare.toFixed(1) }}</p>
      </div>
      <div class="border p-4 rounded">
        <h2 class="text-xl font-semibold">Deaths Prevented</h2>
        <p class="text-2xl">{{ aggregateMetrics.deathsPrevented }}</p>
      </div>
      <div class="border p-4 rounded">
        <h2 class="text-xl font-semibold">DALYs Averted</h2>
        <p class="text-2xl">{{ aggregateMetrics.dalysAverted }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  defineProps(['metrics']);
  
  const aggregateMetrics = computed(() =>
    props.metrics.reduce(
      (acc, d) => ({
        totalProcedures: acc.totalProcedures + Number(d.Total_Procedures),
        successRate: acc.successRate + Number(d.Successful_Outcomes_Percent) / (props.metrics.length || 1),
        economicImpact: acc.economicImpact + Number(d.Economic_Impact_USD),
        professionalsTrained: acc.professionalsTrained + Number(d.Local_Professionals_Trained),
        hospitalPartnerships: acc.hospitalPartnerships + Number(d.Hospital_Partnerships),
        qolImprovement: acc.qolImprovement + Number(d.Patient_QOL_Improvement_Percent) / (props.metrics.length || 1),
        trainingHours: acc.trainingHours + Number(d.Training_Hours),
        daysOnSite: acc.daysOnSite + Number(d.Days_On_Site),
        followupCare: acc.followupCare + Number(d.Followup_Care_Provided_Percent) / (props.metrics.length || 1),
        deathsPrevented: acc.deathsPrevented + Number(d.Deaths_Prevented_Estimate),
        dalysAverted: acc.dalysAverted + Number(d.DALYs_Averted_Estimate),
      }),
      {
        totalProcedures: 0,
        successRate: 0,
        economicImpact: 0,
        professionalsTrained: 0,
        hospitalPartnerships: 0,
        qolImprovement: 0,
        trainingHours: 0,
        daysOnSite: 0,
        followupCare: 0,
        deathsPrevented: 0,
        dalysAverted: 0,
      }
    )
  );
  
  const formatUSD = (value) => `$${Number(value).toLocaleString()}`;
  </script>