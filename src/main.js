import * as echarts from 'echarts/core';
import { BarChart, SankeyChart, HeatmapChart } from 'echarts/charts';
import {
    TooltipComponent,
    LegendComponent,
    GridComponent,
    TimelineComponent,  // 新增
    TitleComponent,    // 新增
    VisualMapComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VueECharts from 'vue-echarts';

echarts.use([
    BarChart,
    SankeyChart,
    HeatmapChart,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    TimelineComponent,
    TitleComponent,
    VisualMapComponent,
    CanvasRenderer,
]);

import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
app.component('v-chart', VueECharts);
app.mount('#app');
