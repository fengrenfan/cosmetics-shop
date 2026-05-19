<template>
  <div class="member-period-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>考核期管理</span>
          <el-button type="primary" @click="handleAdd">添加考核期</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="period_code" label="期数编码" width="120" />
        <el-table-column prop="name" label="期数名称" width="120" />
        <el-table-column label="时间范围" min-width="200">
          <template #default="{ row }">{{ row.start_date }} ~ {{ row.end_date }}</template>
        </el-table-column>
        <el-table-column label="合格门槛" width="120">
          <template #default="{ row }">¥{{ row.qualified_threshold }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '进行中' : '已关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑考核期' : '添加考核期'" width="520px">
      <el-form :model="form" label-width="110px">
        <el-form-item label="期数编码" required>
          <el-input v-model="form.period_code" placeholder="如：202605" />
        </el-form-item>
        <el-form-item label="期数名称" required>
          <el-input v-model="form.name" placeholder="如：202605期" />
        </el-form-item>
        <el-form-item label="开始日期" required>
          <el-date-picker v-model="form.start_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束日期" required>
          <el-date-picker v-model="form.end_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="合格门槛(元)">
          <el-input-number v-model="form.qualified_threshold" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" v-if="isEdit">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">进行中</el-radio>
            <el-radio :value="0">已关闭</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/utils/request.js';

const loading = ref(false);
const submitting = ref(false);
const tableData = ref([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const editId = ref(null);

const form = reactive({
  period_code: '',
  name: '',
  start_date: '',
  end_date: '',
  qualified_threshold: 10000,
  status: 1,
});

onMounted(() => loadData());

async function loadData() {
  loading.value = true;
  try {
    tableData.value = await request.get('/member/admin/periods') || [];
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  isEdit.value = false;
  editId.value = null;
  Object.assign(form, {
    period_code: '',
    name: '',
    start_date: '',
    end_date: '',
    qualified_threshold: 10000,
    status: 1,
  });
  dialogVisible.value = true;
}

function handleEdit(row) {
  isEdit.value = true;
  editId.value = row.id;
  Object.assign(form, {
    period_code: row.period_code,
    name: row.name,
    start_date: row.start_date,
    end_date: row.end_date,
    qualified_threshold: Number(row.qualified_threshold),
    status: row.status,
  });
  dialogVisible.value = true;
}

async function handleSubmit() {
  if (!form.period_code || !form.name || !form.start_date || !form.end_date) {
    ElMessage.warning('请填写完整信息');
    return;
  }
  submitting.value = true;
  try {
    if (isEdit.value) {
      await request.put(`/member/admin/periods/${editId.value}`, form);
    } else {
      await request.post('/member/admin/periods', form);
    }
    ElMessage.success('保存成功');
    dialogVisible.value = false;
    loadData();
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm('确定删除该考核期？', '提示', { type: 'warning' });
  await request.delete(`/member/admin/periods/${row.id}`);
  ElMessage.success('删除成功');
  loadData();
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
