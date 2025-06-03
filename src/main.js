import * as echarts from 'echarts/core';
import { BarChart, SankeyChart, HeatmapChart, ScatterChart, GraphChart } from 'echarts/charts';
import {
    TooltipComponent,
    LegendComponent,
    GridComponent,
    TimelineComponent,
    TitleComponent,
    VisualMapComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VueECharts from 'vue-echarts';

// Register ECharts components
echarts.use([
    BarChart,
    SankeyChart,
    HeatmapChart,
    ScatterChart,
    GraphChart,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    TimelineComponent,
    TitleComponent,
    VisualMapComponent,
    CanvasRenderer
]);

import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
app.component('v-chart', VueECharts);
app.mount('#app');
