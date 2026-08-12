<template>
  <div class="after-sale-list">
    <el-card class="filter-card">
      <el-form inline>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="query.keyword" placeholder="售后单号/手机号" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchList">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="refund_no" label="售后单号" width="180" />
        <el-table-column label="用户" width="120">
          <template #default="{ row }">{{ row.user?.nickname || row.user?.phone || '-' }}</template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'refund' ? 'warning' : 'danger'" size="small">
              {{ row.type === 'refund' ? '仅退款' : '退货退款' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="refund_amount" label="退款金额" width="100">
          <template #default="{ row }"><span style="color: #f56c6c; font-weight: bold;">¥{{ row.refund_amount }}</span></template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" min-width="150" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="申请时间" width="170">
          <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" type="success" size="small" @click="handleApprove(row)">通过</el-button>
            <el-button v-if="row.status === 'pending'" type="danger" size="small" @click="handleReject(row)">拒绝</el-button>
            <el-button v-if="row.status === 'approved'" type="primary" size="small" @click="handleRefund(row)">确认退款</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.limit"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="fetchList"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const query = ref({ status: '', keyword: '', page: 1, limit: 20 });
const tableData = ref([]);
const total = ref(0);
const loading = ref(false);

onMounted(() => fetchList());

async function fetchList() {
  loading.value = true;
  try {
    const res = await fetch(`/api/after-sales/admin?${new URLSearchParams(query.value)}`);
    const data = await res.json();
    tableData.value = data.data?.list || [];
    total.value = data.data?.total || 0;
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  query.value = { status: '', keyword: '', page: 1, limit: 20 };
  fetchList();
}

async function handleApprove(row) {
  const { value } = await ElMessageBox.prompt('审批备注（选填）', '审批通过', { inputType: 'textarea' }).catch(() => ({ value: undefined }));
  if (value === undefined) return;
  await fetch(`/api/after-sales/admin/${row.id}/approve`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_remark: value }),
  });
  ElMessage.success('已通过');
  fetchList();
}

async function handleReject(row) {
  const { value } = await ElMessageBox.prompt('拒绝原因', '审批拒绝', { inputType: 'textarea' }).catch(() => ({ value: undefined }));
  if (value === undefined) return;
  await fetch(`/api/after-sales/admin/${row.id}/reject`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_remark: value }),
  });
  ElMessage.success('已拒绝');
  fetchList();
}

async function handleRefund(row) {
  await ElMessageBox.confirm(`确认退款 ¥${row.refund_amount}？`, '确认退款');
  await fetch(`/api/after-sales/admin/${row.id}/refund`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_remark: '已退款' }),
  });
  ElMessage.success('退款成功');
  fetchList();
}

function getStatusType(status) {
  const map = { pending: 'warning', approved: 'success', rejected: 'danger', refunded: 'success', refunding: 'info' };
  return map[status] || 'info';
}
function getStatusText(status) {
  const map = { pending: '待审核', approved: '已通过', rejected: '已拒绝', refunding: '退款中', refunded: '已退款' };
  return map[status] || status;
}
function formatTime(t) {
  return t ? new Date(t).toLocaleString('zh-CN') : '';
}
</script>

<style scoped>
.filter-card { margin-bottom: 16px; }
.table-card { margin-bottom: 16px; }
</style>
