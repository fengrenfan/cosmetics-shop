<template>
  <div class="quick-entry-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>快捷入口配置</span>
          <el-button type="primary" @click="handleAdd">添加入口</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" row-key="id">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="图标" width="100">
          <template #default="{ row }">
            <el-image 
              v-if="row.icon" 
              :src="row.icon" 
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 8px;"
            />
            <span v-else>无图标</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="150" />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="跳转内容" min-width="150">
          <template #default="{ row }">
            <span v-if="row.type === 'product'">商品ID: {{ row.target_id }}</span>
            <span v-else-if="row.type === 'category'">分类ID: {{ row.target_id }}</span>
            <span v-else-if="row.type === 'url'">{{ row.target_id }}</span>
            <span v-else>无跳转</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch 
              v-model="row.status" 
              :active-value="1" 
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑快捷入口' : '添加快捷入口'" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>

        <el-form-item label="图标" prop="icon">
          <div class="image-uploader">
            <el-image 
              v-if="formData.icon" 
              :src="formData.icon" 
              fit="cover"
              class="image-preview"
            />
            <el-upload
              :show-file-list="false"
              :http-request="uploadImage"
              class="upload-btn"
            >
              <el-button type="primary" size="small">上传图标</el-button>
              <div class="upload-tip">建议尺寸 100x100</div>
            </el-upload>
          </div>
        </el-form-item>

        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio label="none">无跳转</el-radio>
            <el-radio label="product">商品</el-radio>
            <el-radio label="category">分类</el-radio>
            <el-radio label="url">链接</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="跳转内容" v-if="formData.type !== 'none'">
          <el-input 
            v-if="formData.type === 'product'" 
            v-model="formData.target_id" 
            placeholder="请输入商品ID"
            type="number"
          />
          <el-input 
            v-else-if="formData.type === 'category'" 
            v-model="formData.target_id" 
            placeholder="请输入分类ID"
            type="number"
          />
          <el-input 
            v-else-if="formData.type === 'url'" 
            v-model="formData.target_id" 
            placeholder="请输入链接地址"
          />
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="formData.sort_order" :min="0" :max="9999" />
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

const formData = reactive({
  id: null,
  title: '',
  icon: '',
  type: 'none',
  target_id: '',
  sort_order: 0,
  status: 1
});

const formRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
};

onMounted(() => {
  loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const data = await request.get('/quick-entry/admin');
    tableData.value = data || [];
  } catch (e) {
    console.error('加载数据失败', e);
    ElMessage.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

function getTypeText(type) {
  const map = {
    none: '无跳转',
    product: '商品',
    category: '分类',
    url: '链接'
  };
  return map[type] || type;
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
    icon: row.icon,
    type: row.type,
    target_id: row.target_id,
    sort_order: row.sort_order,
    status: row.status
  });
  dialogVisible.value = true;
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定要删除快捷入口「${row.title}」吗？`, '删除确认', {
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete(`/quick-entry/${row.id}`);
      ElMessage.success('删除成功');
      loadData();
    } catch (e) {
      console.error('删除失败', e);
    }
  }).catch(() => {});
}

async function handleStatusChange(row) {
  try {
    await request.put(`/quick-entry/${row.id}`, { status: row.status });
    ElMessage.success('状态更新成功');
  } catch (e) {
    row.status = row.status === 1 ? 0 : 1;
    console.error('更新状态失败', e);
  }
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    if (isEdit.value) {
      await request.put(`/quick-entry/${formData.id}`, {
        title: formData.title,
        icon: formData.icon,
        type: formData.type,
        target_id: formData.target_id,
        sort_order: formData.sort_order,
        status: formData.status
      });
      ElMessage.success('更新成功');
    } else {
      await request.post('/quick-entry', {
        title: formData.title,
        icon: formData.icon,
        type: formData.type,
        target_id: formData.target_id,
        sort_order: formData.sort_order,
        status: formData.status
      });
      ElMessage.success('创建成功');
    }
    dialogVisible.value = false;
    loadData();
  } catch (e) {
    console.error('提交失败', e);
  } finally {
    submitLoading.value = false;
  }
}

function resetForm() {
  Object.assign(formData, {
    id: null,
    title: '',
    icon: '',
    type: 'none',
    target_id: '',
    sort_order: 0,
    status: 1
  });
}

async function uploadImage(options) {
  const uploadFormData = new FormData();
  uploadFormData.append('file', options.file);

  try {
    const res = await request.post('/upload/image', uploadFormData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    formData.icon = 'http://118.25.192.73' + res.url;
    ElMessage.success('上传成功');
  } catch (e) {
    ElMessage.error('上传失败');
  }
}
</script>

<style lang="scss" scoped>
.quick-entry-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.image-uploader {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.image-preview {
  width: 80px;
  height: 80px;
  border-radius: 8px;
}

.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.upload-tip {
  font-size: 12px;
  color: #999;
}
</style>
