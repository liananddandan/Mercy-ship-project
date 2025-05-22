<template>
  <div>
    <label class="block text-sm font-medium mb-1">Number of Treatments</label>
    <canvas ref="yearChartCanvas" id="yearChart" style="width: 700px; height: 100px; cursor: pointer;"></canvas>
    <div class="mt-1 text-sm text-gray-700">
      Selected Year:
      <span v-if="localYear">{{ localYear }}</span>
      <span v-else>All Years</span>
      <button v-if="localYear" @click="clearYear"
        style="margin-left: 1rem; padding: 0.25rem 0.5rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.875rem;">
        Clear Selection
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, defineEmits, defineProps } from 'vue';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

const emit = defineEmits(['update:year']);
const props = defineProps({
  modelValue: { type: String, default: '' }
});

const localYear = ref(props.modelValue);
const yearChartCanvas = ref(null);
let yearChartInstance = null;
let yearlyTotals = {};  // cache data

// Parse CSV string into yearly totals
function parseCSVToYearlyTotals(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');

  const totalIndex = headers.indexOf('Total_Procedures');
  const yearIndex = headers.indexOf('Year');

  const totals = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const year = cols[yearIndex];
    const totalProcedures = parseInt(cols[totalIndex], 10);

    if (!totals[year]) {
      totals[year] = 0;
    }
    totals[year] += totalProcedures;
  }

  return totals;
}

async function loadCSV() {
  try {
    const response = await fetch('/data/procedures_by_location.csv'); // Modify to your CSV path
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.status}`);
    }
    const csvText = await response.text();
    yearlyTotals = parseCSVToYearlyTotals(csvText);
    renderYearChart();
  } catch (error) {
    console.error('Failed to read CSV file:', error);
  }
}

const setYear = (year) => {
  if (localYear.value === year) {
    localYear.value = '';
  } else {
    localYear.value = year;
  }
  emit('update:year', localYear.value);
};

const clearYear = () => {
  localYear.value = '';
  emit('update:year', '');
};

const renderYearChart = () => {
  if (!yearChartCanvas.value) return;

  const years = Object.keys(yearlyTotals).sort();
  const data = years.map(y => yearlyTotals[y]);

  const backgroundColors = years.map(y =>
    localYear.value === y
      ? 'rgba(0, 123, 255, 1)'
      : 'rgba(100, 149, 237, 0.3)'
  );

  const maxVal = Math.max(...data);

  const dataObj = {
    labels: years,
    datasets: [{
      label: 'Number of Treatments',
      data,
      backgroundColor: backgroundColors,
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }],
  };

  const options = {
    responsive: false,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: maxVal * 1.1,
        ticks: {
          stepSize: Math.ceil(maxVal / 5),
          display: false,
        },
        grid: {
          display: false,
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          font: { size: 10 },
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    onClick(evt, elements) {
      if (elements.length) {
        const index = elements[0].index;
        const clickedYear = years[index];
        setYear(clickedYear);
      }
    },
  };

  if (yearChartInstance) {
    yearChartInstance.data.labels = years;
    yearChartInstance.data.datasets[0].data = data;
    yearChartInstance.data.datasets[0].backgroundColor = backgroundColors;
    yearChartInstance.options.scales.y.max = options.scales.y.max;
    yearChartInstance.update({ duration: 0 });
  } else {
    yearChartInstance = new Chart(yearChartCanvas.value, {
      type: 'bar',
      data: dataObj,
      options,
    });
  }
};

watch(localYear, () => {
  renderYearChart();
});

watch(() => props.modelValue, (newVal) => {
  if (newVal !== localYear.value) {
    localYear.value = newVal;
  }
});

onMounted(() => {
  loadCSV();
});
</script>

<style>
#yearChart {
  width: 1280px !important;
  height: 100px !important;
  display: block;
}
</style>
