<template>
  <div>
    <slot v-if="!hasError"></slot>
    <div v-else class="text-red-500 p-4 border border-red-500 rounded">
      <p>组件渲染失败：{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    onError: {
      type: Function,
      default: (err) => {
        console.error('Error:', err);
      },
    },
  },
};
</script>

<script setup>
import { ref } from 'vue';
const hasError = ref(false);
const errorMessage = ref('');
</script>