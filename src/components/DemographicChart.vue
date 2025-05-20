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

const props = defineProps(['demographics']); // ✅ 这里加上变量名

const chartData = computed(() => ({
  labels: ['0-5', '6-18', '19-40', '41-60', '60+'],
  datasets: [
    {
      label: 'Age Distribution (%)',
      data: [
        props.demographics.reduce((sum, d) => sum + Number(d.Age_0_5_Percent || 0), 0) / (props.demographics.length || 1),
        props.demographics.reduce((sum, d) => sum + Number(d.Age_6_18_Percent || 0), 0) / (props.demographics.length || 1),
        props.demographics.reduce((sum, d) => sum + Number(d.Age_19_40_Percent || 0), 0) / (props.demographics.length || 1),
        props.demographics.reduce((sum, d) => sum + Number(d.Age_41_60_Percent || 0), 0) / (props.demographics.length || 1),
        props.demographics.reduce((sum, d) => sum + Number(d.Age_60Plus_Percent || 0), 0) / (props.demographics.length || 1),
      ],
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
    },
  ],
}));

const chartOptions = {
  responsive: true,
  scales: { y: { beginAtZero: true, max: 100 } },
};
</script>
