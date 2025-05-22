<template>
  <div class="border p-4 rounded">
    <h2 class="text-xl font-semibold mb-4">Demographic Distribution</h2>
    
    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="flex flex-col">
        <label class="text-sm font-medium mb-1">Age Group</label>
        <select v-model="selectedAgeGroup" class="border rounded p-2">
          <option value="all">All Ages</option>
          <option value="0-18">0-18 years</option>
          <option value="19-30">19-30 years</option>
          <option value="31-50">31-50 years</option>
          <option value="51+">51+ years</option>
        </select>
      </div>
      
      <div class="flex flex-col">
        <label class="text-sm font-medium mb-1">Gender</label>
        <select v-model="selectedGender" class="border rounded p-2">
          <option value="all">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
      
      <div class="flex flex-col">
        <label class="text-sm font-medium mb-1">Date Range</label>
        <select v-model="selectedDateRange" class="border rounded p-2">
          <option value="all">All Time</option>
          <option value="lastYear">Last Year</option>
          <option value="last6Months">Last 6 Months</option>
          <option value="last3Months">Last 3 Months</option>
        </select>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Age Distribution Chart -->
      <div class="border p-4 rounded">
        <h3 class="text-lg font-medium mb-2">Age Distribution</h3>
        <Bar :data="ageChartData" :options="ageChartOptions" />
      </div>

      <!-- Gender Distribution Chart -->
      <div class="border p-4 rounded">
        <h3 class="text-lg font-medium mb-2">Gender Distribution</h3>
        <Pie :data="genderChartData" :options="genderChartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Bar, Pie } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
);

const props = defineProps(['demographics']);

// Filter states
const selectedAgeGroup = ref('all');
const selectedGender = ref('all');
const selectedDateRange = ref('all');

// Age distribution data
const ageChartData = computed(() => {
  const ageGroups = ['0-18', '19-30', '31-50', '51+'];
  const data = props.demographics.reduce((acc, d) => {
    acc[0] += Number(d.Age_0_18_Percent || 0);
    acc[1] += Number(d.Age_19_30_Percent || 0);
    acc[2] += Number(d.Age_31_50_Percent || 0);
    acc[3] += Number(d.Age_51Plus_Percent || 0);
    return acc;
  }, [0, 0, 0, 0]);

  const total = data.reduce((sum, val) => sum + val, 0);
  const percentages = data.map(val => (val / total) * 100);

  return {
    labels: ageGroups,
    datasets: [{
      label: 'Age Distribution (%)',
      data: percentages,
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };
});

// Gender distribution data
const genderChartData = computed(() => {
  const data = props.demographics.reduce((acc, d) => {
    acc.male += Number(d.Male_Percent || 0);
    acc.female += Number(d.Female_Percent || 0);
    return acc;
  }, { male: 0, female: 0 });

  const total = data.male + data.female;
  const percentages = [
    (data.male / total) * 100,
    (data.female / total) * 100
  ];

  return {
    labels: ['Male', 'Female'],
    datasets: [{
      data: percentages,
      backgroundColor: [
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 99, 132, 0.6)'
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
    }]
  };
});

// Chart options
const ageChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Procedures by Age Group'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Number of Procedures'
      }
    }
  }
};

const genderChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Procedures by Gender'
    }
  }
};
</script>
