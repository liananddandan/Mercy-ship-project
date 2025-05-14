<template>
    <div class="mb-4 flex flex-wrap gap-4">
      <div v-if="loading" class="text-blue-500">加载过滤器数据...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>
      <div v-else>
        <div>
          <label class="block text-sm font-medium">年份</label>
          <select v-model="localYear" @change="emitUpdate" class="border rounded p-2">
            <option value="">所有年份</option>
            <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium">国家/港口</label>
          <select v-model="localPort" @change="emitUpdate" class="border rounded p-2">
            <option value="">所有港口</option>
            <option v-for="port in ports" :key="port" :value="port">{{ port }}</option>
          </select>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import Papa from 'papaparse';
  
  const emit = defineEmits(['update']);
  
  const impactMetrics = ref([]);
  const localYear = ref('');
  const localPort = ref('');
  const loading = ref(true);
  const error = ref(null);
  
  // 加载 metrics 获取年份和港口
  const loadMetrics = async () => {
    console.log('FilterPanel: 开始加载 impact_metrics.csv');
    try {
      Papa.parse('/data/impact_metrics.csv', {
        download: true,
        header: true,
        complete: (result) => {
          console.log('FilterPanel: 加载完成，记录数:', result.data.length);
          impactMetrics.value = result.data;
          console.log('FilterPanel: years:', [...new Set(result.data.map((d) => d.Year))].sort());
          console.log('FilterPanel: ports:', [...new Set(result.data.map((d) => `${d.Country} - ${d.Port_City}`))].sort());
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
  
  const emitUpdate = () => {
    console.log('FilterPanel: 触发更新，year:', localYear.value, 'port:', localPort.value);
    emit('update', { year: localYear.value, port: localPort.value });
  };
  
  onMounted(() => {
    console.log('FilterPanel: 组件挂载');
    loadMetrics();
  });
  </script>