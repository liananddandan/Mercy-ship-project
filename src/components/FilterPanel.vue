<template>
  <div class="mb-4 flex flex-wrap gap-4">
    <div v-if="loading" class="text-blue-500">加载过滤器数据...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else>
      <div>
        <label class="block text-sm font-medium">年份</label>
        <input
          type="range"
          v-model="localYear"
          :min="years[0]"
          :max="years[years.length - 1]"
          @change="emitUpdate"
          class="w-full"
        />
        <span>{{ localYear || '所有年份' }}</span>
      </div>
      <div>
        <label class="block text-sm font-medium">国家/港口</label>
        <select v-model="localPort" @change="emitUpdate" class="border rounded p-2">
          <option value="">所有港口</option>
          <option v-for="port in ports" :key="port" :value="port">{{ port }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium">程序类型</label>
        <select v-model="localProcedure" @change="emitUpdate" class="border rounded p-2">
          <option value="">所有程序</option>
          <option v-for="proc in procedureTypes" :key="proc" :value="proc">{{ proc }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Papa from 'papaparse';

const emit = defineEmits(['update']);
defineProps(['procedures']);
const impactMetrics = ref([]);
const localYear = ref('');
const localPort = ref('');
const localProcedure = ref('');
const loading = ref(true);
const error = ref(null);

const loadMetrics = async () => {
  console.log('FilterPanel: 开始加载 impact_metrics.csv');
  try {
    Papa.parse('/data/impact_metrics.csv', {
      download: true,
      header: true,
      complete: (result) => {
        console.log('FilterPanel: 加载完成，记录数:', result.data.length);
        impactMetrics.value = result.data.map((d) => ({
          ...d,
          Year: String(d.Year || '').trim(),
          Country: String(d.Country || '').trim(),
          Port_City: String(d.Port_City || '').trim(),
        }));
        const years = [...new Set(impactMetrics.value.map((d) => d.Year))].sort();
        const ports = [...new Set(impactMetrics.value.map((d) => `${d.Country} - ${d.Port_City}`))].sort();
        console.log('FilterPanel: years:', years);
        console.log('FilterPanel: ports:', ports);
        console.log('FilterPanel: 包含 2013 和 Cameroon - Douala:', years.includes('2013'), ports.includes('Cameroon - Douala'));
        loading.value = false;
      },
      error: (err) => {
        console.error('FilterPanel: 加载失败:', err);
        error.value = `加载过滤器数据失败：${err.message}`;
        loading.value = false;
      },
    });
  } catch (err) {
    console.error('FilterPanel: 异常:', err);
    error.value = `加载过滤器数据异常：${err.message}`;
    loading.value = false;
  }
};

const years = computed(() => {
  if (!impactMetrics.value.length) return [];
  return [...new Set(impactMetrics.value.map((d) => String(d.Year).trim()))].sort();
});

const ports = computed(() => {
  if (!impactMetrics.value.length) return [];
  return [...new Set(impactMetrics.value.map((d) => `${String(d.Country).trim()} - ${String(d.Port_City).trim()}`))].sort();
});

const procedureTypes = computed(() => [
  'Maxillofacial',
  'General_Surgery',
  'Orthopedic',
  'Reconstructive_Plastic',
  'Womens_Health',
  'Ophthalmic',
  'Dental',
]);

const emitUpdate = () => {
  console.log('FilterPanel: 触发更新，year:', localYear.value, 'port:', localPort.value, 'procedure:', localProcedure.value);
  emit('update', { year: localYear.value, port: localPort.value, procedure: localProcedure.value });
};

onMounted(() => {
  console.log('FilterPanel: 组件挂载');
  loadMetrics();
});
</script>