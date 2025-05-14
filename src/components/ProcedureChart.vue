<template>
    <div class="border p-4 rounded">
      <h2 class="text-xl font-semibold mb-2">Procedures by Category</h2>
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </template>
  
  <script setup>
  import { Bar } from 'vue-chartjs';
  import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
  
  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);
  
  defineProps(['procedures']);
  
  const chartData = computed(() => ({
    labels: [
      'Maxillofacial',
      'General Surgery',
      'Orthopedic',
      'Reconstructive Plastic',
      'Womens Health',
      'Ophthalmic',
      'Dental',
    ],
    datasets: [
      {
        label: 'Procedures',
        data: [
          props.procedures.reduce((sum, d) => sum + Number(d.Maxillofacial), 0),
          props.procedures.reduce((sum, d) => sum + Number(d.General_Surgery), 0),
          props.procedures.reduce((sum, d) => sum + Number(d.Orthopedic), 0),
          props.procedures.reduce((sum, d) => sum + Number(d.Reconstructive_Plastic), 0),
          props.procedures.reduce((sum, d) => sum + Number(d.Womens_Health), 0),
          props.procedures.reduce((sum, d) => sum + Number(d.Ophthalmic), 0),
          props.procedures.reduce((sum, d) => sum + Number(d.Dental), 0),
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  }));
  
  const chartOptions = {
    responsive: true,
    scales: { y: { beginAtZero: true } },
  };
  </script>