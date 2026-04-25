<template>
  <div class="order-list">
    <!-- 筛选 -->
    <el-card class="filter-card">
      <el-form inline :model="queryForm">
        <el-form-item label="订单状态">
          <el-select v-model="queryForm.status" placeholder="全部" clearable>
            <el-option label="待付款" value="pending" />
            <el-option label="已付款" value="paid" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付状态">
          <el-select v-model="queryForm.pay_status" placeholder="全部" clearable>
            <el-option label="未支付" value="unpaid" />
            <el-option label="支付中" value="paying" />
            <el-option label="已支付" value="paid" />
            <el-option label="支付失败" value="failed" />
            <el-option label="已关闭" value="closed" />
            <el-option label="退款中" value="refunding" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单号">
          <el-input v-model="queryForm.order_no" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" @row-click="handleRowClick">
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column label="用户信息" width="150">
          <template #default="{ row }">
            <div>{{ row.user?.nickname || '-' }}</div>
            <div style="font-size: 12px; color: #999;">ID: {{ row.user_id }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商品信息" min-width="200">
          <template #default="{ row }">
            <div v-for="item in row.items?.slice(0, 2)" :key="item.id" class="goods-item">
              <el-image :src="item.cover_image" fit="cover" style="width: 40px; height: 40px; border-radius: 4px;" />
              <span class="goods-name">{{ item.product_title }}</span>
              <span class="goods-count">x{{ item.quantity }}</span>
            </div>
            <div v-if="row.items?.length > 2" style="color: #999; font-size: 12px;">
              还有{{ row.items.length - 2 }}件商品
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="total_amount" label="商品金额" width="100">
          <template #default="{ row }">
            ¥{{ row.total_amount }}
          </template>
        </el-table-column>
        <el-table-column prop="pay_amount" label="实付金额" width="100">
          <template #default="{ row }">
            <span style="color: #ff4a8d; font-weight: bold;">¥{{ row.pay_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pay_status" label="支付状态" width="110">
          <template #default="{ row }">
            <el-tag :type="getPayStatusType(row.pay_status)">{{ getPayStatusText(row.pay_status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pay_channel" label="支付渠道" width="100">
          <template #default="{ row }">
            {{ getPayChannelText(row.pay_channel) }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="下单时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click.stop="handleDetail(row)">详情</el-button>
            <el-button type="primary" link @click.stop="handleShip(row)" v-if="row.status === 'paid'">发货</el-button>
            <el-button type="danger" link @click.stop="handleRefund(row)" v-if="['paid', 'shipped'].includes(row.status)">退款</el-button>
            <el-button type="warning" link @click.stop="handleMockPaid(row)" v-if="row.status === 'pending' && row.out_trade_no">模拟回调</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="800px">
      <div class="order-detail" v-if="currentOrder">
        <el-card shadow="never">
          <template #header>
            <span>基本信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">{{ currentOrder.order_no }}</el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag :type="getStatusType(currentOrder.status)">{{ getStatusText(currentOrder.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="下单时间">{{ formatTime(currentOrder.created_at) }}</el-descriptions-item>
            <el-descriptions-item label="用户ID">{{ currentOrder.user_id }}</el-descriptions-item>
            <el-descriptions-item label="支付方式">{{ currentOrder.pay_method || '-' }}</el-descriptions-item>
            <el-descriptions-item label="支付渠道">{{ getPayChannelText(currentOrder.pay_channel) }}</el-descriptions-item>
            <el-descriptions-item label="支付状态">{{ getPayStatusText(currentOrder.pay_status) }}</el-descriptions-item>
            <el-descriptions-item label="支付时间">{{ formatTime(currentOrder.pay_time) }}</el-descriptions-item>
            <el-descriptions-item label="商户单号">{{ currentOrder.out_trade_no || '-' }}</el-descriptions-item>
            <el-descriptions-item label="交易号">{{ currentOrder.third_trade_no || '-' }}</el-descriptions-item>
            <el-descriptions-item label="回调时间">{{ formatTime(currentOrder.notify_at) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never" style="margin-top: 20px;">
          <template #header>
            <span>收货信息</span>
          </template>
          <el-descriptions :column="1" border v-if="currentOrder.address_snapshot">
            <el-descriptions-item label="收货人">{{ currentOrder.address_snapshot.name }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ currentOrder.address_snapshot.phone }}</el-descriptions-item>
            <el-descriptions-item label="收货地址">
              {{ currentOrder.address_snapshot.province }}{{ currentOrder.address_snapshot.city }}{{ currentOrder.address_snapshot.district }}{{ currentOrder.address_snapshot.detail_address }}
            </el-descriptions-item>
          </el-descriptions>
          <div v-else>无</div>
        </el-card>

        <el-card shadow="never" style="margin-top: 20px;">
          <template #header>
            <span>物流信息</span>
          </template>
          <el-descriptions :column="2" border v-if="currentOrder.express_company">
            <el-descriptions-item label="快递公司">{{ currentOrder.express_company }}</el-descriptions-item>
            <el-descriptions-item label="快递单号">{{ currentOrder.express_no }}</el-descriptions-item>
            <el-descriptions-item label="发货时间">{{ formatTime(currentOrder.ship_time) }}</el-descriptions-item>
          </el-descriptions>
          <div v-else>暂无物流信息</div>
        </el-card>

        <el-card shadow="never" style="margin-top: 20px;">
          <template #header>
            <span>商品信息</span>
          </template>
          <el-table :data="currentOrder.items">
            <el-table-column label="商品" min-width="200">
              <template #default="{ row }">
                <div style="display: flex; align-items: center;">
                  <el-image :src="row.cover_image" fit="cover" style="width: 60px; height: 60px; border-radius: 4px;" />
                  <div style="margin-left: 10px;">
                    <div>{{ row.product_title }}</div>
                    <div style="font-size: 12px; color: #999;">{{ row.sku_name }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="单价" width="100">
              <template #default="{ row }">¥{{ row.price }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="subtotal" label="小计" width="100">
              <template #default="{ row }">
                <span style="color: #ff4a8d;">¥{{ row.subtotal }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-card shadow="never" style="margin-top: 20px;">
          <template #header>
            <span>费用信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="商品总价">¥{{ currentOrder.total_amount }}</el-descriptions-item>
            <el-descriptions-item label="运费">¥{{ currentOrder.freight_amount }}</el-descriptions-item>
            <el-descriptions-item label="优惠券抵扣">-¥{{ currentOrder.coupon_amount }}</el-descriptions-item>
            <el-descriptions-item label="实付金额">
              <span style="color: #ff4a8d; font-weight: bold; font-size: 18px;">¥{{ currentOrder.pay_amount }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never" style="margin-top: 20px;" v-if="currentOrder.remark">
          <template #header>
            <span>订单备注</span>
          </template>
          <div>{{ currentOrder.remark }}</div>
        </el-card>
      </div>
    </el-dialog>

    <!-- 发货弹窗 -->
    <el-dialog v-model="shipVisible" title="订单发货" width="500px">
      <el-form :model="shipForm" label-width="100px">
        <el-form-item label="快递公司">
          <el-select v-model="shipForm.express_company" placeholder="请选择快递公司">
            <el-option label="顺丰速运" value="顺丰速运" />
            <el-option label="圆通快递" value="圆通快递" />
            <el-option label="中通快递" value="中通快递" />
            <el-option label="韵达快递" value="韵达快递" />
            <el-option label="申通快递" value="申通快递" />
            <el-option label="京东物流" value="京东物流" />
            <el-option label="邮政EMS" value="邮政EMS" />
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号">
          <el-input v-model="shipForm.express_no" placeholder="请输入快递单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmShip">确认发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/utils/request.js';

const loading = ref(false);
const tableData = ref([]);
const detailVisible = ref(false);
const shipVisible = ref(false);
const currentOrder = ref(null);

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const queryForm = reactive({
  status: '',
  pay_status: '',
  order_no: ''
});

const shipForm = reactive({
  express_company: '',
  express_no: ''
});

onMounted(() => {
  loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...queryForm
    };
    const data = await request.get('/order/admin/list', { params });
    tableData.value = data?.list || [];
    pagination.total = data?.pagination?.total || 0;
  } catch (e) {
    console.error('加载订单失败', e);
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pagination.page = 1;
  loadData();
}

function handleReset() {
  queryForm.status = '';
  queryForm.pay_status = '';
  queryForm.order_no = '';
  pagination.page = 1;
  loadData();
}

function handleRowClick(row) {
  handleDetail(row);
}

function handleDetail(row) {
  currentOrder.value = row;
  detailVisible.value = true;
}

function handleShip(row) {
  currentOrder.value = row;
  shipForm.express_company = '';
  shipForm.express_no = '';
  shipVisible.value = true;
}

async function confirmShip() {
  if (!shipForm.express_company || !shipForm.express_no) {
    ElMessage.warning('请填写完整信息');
    return;
  }

  try {
    await request.put(`/order/admin/${currentOrder.value.id}/ship`, shipForm);
    ElMessage.success('发货成功');
    shipVisible.value = false;
    loadData();
  } catch (e) {
    console.error('发货失败', e);
  }
}

async function handleMockPaid(row) {
  try {
    await request.post('/payment/mock/success', {
      out_trade_no: row.out_trade_no,
      pay_channel: row.pay_channel || 'wechat',
    });
    ElMessage.success('模拟支付回调成功');
    loadData();
  } catch (e) {
    console.error('模拟支付回调失败', e);
  }
}

function handleRefund(row) {
  ElMessageBox.confirm('确定要退款该订单吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await request.put(`/order/admin/${row.id}/refund`);
      ElMessage.success('退款成功');
      loadData();
    } catch (e) {
      console.error('退款失败', e);
    }
  }).catch(() => {});
}

function getStatusType(status) {
  const map = {
    pending: 'warning',
    paid: 'info',
    shipped: 'primary',
    completed: 'success',
    cancelled: 'info',
    refunded: 'danger'
  };
  return map[status] || 'info';
}

function getStatusText(status) {
  const map = {
    pending: '待付款',
    paid: '已付款',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款'
  };
  return map[status] || status;
}

function getPayStatusType(status) {
  const map = {
    unpaid: 'info',
    paying: 'warning',
    paid: 'success',
    failed: 'danger',
    closed: 'info',
    refunding: 'warning',
    refunded: 'danger',
  };
  return map[status] || 'info';
}

function getPayStatusText(status) {
  const map = {
    unpaid: '未支付',
    paying: '支付中',
    paid: '已支付',
    failed: '支付失败',
    closed: '已关闭',
    refunding: '退款中',
    refunded: '已退款',
  };
  return map[status] || '-';
}

function getPayChannelText(channel) {
  const map = {
    wechat: '微信',
    alipay: '支付宝',
  };
  return map[channel] || '-';
}

function formatTime(time) {
  if (!time) return '-';
  const date = new Date(time);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
</script>

<style lang="scss" scoped>
.order-list {
  .filter-card {
    margin-bottom: 20px;
  }

  .goods-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .goods-name {
      flex: 1;
      margin-left: 10px;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .goods-count {
      margin-left: 10px;
      font-size: 12px;
      color: #999;
    }
  }
}
</style>
