<template>
  <div class="category-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品分类</span>
          <el-button type="primary" @click="handleAdd">添加分类</el-button>
        </div>
      </template>

      <!-- 分类卡片视图 -->
      <div class="category-grid" v-loading="loading">
        <div 
          v-for="cat in tableData" 
          :key="cat.id" 
          class="category-card"
          :class="{ 'is-disabled': cat.status === 0 }"
        >
          <div class="card-main">
            <div class="card-icon">
              <el-image 
                v-if="cat.icon" 
                :src="cat.icon" 
                fit="cover" 
              />
              <el-icon v-else size="32"><Goods /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">{{ cat.name }}</div>
              <div class="card-meta">
                <el-tag size="small" type="info">L{{ cat.level }}</el-tag>
                <span class="sort-num">排序: {{ cat.sort_order }}</span>
              </div>
            </div>
            <div class="card-actions">
              <el-switch 
                v-model="cat.status" 
                :active-value="1" 
                :inactive-value="0"
                @change="handleStatusChange(cat)"
              />
              <el-button type="primary" link size="small" @click="handleEdit(cat)">编辑</el-button>
              <el-button type="danger" link size="small" @click="handleDelete(cat)">删除</el-button>
            </div>
          </div>
          
          <!-- 子分类 -->
          <div class="card-children" v-if="cat.children?.length">
            <div 
              v-for="child in cat.children" 
              :key="child.id" 
              class="child-item"
              :class="{ 'is-disabled': child.status === 0 }"
            >
              <span class="child-name">{{ child.name }}</span>
              <div class="child-actions">
                <el-switch 
                  v-model="child.status" 
                  :active-value="1" 
                  :inactive-value="0"
                  size="small"
                  @change="handleStatusChange(child)"
                />
                <el-button type="primary" link size="small" @click="handleEdit(child)">编辑</el-button>
                <el-button type="danger" link size="small" @click="handleDelete(child)">删除</el-button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="empty-category" v-if="!loading && tableData.length === 0">
          <el-empty description="暂无分类，点击「初始化类目」快速添加">
            <el-button type="primary" @click="handleInitCategories">初始化类目</el-button>
          </el-empty>
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑分类' : '添加分类'" 
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="上级分类" v-if="!isEdit">
          <el-select v-model="formData.parent_id" placeholder="请选择上级分类" clearable>
            <el-option label="顶级分类" :value="0" />
            <el-option 
              v-for="cat in flatCategories" 
              :key="cat.id" 
              :label="cat.name" 
              :value="cat.id"
              :disabled="cat.level >= 1"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类图标">
          <div class="icon-uploader">
            <el-image 
              v-if="formData.icon" 
              :src="formData.icon" 
              fit="cover"
              class="icon-preview"
            />
            <el-upload
              :show-file-list="false"
              :http-request="uploadIcon"
              class="icon-upload-btn"
            >
              <el-button size="small" type="primary">上传图标</el-button>
            </el-upload>
          </div>
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
import { ref, reactive, computed, onMounted } from 'vue';
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
  parent_id: 0,
  name: '',
  icon: '',
  sort_order: 0,
  status: 1
});

const formRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
};

// 将树形结构扁平化
const flatCategories = computed(() => {
  const flat = [];
  const flatten = (list, level = 1) => {
    list.forEach(item => {
      flat.push({ ...item, level });
      if (item.children?.length) {
        flatten(item.children, level + 1);
      }
    });
  };
  flatten(tableData.value);
  return flat;
});

onMounted(() => {
  loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const data = await request.get('/category/tree');
    tableData.value = data || [];
  } catch (e) {
    console.error('加载分类失败', e);
    ElMessage.error('加载分类失败');
  } finally {
    loading.value = false;
  }
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
    parent_id: row.parent_id,
    name: row.name,
    icon: row.icon || '',
    sort_order: row.sort_order,
    status: row.status
  });
  dialogVisible.value = true;
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定要删除分类「${row.name}」吗？删除后不可恢复！`, '删除确认', {
    type: 'warning'
  }).then(async () => {
    if (row.children?.length) {
      ElMessage.warning('请先删除子分类');
      return;
    }
    try {
      await request.delete(`/category/${row.id}`);
      ElMessage.success('删除成功');
      loadData();
    } catch (e) {
      console.error('删除失败', e);
    }
  }).catch(() => {});
}

async function handleStatusChange(row) {
  try {
    await request.put(`/category/${row.id}`, { status: row.status });
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
      await request.put(`/category/${formData.id}`, {
        name: formData.name,
        parent_id: formData.parent_id,
        sort_order: formData.sort_order,
        icon: formData.icon,
        status: formData.status
      });
      ElMessage.success('更新成功');
    } else {
      await request.post('/category', {
        name: formData.name,
        parent_id: formData.parent_id,
        sort_order: formData.sort_order,
        icon: formData.icon
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
    parent_id: 0,
    name: '',
    icon: '',
    sort_order: 0,
    status: 1
  });
}

async function uploadIcon(options) {
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
.category-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-actions {
    display: flex;
    gap: 10px;
  }

  .category-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .category-card {
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s;
    
    &:hover {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }
    
    &.is-disabled {
      opacity: 0.6;
      background: #fafafa;
    }
  }

  .card-main {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    gap: 16px;
  }

  .card-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    background: linear-gradient(135deg, #ff4a8d 0%, #ff6b6b 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
    
    .el-image {
      width: 56px;
      height: 56px;
      border-radius: 12px;
    }
  }

  .card-info {
    flex: 1;
    min-width: 0;
    
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
    }
    
    .card-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .sort-num {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .card-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .card-children {
    background: #fafafa;
    border-top: 1px solid #ebeef5;
    padding: 12px 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .child-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fff;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #ebeef5;
    
    &.is-disabled {
      opacity: 0.6;
    }
    
    .child-name {
      font-size: 13px;
      color: #606266;
    }
    
    .child-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .empty-category {
    padding: 60px 0;
    text-align: center;
  }
}

.icon-uploader {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-preview {
  width: 60px;
  height: 60px;
  border-radius: 4px;
}
</style>
