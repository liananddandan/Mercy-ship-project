<template>
  <div class="border p-4 rounded">
    <h2 class="text-xl font-semibold mb-2">Procedures by Category & Subcategory</h2>
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps(['procedures']);

// Main categories and their subcategories
const categories = [
  {
    name: 'Maxillofacial',
    subcategories: ['Tumor', 'Trauma', 'Cleft'],
  },
  {
    name: 'General Surgery',
    subcategories: ['Hernia', 'Goiter', 'Other'],
  },
  {
    name: 'Orthopedic',
    subcategories: ['Clubfoot', 'Fracture', 'Other'],
  },
  {
    name: 'Reconstructive Plastic',
    subcategories: ['Burn', 'Scar', 'Other'],
  },
  {
    name: "Women's Health",
    subcategories: ['Fistula', 'Prolapse', 'Other'],
  },
  {
    name: 'Ophthalmic',
    subcategories: ['Cataract', 'Pterygium', 'Other'],
  },
  {
    name: 'Dental',
    subcategories: ['Extraction', 'Restoration', 'Other'],
  },
];

// All subcategories in order (for datasets)
const allSubcategories = [
  'Tumor', 'Trauma', 'Cleft',
  'Hernia', 'Goiter', 'Other',
  'Clubfoot', 'Fracture', 'Other',
  'Burn', 'Scar', 'Other',
  'Fistula', 'Prolapse', 'Other',
  'Cataract', 'Pterygium', 'Other',
  'Extraction', 'Restoration', 'Other',
];

// Helper to get mock value for a subcategory in a main category
const getMockSubcategoryValue = (main, sub, d) => {
  const base = Number(d[main.replace(/\s/g, '_')] || 0);
  if (base === 0) return 0;
  const hash = (main + sub).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return Math.round((base / 3) + ((hash % 3) - 1) * (base / 10));
};

const chartData = computed(() => {
  // X axis: main categories
  const labels = categories.map(cat => cat.name);
  // Each dataset is a subcategory (in the order above)
  const datasets = [];
  let subcatIndex = 0;
  for (let c = 0; c < categories.length; c++) {
    const cat = categories[c];
    for (let s = 0; s < cat.subcategories.length; s++) {
      const sub = cat.subcategories[s];
      // For each main category, only fill the dataset for its subcategories, others are null
      if (!datasets[subcatIndex]) {
        datasets[subcatIndex] = {
          label: sub,
          data: Array(categories.length).fill(null),
          backgroundColor: `hsl(${(subcatIndex * 30) % 360}, 70%, 60%)`,
        };
      }
      datasets[subcatIndex].data[c] = props.procedures.reduce(
        (sum, d) => sum + getMockSubcategoryValue(cat.name, sub, d), 0
      );
      subcatIndex++;
    }
  }
  return { labels, datasets };
});

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Hierarchical Breakdown of Procedures (Mock Data)' },
  },
  scales: {
    x: {
      stacked: false,
      offset: false,
      title: { display: true, text: 'Category' },
      ticks: { autoSkip: false, maxRotation: 45, minRotation: 45, align: 'center'	 },
      barPercentage: 0.3,
      categoryPercentage: 0.1,
      maxBarThickness: 30,
    },
    y: {
      beginAtZero: true,
      title: { display: true, text: 'Number of Procedures' },
    },
  },
};
</script>
