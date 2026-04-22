<template>
  <div class="banner-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>BANNER管理</span>
          <el-button type="primary" @click="handleAdd">添加BANNER</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="图片" width="200">
          <template #default="{ row }">
            <el-image 
              :src="row.image" 
              fit="cover"
              style="width: 160px; height: 80px; border-radius: 4px;"
              :preview-src-list="[row.image]"
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="150" />
        <el-table-column label="跳转类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ getLinkTypeText(row.link_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="跳转内容" min-width="150">
          <template #default="{ row }">
            <span v-if="row.link_type === 'product'">商品ID: {{ row.link_id }}</span>
            <span v-else-if="row.link_type === 'category'">分类ID: {{ row.link_id }}</span>
            <span v-else-if="row.link_type === 'url'">{{ row.link_id }}</span>
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
      :title="isEdit ? '编辑BANNER' : '添加BANNER'" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="Banner标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>

        <el-form-item label="副标题">
          <el-input v-model="formData.subtitle" placeholder="请输入副标题" />
        </el-form-item>

        <el-form-item label="标签">
          <el-input v-model="formData.tag" placeholder="如：新品上市、限时特惠" />
        </el-form-item>

        <el-form-item label="Banner图片" prop="image">
          <div class="image-uploader">
            <el-image 
              v-if="formData.image" 
              :src="formData.image" 
              fit="cover"
              class="image-preview"
            />
            <el-upload
              :show-file-list="false"
              :http-request="uploadImage"
              class="upload-btn"
            >
              <el-button type="primary" size="small">上传图片</el-button>
              <div class="upload-tip">建议尺寸 750x400</div>
            </el-upload>
          </div>
        </el-form-item>

        <el-form-item label="跳转类型" prop="link_type">
          <el-radio-group v-model="formData.link_type">
            <el-radio label="none">无跳转</el-radio>
            <el-radio label="product">商品</el-radio>
            <el-radio label="category">分类</el-radio>
            <el-radio label="url">链接</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="跳转内容" v-if="formData.link_type !== 'none'">
          <el-input 
            v-if="formData.link_type === 'product'" 
            v-model="formData.link_id" 
            placeholder="请输入商品ID"
            type="number"
          />
          <el-input 
            v-else-if="formData.link_type === 'category'" 
            v-model="formData.link_id" 
            placeholder="请输入分类ID"
            type="number"
          />
          <el-input 
            v-else-if="formData.link_type === 'url'" 
            v-model="formData.link_id" 
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
  subtitle: '',
  tag: '',
  image: '',
  link_type: 'none',
  link_id: '',
  sort_order: 0,
  status: 1
});

const formRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  image: [{ required: true, message: '请上传图片', trigger: 'change' }],
  link_type: [{ required: true, message: '请选择跳转类型', trigger: 'change' }]
};

onMounted(() => {
  loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const data = await request.get('/banner/admin');
    tableData.value = data || [];
  } catch (e) {
    console.error('加载数据失败', e);
    ElMessage.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

function getLinkTypeText(type) {
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
    subtitle: row.subtitle || '',
    tag: row.tag || '',
    image: row.image,
    link_type: row.link_type,
    link_id: row.link_id,
    sort_order: row.sort_order,
    status: row.status
  });
  dialogVisible.value = true;
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定要删除BANNER「${row.title}」吗？`, '删除确认', {
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete(`/banner/${row.id}`);
      ElMessage.success('删除成功');
      loadData();
    } catch (e) {
      console.error('删除失败', e);
    }
  }).catch(() => {});
}

async function handleStatusChange(row) {
  try {
    await request.put(`/banner/${row.id}`, { status: row.status });
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
      await request.put(`/banner/${formData.id}`, {
        title: formData.title,
        subtitle: formData.subtitle,
        tag: formData.tag,
        image: formData.image,
        link_type: formData.link_type,
        link_id: formData.link_id,
        sort_order: formData.sort_order,
        status: formData.status
      });
      ElMessage.success('更新成功');
    } else {
      await request.post('/banner', {
        title: formData.title,
        subtitle: formData.subtitle,
        tag: formData.tag,
        image: formData.image,
        link_type: formData.link_type,
        link_id: formData.link_id,
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
    image: '',
    link_type: 'none',
    link_id: '',
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
    // 拼接完整URL
    formData.image = 'http://118.25.192.73' + res.url;
    ElMessage.success('上传成功');
  } catch (e) {
    ElMessage.error('上传失败');
  }
}
</script>

<style lang="scss" scoped>
.banner-page {
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
  width: 300px;
  height: 150px;
  border-radius: 4px;
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
