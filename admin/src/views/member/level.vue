<template>
  <div class="member-level-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>会员等级管理</span>
          <el-button type="primary" @click="handleAdd">添加等级</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="等级名称" min-width="120" />
        <el-table-column label="折扣率" width="100">
          <template #default="{ row }">{{ row.discount_rate }}%</template>
        </el-table-column>
        <el-table-column prop="benefit_desc" label="权益描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="sort_order" label="排序" width="80" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑等级' : '添加等级'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="等级名称" required>
          <el-input v-model="form.name" placeholder="如：特级经销商" />
        </el-form-item>
        <el-form-item label="折扣率(%)" required>
          <el-input-number v-model="form.discount_rate" :min="1" :max="100" :precision="2" />
        </el-form-item>
        <el-form-item label="权益描述">
          <el-input v-model="form.benefit_desc" type="textarea" rows="3" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort_order" :min="0" />
        </el-form-item>
        <el-form-item label="状态" v-if="isEdit">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
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
  name: '',
  discount_rate: 100,
  benefit_desc: '',
  sort_order: 0,
  status: 1,
});

onMounted(() => loadData());

async function loadData() {
  loading.value = true;
  try {
    tableData.value = await request.get('/member/admin/levels') || [];
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  isEdit.value = false;
  editId.value = null;
  Object.assign(form, { name: '', discount_rate: 100, benefit_desc: '', sort_order: 0, status: 1 });
  dialogVisible.value = true;
}

function handleEdit(row) {
  isEdit.value = true;
  editId.value = row.id;
  Object.assign(form, {
    name: row.name,
    discount_rate: Number(row.discount_rate),
    benefit_desc: row.benefit_desc || '',
    sort_order: row.sort_order,
    status: row.status,
  });
  dialogVisible.value = true;
}

async function handleSubmit() {
  if (!form.name) {
    ElMessage.warning('请填写等级名称');
    return;
  }
  submitting.value = true;
  try {
    if (isEdit.value) {
      await request.put(`/member/admin/levels/${editId.value}`, form);
    } else {
      await request.post('/member/admin/levels', form);
    }
    ElMessage.success('保存成功');
    dialogVisible.value = false;
    loadData();
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm('确定删除该等级？', '提示', { type: 'warning' });
  await request.delete(`/member/admin/levels/${row.id}`);
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
