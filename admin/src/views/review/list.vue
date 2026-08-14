<template>
  <div class="review-list">
    <el-card class="filter-card">
      <el-form inline>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable>
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="query.keyword" placeholder="评价内容/商品名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchList">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="用户" width="120">
          <template #default="{ row }">
            {{ row.user?.nickname || '匿名' }}
          </template>
        </el-table-column>
        <el-table-column label="商品" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.product?.title || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="评分" width="100">
          <template #default="{ row }">
            <el-rate :model-value="row.rating" disabled show-score />
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评价内容" min-width="200" show-overflow-tooltip />
        <el-table-column label="图片" width="100">
          <template #default="{ row }">
            <el-image v-for="(img, idx) in (row.images || []).slice(0, 3)" :key="idx"
              :src="img" fit="cover" style="width: 40px; height: 40px; border-radius: 4px; margin-right: 4px;"
              :preview-src-list="row.images" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="管理员回复" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.admin_reply || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="评价时间" width="170">
          <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 0" type="success" size="small" @click="handleApprove(row)">通过</el-button>
            <el-button v-if="row.status === 0" type="danger" size="small" @click="handleReject(row)">拒绝</el-button>
            <el-button type="primary" size="small" @click="handleReply(row)">回复</el-button>
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
import request from '@/utils/request.js';

const query = ref({ status: undefined, keyword: '', page: 1, limit: 20 });
const tableData = ref([]);
const total = ref(0);
const loading = ref(false);

onMounted(() => fetchList());

async function fetchList() {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (query.value.status !== undefined && query.value.status !== '') params.set('status', query.value.status);
    if (query.value.keyword) params.set('keyword', query.value.keyword);
    params.set('page', query.value.page);
    params.set('limit', query.value.limit);

    const res = await request.get('/reviews/admin', { params: Object.fromEntries(params) });
    tableData.value = res?.list || [];
    total.value = res?.total || 0;
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  query.value = { status: undefined, keyword: '', page: 1, limit: 20 };
  fetchList();
}

async function handleApprove(row) {
  await request.put(`/reviews/admin/${row.id}/approve`);
  ElMessage.success('已通过');
  fetchList();
}

async function handleReject(row) {
  await ElMessageBox.confirm('确定拒绝该评价？', '拒绝评价');
  await request.put(`/reviews/admin/${row.id}/reject`);
  ElMessage.success('已拒绝');
  fetchList();
}

async function handleReply(row) {
  const { value } = await ElMessageBox.prompt('输入回复内容', '回复评价', {
    inputType: 'textarea',
    inputValue: row.admin_reply || '',
  }).catch(() => ({ value: undefined }));
  if (value === undefined) return;
  await request.post(`/reviews/admin/${row.id}/reply`, { admin_reply: value });
  ElMessage.success('已回复');
  fetchList();
}

function getStatusType(status) {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' };
  return map[status] || 'info';
}
function getStatusText(status) {
  const map = { 0: '待审核', 1: '已通过', 2: '已拒绝' };
  return map[status] || '-';
}
function formatTime(t) {
  return t ? new Date(t).toLocaleString('zh-CN') : '';
}
</script>

<style scoped>
.filter-card { margin-bottom: 16px; }
</style>
