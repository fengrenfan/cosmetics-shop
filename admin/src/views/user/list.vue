<template>
  <div class="user-list">
    <!-- 筛选 -->
    <el-card class="filter-card">
      <el-form inline :model="queryForm">
        <el-form-item label="用户ID">
          <el-input v-model="queryForm.id" placeholder="请输入用户ID" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="queryForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="用户状态">
          <el-select v-model="queryForm.status" placeholder="全部" clearable>
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="id" label="用户ID" width="100" />
        <el-table-column label="用户信息" width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.avatar">
                {{ row.nickname?.charAt(0) || '用' }}
              </el-avatar>
              <div class="user-detail">
                <div class="nickname">{{ row.nickname || '-' }}</div>
                <div class="phone">{{ row.phone || '-' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="性别" width="80">
          <template #default="{ row }">
            {{ getGenderText(row.gender) }}
          </template>
        </el-table-column>
        <el-table-column prop="openid" label="OpenID" min-width="150" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="登录信息" width="180">
          <template #default="{ row }">
            <div style="font-size: 12px; color: #999;">
              <div>最后登录: {{ formatTime(row.last_login_at) }}</div>
              <div>注册时间: {{ formatTime(row.created_at) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
            <el-button :type="row.status === 1 ? 'danger' : 'success'" link @click="toggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
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

    <!-- 用户详情弹窗 -->
    <el-dialog v-model="detailVisible" title="用户详情" width="700px">
      <div class="user-detail" v-if="currentUser">
        <el-card shadow="never">
          <template #header>
            <span>基本信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ currentUser.nickname || '-' }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ currentUser.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ getGenderText(currentUser.gender) }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="currentUser.status === 1 ? 'success' : 'danger'">
                {{ currentUser.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ formatTime(currentUser.created_at) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never" style="margin-top: 20px;">
          <template #header>
            <span>登录信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="OpenID">{{ currentUser.openid || '-' }}</el-descriptions-item>
            <el-descriptions-item label="UnionID">{{ currentUser.unionid || '-' }}</el-descriptions-item>
            <el-descriptions-item label="最后登录时间">{{ formatTime(currentUser.last_login_at) }}</el-descriptions-item>
            <el-descriptions-item label="最后登录IP">{{ currentUser.last_login_ip || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never" style="margin-top: 20px;">
          <template #header>
            <span>其他信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户等级">{{ currentUser.level || 1 }}级</el-descriptions-item>
            <el-descriptions-item label="用户积分">{{ currentUser.points || 0 }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
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
const currentUser = ref(null);

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const queryForm = reactive({
  id: '',
  phone: '',
  status: null
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
    // 暂时使用模拟数据
    tableData.value = [
      {
        id: 1,
        nickname: '测试用户',
        phone: '13800138000',
        avatar: '',
        gender: 1,
        openid: 'ox1234567890abcdef',
        unionid: null,
        status: 1,
        level: 1,
        points: 100,
        last_login_at: new Date(),
        last_login_ip: '127.0.0.1',
        created_at: new Date()
      },
      {
        id: 2,
        nickname: '美妆达人',
        phone: '13900139000',
        avatar: '',
        gender: 2,
        openid: 'ox234567890abcdef1',
        unionid: null,
        status: 1,
        level: 2,
        points: 500,
        last_login_at: new Date(),
        created_at: new Date()
      }
    ];
    pagination.total = 2;
  } catch (e) {
    console.error('加载用户失败', e);
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pagination.page = 1;
  loadData();
}

function handleReset() {
  queryForm.id = '';
  queryForm.phone = '';
  queryForm.status = null;
  pagination.page = 1;
  loadData();
}

function handleDetail(row) {
  currentUser.value = row;
  detailVisible.value = true;
}

async function toggleStatus(row) {
  const action = row.status === 1 ? '禁用' : '启用';
  ElMessageBox.confirm(`确定要${action}该用户吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      // await request.put(`/user/${row.id}/status`, { status: row.status === 1 ? 0 : 1 });
      row.status = row.status === 1 ? 0 : 1;
      ElMessage.success(`${action}成功`);
    } catch (e) {
      console.error(`${action}失败`, e);
    }
  }).catch(() => {});
}

function getGenderText(gender) {
  const map = { 0: '未知', 1: '男', 2: '女' };
  return map[gender] || '未知';
}

function formatTime(time) {
  if (!time) return '-';
  const date = new Date(time);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
</script>

<style lang="scss" scoped>
.user-list {
  .filter-card {
    margin-bottom: 20px;
  }

  .user-info {
    display: flex;
    align-items: center;
    
    .user-detail {
      margin-left: 12px;
      
      .nickname {
        font-size: 14px;
        color: #333;
      }
      
      .phone {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
      }
    }
  }
}
</style>
