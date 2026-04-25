<template>
  <div class="coupon-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>优惠券管理</span>
          <el-button type="primary" @click="handleAdd">添加优惠券</el-button>
        </div>
      </template>

      <!-- 筛选 -->
      <el-form inline :model="queryForm" class="filter-form">
        <el-form-item label="优惠券名称">
          <el-input v-model="queryForm.title" placeholder="请输入名称" clearable />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="queryForm.type" placeholder="全部" clearable>
            <el-option label="满减券" :value="1" />
            <el-option label="折扣券" :value="2" />
            <el-option label="无门槛券" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="全部" clearable>
            <el-option label="投放中" :value="1" />
            <el-option label="已下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="优惠券信息" min-width="200">
          <template #default="{ row }">
            <div class="coupon-info">
              <div class="coupon-name">{{ row.title }}</div>
              <div class="coupon-desc">{{ row.description || '无描述' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="优惠内容" width="150">
          <template #default="{ row }">
            <div class="coupon-value">
              <span class="amount" v-if="row.type === 1">满{{ row.min_amount }}减{{ row.value }}</span>
              <span class="amount" v-else-if="row.type === 2">{{ row.value }}折</span>
              <span class="amount" v-else>无门槛{{ row.value }}元</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="total_count" label="发行量" width="100" />
        <el-table-column prop="claimed_count" label="已领取" width="100" />
        <el-table-column prop="used_count" label="已使用" width="100" />
        <el-table-column label="有效期" width="180">
          <template #default="{ row }">
            <div style="font-size: 12px; color: #666;">
              {{ formatDate(row.start_time) }}<br/>{{ formatDate(row.end_time) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '投放中' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button :type="row.status === 1 ? 'warning' : 'success'" link @click="toggleStatus(row)">
              {{ row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button type="success" link @click="handleGrant(row)">发放</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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

    <!-- 添加/编辑弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑优惠券' : '添加优惠券'" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="优惠券名称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入优惠券名称" />
        </el-form-item>

        <el-form-item label="优惠类型" prop="type">
          <el-radio-group v-model="formData.type" @change="onTypeChange">
            <el-radio :label="1">满减券</el-radio>
            <el-radio :label="2">折扣券</el-radio>
            <el-radio :label="3">无门槛券</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="优惠金额" prop="value" v-if="formData.type !== 2">
          <el-input-number 
            v-model="formData.value" 
            :min="1" 
            :max="formData.type === 3 ? 999 : 9999"
          />
          <span style="margin-left: 10px; color: #999;">元</span>
        </el-form-item>

        <el-form-item label="折扣力度" prop="value" v-if="formData.type === 2">
          <el-input-number 
            v-model="formData.value" 
            :min="1" 
            :max="9.9"
            :precision="1"
          />
          <span style="margin-left: 10px; color: #999;">折</span>
        </el-form-item>

        <el-form-item label="使用门槛" prop="min_amount">
          <el-input-number v-model="formData.min_amount" :min="0" :max="99999" />
          <span style="margin-left: 10px; color: #999;">元（0表示无门槛）</span>
        </el-form-item>

        <el-form-item label="发行总量" prop="total_count">
          <el-input-number v-model="formData.total_count" :min="1" :max="999999" />
        </el-form-item>

        <el-form-item label="每人限领" prop="per_limit">
          <el-input-number v-model="formData.per_limit" :min="1" :max="99" />
          <span style="margin-left: 10px; color: #999;">张</span>
        </el-form-item>

        <el-form-item label="有效期" prop="dateRange">
          <el-date-picker
            v-model="formData.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="描述">
          <el-input 
            v-model="formData.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入优惠券描述"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 发放优惠券弹窗 -->
    <el-dialog v-model="grantDialogVisible" title="发放优惠券" width="500px">
      <el-form :model="grantForm" label-width="100px">
        <el-form-item label="优惠券">
          <span class="grant-coupon-name">{{ grantForm.couponTitle }}</span>
        </el-form-item>
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="grantForm.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="grantForm.phone" placeholder="输入手机号查找用户" clearable @clear="grantForm.userId = ''">
            <template #append>
              <el-button @click="searchUser">查找</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="用户信息" v-if="grantForm.userInfo">
          <el-tag type="success">{{ grantForm.userInfo.nickname }}</el-tag>
          <span style="margin-left: 10px; color: #666;">ID: {{ grantForm.userInfo.id }}</span>
        </el-form-item>
        <el-form-item label="发放数量">
          <el-input-number v-model="grantForm.count" :min="1" :max="10" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="grantDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmGrant" :loading="grantLoading">确认发放</el-button>
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
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const formRef = ref(null);
const grantDialogVisible = ref(false);
const grantLoading = ref(false);
const grantForm = reactive({
  couponId: null,
  couponTitle: '',
  userId: '',
  phone: '',
  count: 1,
  userInfo: null
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const queryForm = reactive({
  title: '',
  type: null,
  status: null
});

const formData = reactive({
  id: null,
  title: '',
  type: 1,
  value: 10,
  min_amount: 0,
  total_count: 100,
  per_limit: 1,
  dateRange: [],
  start_time: '',
  end_time: '',
  description: '',
  status: 1
});

const formRules = {
  title: [{ required: true, message: '请输入优惠券名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择优惠类型', trigger: 'change' }],
  value: [{ required: true, message: '请输入优惠金额', trigger: 'blur' }],
  total_count: [{ required: true, message: '请输入发行总量', trigger: 'blur' }],
  dateRange: [{ required: true, message: '请选择有效期', trigger: 'change' }]
};

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
    const res = await request.get('/coupon/admin/list', { params });
    tableData.value = res.data || res || [];
    pagination.total = tableData.value.length;
  } catch (e) {
    console.error('加载优惠券失败', e);
    ElMessage.error('加载优惠券失败');
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pagination.page = 1;
  loadData();
}

function handleReset() {
  queryForm.title = '';
  queryForm.type = null;
  queryForm.status = null;
  pagination.page = 1;
  loadData();
}

function handleAdd() {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
}

function handleEdit(row) {
  isEdit.value = true;
  Object.assign(formData, {
    id: row.id,
    title: row.title,
    type: row.type,
    value: row.value,
    min_amount: row.min_amount,
    total_count: row.total_count,
    per_limit: row.per_limit || 1,
    dateRange: [row.start_time, row.end_time],
    description: row.description,
    status: row.status
  });
  dialogVisible.value = true;
}

function handleDelete(row) {
  ElMessageBox.confirm('确定要删除该优惠券吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete(`/coupon/admin/${row.id}`);
      const index = tableData.value.findIndex(item => item.id === row.id);
      if (index > -1) {
        tableData.value.splice(index, 1);
      }
      ElMessage.success('删除成功');
    } catch (e) {
      console.error('删除失败', e);
      ElMessage.error('删除失败');
    }
  }).catch(() => {});
}

async function toggleStatus(row) {
  try {
    const newStatus = row.status === 1 ? 0 : 1;
    await request.put(`/coupon/admin/${row.id}`, { status: newStatus });
    row.status = newStatus;
    ElMessage.success(row.status === 1 ? '上架成功' : '下架成功');
  } catch (e) {
    console.error('更新状态失败', e);
    ElMessage.error('更新状态失败');
  }
}

function onTypeChange(type) {
  // 切换类型时重置优惠值
  if (type === 1) {
    formData.value = 10;
    formData.min_amount = 100;
  } else if (type === 2) {
    formData.value = 9;
    formData.min_amount = 0;
  } else {
    formData.value = 10;
    formData.min_amount = 0;
  }
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    // 处理日期范围
    if (formData.dateRange && formData.dateRange.length === 2) {
      formData.start_time = formData.dateRange[0];
      formData.end_time = formData.dateRange[1];
    }

    // 构建提交数据，确保数字类型
    const typeMap = { 1: 'cash', 2: 'discount', 3: 'noThreshold' };
    const submitData = {
      title: formData.title,
      type: typeMap[formData.type] || formData.type,
      value: Number(formData.value),
      min_amount: Number(formData.min_amount),
      total_count: Number(formData.total_count),
      per_limit: Number(formData.per_limit),
      start_time: formData.start_time,
      end_time: formData.end_time,
      description: formData.description,
      status: Number(formData.status),
    };

    if (isEdit.value) {
      await request.put(`/coupon/admin/${formData.id}`, submitData);
      ElMessage.success('更新成功');
    } else {
      await request.post('/coupon/admin', submitData);
      ElMessage.success('创建成功');
    }
    dialogVisible.value = false;
    loadData();
  } catch (e) {
    console.error('提交失败', e);
    ElMessage.error('提交失败');
  } finally {
    submitLoading.value = false;
  }
}

function resetForm() {
  Object.assign(formData, {
    id: null,
    title: '',
    type: 1,
    value: 10,
    min_amount: 100,
    total_count: 100,
    per_limit: 1,
    dateRange: [],
    start_time: '',
    end_time: '',
    description: '',
    status: 1
  });
}

function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function handleGrant(row) {
  grantForm.couponId = row.id;
  grantForm.couponTitle = row.title;
  grantForm.userId = '';
  grantForm.phone = '';
  grantForm.count = 1;
  grantForm.userInfo = null;
  grantDialogVisible.value = true;
}

async function searchUser() {
  if (!grantForm.phone) {
    ElMessage.warning('请输入手机号');
    return;
  }
  try {
    const res = await request.get('/user/admin/search', { params: { phone: grantForm.phone } });
    if (res.data) {
      grantForm.userInfo = res.data;
      grantForm.userId = res.data.id;
    } else {
      ElMessage.warning('未找到该用户');
      grantForm.userInfo = null;
    }
  } catch (e) {
    console.error('查找用户失败', e);
    ElMessage.error('查找用户失败');
  }
}

async function confirmGrant() {
  if (!grantForm.userId) {
    ElMessage.warning('请先查找并确认用户');
    return;
  }
  grantLoading.value = true;
  try {
    for (let i = 0; i < grantForm.count; i++) {
      await request.post('/coupon/admin/grant', {
        user_id: Number(grantForm.userId),
        coupon_id: grantForm.couponId
      });
    }
    ElMessage.success(`成功发放 ${grantForm.count} 张优惠券`);
    grantDialogVisible.value = false;
  } catch (e) {
    console.error('发放失败', e);
    ElMessage.error('发放失败');
  } finally {
    grantLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.coupon-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .filter-form {
    margin-bottom: 20px;

    :deep(.el-select) {
      width: 100%;
    }
  }

  .coupon-info {
    .coupon-name {
      font-size: 14px;
      color: #333;
      font-weight: bold;
    }

    .coupon-desc {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
  }

  .coupon-value {
    .amount {
      color: #ff4a8d;
      font-weight: bold;
    }
  }
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-form-item__content) {
  width: 100%;
}

.grant-coupon-name {
  color: #ff4a8d;
  font-weight: bold;
}
</style>
