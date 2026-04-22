<template>
  <div class="dashboard">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <h2>下午好，管理员</h2>
        <p>今日数据一览 • {{ currentDate }}</p>
      </div>
      <div class="welcome-actions">
        <el-button type="primary" @click="$router.push('/product/list')">
          <el-icon><Plus /></el-icon> 添加商品
        </el-button>
        <el-button @click="$router.push('/order/list')">
          <el-icon><List /></el-icon> 处理订单
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="12" :sm="12" :md="6">
        <div class="stat-card stat-orders">
          <div class="stat-icon">
            <el-icon><ShoppingCart /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-label">今日订单</p>
            <p class="stat-value">{{ stats.today_orders }}</p>
            <p class="stat-change up">
              <el-icon><Top /></el-icon> 12.5%
            </p>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <div class="stat-card stat-sales">
          <div class="stat-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-label">今日销售额</p>
            <p class="stat-value">¥{{ stats.today_sales }}</p>
            <p class="stat-change up">
              <el-icon><Top /></el-icon> 8.3%
            </p>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <div class="stat-card stat-products">
          <div class="stat-icon">
            <el-icon><Goods /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-label">商品总数</p>
            <p class="stat-value">{{ stats.product_count }}</p>
            <p class="stat-change">
              库存预警 <span class="warning">5</span>
            </p>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <div class="stat-card stat-users">
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-label">用户总数</p>
            <p class="stat-value">{{ stats.user_count }}</p>
            <p class="stat-change">
              今日新增 <span class="success">+23</span>
            </p>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :xs="24" :sm="24" :md="16">
        <div class="chart-card">
          <div class="card-header">
            <h3>销售概况</h3>
            <div class="chart-tabs">
              <span :class="{ active: chartPeriod === 'week' }" @click="chartPeriod = 'week'">近7天</span>
              <span :class="{ active: chartPeriod === 'month' }" @click="chartPeriod = 'month'">近30天</span>
            </div>
          </div>
          <div ref="salesChartRef" class="chart-container"></div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8">
        <div class="chart-card">
          <div class="card-header">
            <h3>销售排行 TOP 5</h3>
          </div>
          <div class="ranking-list">
            <div class="ranking-item" v-for="(item, index) in productRanking" :key="index">
              <span class="ranking-num" :class="{ top: index < 3 }">{{ index + 1 }}</span>
              <div class="ranking-info">
                <p class="ranking-name">{{ item.name }}</p>
                <p class="ranking-sales">销量 {{ item.sales }}</p>
              </div>
              <span class="ranking-amount">¥{{ item.amount }}</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 下方区域 -->
    <el-row :gutter="20" class="bottom-section">
      <el-col :xs="24" :sm="24" :md="12">
        <div class="table-card">
          <div class="card-header">
            <h3>最新订单</h3>
            <el-button type="primary" link @click="$router.push('/order/list')">查看更多</el-button>
          </div>
          <el-table :data="latestOrders" style="width: 100%">
            <el-table-column prop="order_no" label="订单号" width="160" show-overflow-tooltip />
            <el-table-column prop="user" label="用户" width="100">
              <template #default="{ row }">{{ row.user || '游客' }}</template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="90">
              <template #default="{ row }"><span class="amount">¥{{ row.amount }}</span></template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">{{ row.statusText }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="时间" show-overflow-tooltip />
          </el-table>
        </div>
      </el-col>

      <el-col :xs="24" :sm="24" :md="12">
        <div class="action-card">
          <div class="card-header">
            <h3>快捷操作</h3>
          </div>
          <div class="quick-actions">
            <div class="action-item" @click="$router.push('/product/list')">
              <div class="action-icon" style="background: #e8f4ff;">
                <el-icon style="color: #409eff;"><Goods /></el-icon>
              </div>
              <span>商品管理</span>
            </div>
            <div class="action-item" @click="$router.push('/order/list')">
              <div class="action-icon" style="background: #fef0e8;">
                <el-icon style="color: #e6a23c;"><List /></el-icon>
              </div>
              <span>订单管理</span>
            </div>
            <div class="action-item" @click="$router.push('/user/list')">
              <div class="action-icon" style="background: #e8f8f0;">
                <el-icon style="color: #67c23a;"><User /></el-icon>
              </div>
              <span>用户管理</span>
            </div>
            <div class="action-item" @click="$router.push('/marketing/coupon')">
              <div class="action-icon" style="background: #fef0f5;">
                <el-icon style="color: #f56c6c;"><Ticket /></el-icon>
              </div>
              <span>优惠券</span>
            </div>
            <div class="action-item" @click="$router.push('/marketing/banner')">
              <div class="action-icon" style="background: #f5f0ff;">
                <el-icon style="color: #a655ff;"><Picture /></el-icon>
              </div>
              <span>Banner</span>
            </div>
            <div class="action-item" @click="$router.push('/product/category')">
              <div class="action-icon" style="background: #fff8e8;">
                <el-icon style="color: #b8860b;"><Menu /></el-icon>
              </div>
              <span>分类管理</span>
            </div>
          </div>
        </div>

        <div class="activity-card" style="margin-top: 20px;">
          <div class="card-header">
            <h3>最新动态</h3>
          </div>
          <div class="activity-list">
            <div class="activity-item" v-for="(item, index) in activities" :key="index">
              <div class="activity-dot" :style="{ background: item.color }"></div>
              <div class="activity-content">
                <p class="activity-text">{{ item.text }}</p>
                <p class="activity-time">{{ item.time }}</p>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';
import {
  ShoppingCart, Money, Goods, User, Plus, List, Top,
  Ticket, Picture, Menu
} from '@element-plus/icons-vue';

const currentDate = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric', month: 'long', day: 'numeric'
});

const stats = reactive({
  today_orders: 156,
  today_sales: '8,542',
  product_count: 328,
  user_count: '2,856'
});

const chartPeriod = ref('week');
const latestOrders = ref([
  { order_no: 'DD20260416001', user: '张小美', amount: '299.00', status: 'completed', statusText: '已完成', time: '12:30' },
  { order_no: 'DD20260416002', user: '李小红', amount: '159.00', status: 'pending', statusText: '待付款', time: '12:15' },
  { order_no: 'DD20260416003', user: '王美丽', amount: '599.00', status: 'paid', statusText: '待发货', time: '11:50' },
  { order_no: 'DD20260416004', user: '赵晓丽', amount: '89.00', status: 'shipped', statusText: '待收货', time: '11:30' },
  { order_no: 'DD20260416005', user: '陈雅静', amount: '429.00', status: 'completed', statusText: '已完成', time: '10:45' }
]);

const productRanking = ref([
  { name: '玻尿酸保湿面膜 5片装', sales: 328, amount: '25,864' },
  { name: '胶原蛋白精华液 30ml', sales: 256, amount: '19,456' },
  { name: '玫瑰保湿面霜 50g', sales: 198, amount: '14,652' },
  { name: '丝绒哑光口红 #正红色', sales: 167, amount: '12,525' },
  { name: '氨基酸洁面乳 100ml', sales: 145, amount: '10,305' }
]);

const activities = ref([
  { text: '用户 张小美 购买商品「保湿面膜」', time: '3分钟前', color: '#67c23a' },
  { text: '新订单 DD20260416001 已完成支付', time: '15分钟前', color: '#409eff' },
  { text: '用户 李小红 提交了退款申请', time: '30分钟前', color: '#f56c6c' },
  { text: '商品「精华液」库存不足预警', time: '1小时前', color: '#e6a23c' },
  { text: '管理员添加了新商品「防晒霜」', time: '2小时前', color: '#a655ff' }
]);

let salesChart = null;
const salesChartRef = ref(null);

onMounted(() => {
  nextTick(() => initChart());
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  salesChart?.dispose();
});

watch(chartPeriod, () => {
  updateChart();
});

function initChart() {
  if (!salesChartRef.value) return;
  salesChart = echarts.init(salesChartRef.value);
  updateChart();
}

function updateChart() {
  const weekData = {
    xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    sales: [4200, 3800, 5100, 4600, 6200, 7800, 8542],
    orders: [42, 38, 51, 46, 62, 78, 85]
  };

  const monthData = {
    xAxis: Array.from({ length: 30 }, (_, i) => `${i + 1}日`),
    sales: Array.from({ length: 30 }, () => Math.floor(Math.random() * 8000) + 2000),
    orders: Array.from({ length: 30 }, () => Math.floor(Math.random() * 80) + 20)
  };

  const data = chartPeriod.value === 'week' ? weekData : monthData;

  salesChart.setOption({
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#eee', textStyle: { color: '#333' } },
    legend: { data: ['销售额', '订单量'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: data.xAxis, axisLine: { lineStyle: { color: '#eee' } }, axisLabel: { color: '#999' } },
    yAxis: [
      { type: 'value', name: '销售额', position: 'left', axisLine: { show: false }, splitLine: { lineStyle: { color: '#f5f5f5' } }, axisLabel: { color: '#999', formatter: val => `¥${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}` } },
      { type: 'value', name: '订单量', position: 'right', axisLine: { show: false }, splitLine: { show: false }, axisLabel: { color: '#999' } }
    ],
    series: [
      {
        name: '销售额', type: 'bar', barWidth: '35%',
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#ff4a8d' }, { offset: 1, color: '#ff6b9d' }]), borderRadius: [4, 4, 0, 0] },
        data: data.sales
      },
      {
        name: '订单量', type: 'line', yAxisIndex: 1, smooth: true, symbol: 'circle', symbolSize: 8,
        lineStyle: { color: '#409eff', width: 2 },
        itemStyle: { color: '#409eff', borderColor: '#fff', borderWidth: 2 },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(64,158,255,0.3)' }, { offset: 1, color: 'rgba(64,158,255,0.05)' }]) },
        data: data.orders
      }
    ]
  });
}

function handleResize() { salesChart?.resize(); }

function getStatusType(status) {
  const map = { pending: 'warning', paid: 'info', shipped: 'primary', completed: 'success', cancelled: 'info' };
  return map[status] || 'info';
}
</script>

<style lang="scss" scoped>
.dashboard { padding: 0; }

.welcome-banner {
  background: linear-gradient(135deg, #ff4a8d 0%, #ff6b9d 100%);
  border-radius: 12px; padding: 30px; margin-bottom: 20px;
  display: flex; justify-content: space-between; align-items: center;
  .welcome-content { h2 { font-size: 24px; color: #fff; margin-bottom: 8px; } p { font-size: 14px; color: rgba(255,255,255,0.8); } }
  .welcome-actions { display: flex; gap: 12px;
    .el-button { background: rgba(255,255,255,0.2); border: none; color: #fff; &:hover { background: rgba(255,255,255,0.3); } }
  }
}

.stat-cards { margin-bottom: 20px;
  .stat-card {
    background: #fff; border-radius: 12px; padding: 24px; display: flex; align-items: center; gap: 20px;
    transition: transform 0.2s, box-shadow 0.2s;
    &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .stat-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; }
    .stat-info { flex: 1;
      .stat-label { font-size: 13px; color: #999; margin-bottom: 8px; }
      .stat-value { font-size: 28px; font-weight: bold; color: #333; margin-bottom: 4px; }
      .stat-change { font-size: 12px; color: #999; .el-icon { font-size: 12px; } &.up { color: #67c23a; } .warning { color: #f56c6c; font-weight: bold; } .success { color: #67c23a; font-weight: bold; } }
    }
  }
  .stat-orders .stat-icon { background: linear-gradient(135deg, #409eff, #66b3ff); }
  .stat-sales .stat-icon { background: linear-gradient(135deg, #67c23a, #95d475); }
  .stat-products .stat-icon { background: linear-gradient(135deg, #e6a23c, #f0b775); }
  .stat-users .stat-icon { background: linear-gradient(135deg, #f56c6c, #f78989); }
}

.chart-section { margin-bottom: 20px; }

.chart-card, .table-card, .action-card, .activity-card {
  background: #fff; border-radius: 12px; padding: 20px;
  .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h3 { font-size: 16px; font-weight: bold; color: #333; } }
}

.chart-card {
  .chart-tabs { display: flex; gap: 16px; span { font-size: 13px; color: #999; cursor: pointer; padding-bottom: 4px; &.active { color: #ff4a8d; font-weight: bold; border-bottom: 2px solid #ff4a8d; } } }
  .chart-container { height: 300px; }
}

.ranking-list {
  .ranking-item { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #f5f5f5;
    &:last-child { border-bottom: none; }
    .ranking-num { width: 24px; height: 24px; border-radius: 50%; background: #f5f5f5; color: #999; font-size: 12px; display: flex; align-items: center; justify-content: center; margin-right: 12px; &.top { background: #ff4a8d; color: #fff; } }
    .ranking-info { flex: 1; .ranking-name { font-size: 14px; color: #333; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; } .ranking-sales { font-size: 12px; color: #999; } }
    .ranking-amount { font-size: 14px; font-weight: bold; color: #ff4a8d; }
  }
}

.quick-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
  .action-item { display: flex; flex-direction: column; align-items: center; padding: 20px 10px; border-radius: 10px; cursor: pointer; transition: background 0.2s;
    &:hover { background: #f8f8f8; }
    .action-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 10px; }
    span { font-size: 13px; color: #666; }
  }
}

.activity-list {
  .activity-item { display: flex; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #f5f5f5;
    &:last-child { border-bottom: none; }
    .activity-dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; margin-top: 6px; flex-shrink: 0; }
    .activity-content { flex: 1; .activity-text { font-size: 13px; color: #333; margin-bottom: 4px; } .activity-time { font-size: 12px; color: #999; } }
  }
}

.amount { color: #ff4a8d; font-weight: bold; }
.bottom-section { margin-bottom: 20px; }
</style>
