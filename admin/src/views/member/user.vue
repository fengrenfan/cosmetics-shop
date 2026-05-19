<template>
  <div class="member-user-page">
    <el-card class="filter-card">
      <el-form inline>
        <el-form-item label="用户ID">
          <el-input v-model="userId" placeholder="输入用户ID" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadUser">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <template v-if="memberData">
      <el-card style="margin-top: 16px">
        <template #header><span>会员信息</span></template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="用户ID">{{ memberData.id }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ memberData.nickname }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ memberData.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="会员等级">{{ memberData.level?.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="累计下单">{{ memberData.order_count }}次</el-descriptions-item>
          <el-descriptions-item label="累计节省">¥{{ memberData.total_savings }}</el-descriptions-item>
          <el-descriptions-item label="直属邀请">{{ memberData.team_stats?.direct_count || 0 }}</el-descriptions-item>
          <el-descriptions-item label="二级邀请">{{ memberData.team_stats?.second_count || 0 }}</el-descriptions-item>
          <el-descriptions-item label="团队总人数">{{ memberData.team_stats?.team_total || 0 }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-form :model="editForm" inline label-width="90px">
          <el-form-item label="会员等级">
            <el-select v-model="editForm.member_level_id" placeholder="选择等级" clearable style="width: 180px">
              <el-option v-for="l in levels" :key="l.id" :label="l.name" :value="l.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="上级用户ID">
            <el-input-number v-model="editForm.parent_id" :min="0" controls-position="right" style="width: 160px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveUserMember" :loading="saving">保存</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card style="margin-top: 16px">
        <template #header>
          <div class="card-header">
            <span>部门业绩</span>
            <div>
              <el-select v-model="selectedPeriodId" placeholder="选择考核期" style="width: 160px; margin-right: 12px">
                <el-option v-for="p in periods" :key="p.id" :label="p.name" :value="p.id" />
              </el-select>
              <el-button type="primary" @click="loadDepartments">刷新</el-button>
              <el-button @click="recalculate">重新计算</el-button>
            </div>
          </div>
        </template>

        <el-table :data="departments" v-loading="deptLoading">
          <el-table-column prop="dept_name" label="部门名称" width="140" />
          <el-table-column label="负责人" min-width="180">
            <template #default="{ row }">
              {{ row.direct_user?.nickname }} / {{ row.direct_user?.phone }} / {{ row.direct_user?.level_name }}
            </template>
          </el-table-column>
          <el-table-column prop="total_members" label="总人数" width="90" />
          <el-table-column prop="total_performance" label="总业绩" width="110" />
          <el-table-column prop="effective_performance" label="有效业绩" width="110" />
          <el-table-column label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status_text }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="editDept(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card style="margin-top: 16px" v-if="memberData.direct_children?.length">
        <template #header><span>直属下级</span></template>
        <el-table :data="memberData.direct_children">
          <el-table-column prop="id" label="用户ID" width="100" />
          <el-table-column prop="nickname" label="昵称" />
          <el-table-column prop="phone" label="手机号" />
          <el-table-column prop="level_name" label="等级" />
        </el-table>
      </el-card>
    </template>

    <el-dialog v-model="deptDialogVisible" title="编辑部门业绩" width="480px">
      <el-form :model="deptForm" label-width="110px">
        <el-form-item label="部门名称">
          <el-input v-model="deptForm.dept_name" />
        </el-form-item>
        <el-form-item label="总人数">
          <el-input-number v-model="deptForm.total_members" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="总业绩">
          <el-input-number v-model="deptForm.total_performance" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="有效业绩">
          <el-input-number v-model="deptForm.effective_performance" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="deptForm.status">
            <el-radio :value="1">合格</el-radio>
            <el-radio :value="0">不合格</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deptDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDept" :loading="deptSaving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import request from '@/utils/request.js';

const route = useRoute();
const userId = ref(route.query.userId || '');
const memberData = ref(null);
const levels = ref([]);
const periods = ref([]);
const selectedPeriodId = ref(null);
const departments = ref([]);
const loading = ref(false);
const deptLoading = ref(false);
const saving = ref(false);
const deptDialogVisible = ref(false);
const deptSaving = ref(false);
const currentDept = ref(null);

const editForm = reactive({ member_level_id: null, parent_id: null });
const deptForm = reactive({
  dept_name: '',
  total_members: 0,
  total_performance: 0,
  effective_performance: 0,
  status: 0,
});

onMounted(async () => {
  levels.value = await request.get('/member/admin/levels') || [];
  periods.value = await request.get('/member/admin/periods') || [];
  const active = periods.value.find((p) => p.status === 1);
  if (active) selectedPeriodId.value = active.id;
  else if (periods.value.length) selectedPeriodId.value = periods.value[0].id;
  if (userId.value) loadUser();
});

watch(selectedPeriodId, () => {
  if (memberData.value) loadDepartments();
});

async function loadUser() {
  if (!userId.value) {
    ElMessage.warning('请输入用户ID');
    return;
  }
  loading.value = true;
  try {
    memberData.value = await request.get(`/member/admin/users/${userId.value}`);
    editForm.member_level_id = memberData.value.level?.id || null;
    editForm.parent_id = memberData.value.parent_id || null;
    await loadDepartments();
  } catch (e) {
    memberData.value = null;
  } finally {
    loading.value = false;
  }
}

async function saveUserMember() {
  saving.value = true;
  try {
    await request.put(`/member/admin/users/${userId.value}`, {
      member_level_id: editForm.member_level_id || null,
      parent_id: editForm.parent_id || null,
    });
    ElMessage.success('保存成功');
    loadUser();
  } finally {
    saving.value = false;
  }
}

async function loadDepartments() {
  if (!userId.value || !selectedPeriodId.value) return;
  deptLoading.value = true;
  try {
    const data = await request.get('/member/admin/departments', {
      params: {
        owner_user_id: userId.value,
        period_id: selectedPeriodId.value,
      },
    });
    departments.value = data?.departments || [];
  } finally {
    deptLoading.value = false;
  }
}

async function recalculate() {
  await request.post('/member/admin/departments/recalculate', {
    owner_user_id: +userId.value,
    period_id: selectedPeriodId.value,
  });
  ElMessage.success('重新计算完成');
  loadDepartments();
}

function editDept(row) {
  currentDept.value = row;
  Object.assign(deptForm, {
    dept_name: row.dept_name,
    total_members: row.total_members,
    total_performance: parseFloat(row.total_performance),
    effective_performance: parseFloat(row.effective_performance),
    status: row.status,
  });
  deptDialogVisible.value = true;
}

async function saveDept() {
  deptSaving.value = true;
  try {
    if (currentDept.value.id) {
      await request.put(`/member/admin/departments/${currentDept.value.id}`, deptForm);
    } else {
      await request.post('/member/admin/departments/upsert', {
        owner_user_id: +userId.value,
        direct_user_id: currentDept.value.direct_user.id,
        period_id: selectedPeriodId.value,
        ...deptForm,
      });
    }
    ElMessage.success('保存成功');
    deptDialogVisible.value = false;
    loadDepartments();
  } finally {
    deptSaving.value = false;
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
