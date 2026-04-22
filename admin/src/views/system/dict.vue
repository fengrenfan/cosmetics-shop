<template>
  <div class="dict-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>字典管理</span>
        </div>
      </template>

      <div class="dict-layout">
        <!-- 左侧：字典列表 + 添加表单 -->
        <div class="left-panel">
          <div class="section">
            <h4>字典列表</h4>
            <el-table 
              :data="dictList" 
              v-loading="loading" 
              size="small"
              highlight-current-row
              @row-click="handleSelectDict"
              :class="{ 'selected-row': selectedDict }"
              style="cursor: pointer;"
            >
              <el-table-column prop="dict_name" label="字典名称" />
              <el-table-column prop="dict_code" label="字典编码" width="120" />
              <el-table-column prop="sort_order" label="排序" width="60" />
              <el-table-column label="状态" width="60">
                <template #default="{ row }">
                  <el-tag type="success" size="small" v-if="row.status === 1">启用</el-tag>
                  <el-tag type="info" size="small" v-else>禁用</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{ row }">
                  <el-button type="danger" link size="small" @click.stop="handleDeleteDict(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <el-divider />

          <div class="section">
            <h4>{{ selectedDict ? '添加字典项' : '添加字典' }}</h4>
            <el-form ref="dictFormRef" :model="dictForm" :rules="dictRules" label-width="90px" size="small">
              <el-form-item label="字典名称" prop="dict_name">
                <el-input v-model="dictForm.dict_name" placeholder="请输入字典名称" />
              </el-form-item>
              <el-form-item label="字典编码" prop="dict_code">
                <el-input v-model="dictForm.dict_code" placeholder="请输入字典编码" :disabled="!!selectedDict" />
              </el-form-item>
              <el-form-item label="描述">
                <el-input v-model="dictForm.description" type="textarea" rows="2" placeholder="请输入描述" />
              </el-form-item>
              <el-form-item label="排序">
                <el-input-number v-model="dictForm.sort_order" :min="0" :max="9999" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSubmitDict" :loading="submitLoading">
                  {{ selectedDict ? '添加字典项' : '添加字典' }}
                </el-button>
                <el-button @click="handleResetDict" v-if="!selectedDict">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- 右侧：字典项列表 -->
        <div class="right-panel">
          <div class="section">
            <div class="section-header">
              <h4>字典项列表</h4>
              <div class="header-actions">
                <span class="dict-info" v-if="selectedDict">
                  {{ selectedDict.dict_name }} ({{ selectedDict.dict_code }})
                </span>
                <el-button type="primary" size="small" @click="handleAddItem" v-if="selectedDict">
                  添加字典项
                </el-button>
              </div>
            </div>
            <el-table 
              :data="dictItemList" 
              v-loading="itemLoading" 
              size="small"
              border
            >
              <el-table-column prop="item_label" label="标签" />
              <el-table-column prop="item_value" label="值" />
              <el-table-column prop="sort_order" label="排序" width="80" />
              <el-table-column label="状态" width="80">
                <template #default="{ row }">
                  <el-switch 
                    v-model="row.status" 
                    :active-value="1" 
                    :inactive-value="0"
                    @change="handleItemStatusChange(row)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="handleEditItem(row)">编辑</el-button>
                  <el-button type="danger" link size="small" @click="handleDeleteItem(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="empty-tip" v-if="!selectedDict">
              <el-empty description="请先选择左侧字典" />
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 编辑字典项弹窗 -->
    <el-dialog v-model="itemDialogVisible" :title="isEditItem ? '编辑字典项' : '添加字典项'" width="400px">
      <el-form ref="itemFormRef" :model="itemForm" :rules="itemRules" label-width="80px">
        <el-form-item label="标签" prop="item_label">
          <el-input v-model="itemForm.item_label" placeholder="请输入标签" />
        </el-form-item>
        <el-form-item label="值" prop="item_value">
          <el-input v-model="itemForm.item_value" placeholder="请输入值" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="itemForm.sort_order" :min="0" :max="9999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="itemDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitItem" :loading="itemSubmitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/utils/request.js';

const loading = ref(false);
const itemLoading = ref(false);
const submitLoading = ref(false);
const itemSubmitLoading = ref(false);

const dictList = ref([]);
const dictItemList = ref([]);
const selectedDict = ref(null);

const dictFormRef = ref(null);
const itemFormRef = ref(null);
const itemDialogVisible = ref(false);
const isEditItem = ref(false);

const dictForm = reactive({
  dict_name: '',
  dict_code: '',
  description: '',
  sort_order: 0
});

const itemForm = reactive({
  id: null,
  item_label: '',
  item_value: '',
  sort_order: 0
});

const dictRules = {
  dict_name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  dict_code: [{ required: true, message: '请输入字典编码', trigger: 'blur' }]
};

const itemRules = {
  item_label: [{ required: true, message: '请输入标签', trigger: 'blur' }],
  item_value: [{ required: true, message: '请输入值', trigger: 'blur' }]
};

onMounted(() => {
  loadDictList();
});

async function loadDictList() {
  loading.value = true;
  try {
    const data = await request.get('/dict/list');
    dictList.value = data || [];
  } catch (e) {
    console.error('加载字典列表失败', e);
  } finally {
    loading.value = false;
  }
}

async function handleSelectDict(row) {
  selectedDict.value = row;
  dictForm.dict_name = '';
  dictForm.dict_code = '';
  dictForm.description = '';
  dictForm.sort_order = 0;
  await loadDictItems(row.id);
}

async function loadDictItems(dictId) {
  itemLoading.value = true;
  try {
    const data = await request.get('/dict/item', { params: { dictId } });
    dictItemList.value = data || [];
  } catch (e) {
    console.error('加载字典项失败', e);
  } finally {
    itemLoading.value = false;
  }
}

async function handleSubmitDict() {
  const valid = await dictFormRef.value.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    if (selectedDict.value) {
      // 添加字典项
      await request.post('/dict/item', {
        dict_id: selectedDict.value.id,
        item_label: dictForm.dict_name,
        item_value: dictForm.dict_code,
        sort_order: dictForm.sort_order
      });
      ElMessage.success('添加成功');
      dictForm.dict_name = '';
      dictForm.dict_code = '';
      dictForm.sort_order = 0;
      await loadDictItems(selectedDict.value.id);
    } else {
      // 添加字典
      await request.post('/dict', {
        dict_name: dictForm.dict_name,
        dict_code: dictForm.dict_code,
        description: dictForm.description,
        sort_order: dictForm.sort_order
      });
      ElMessage.success('添加成功');
      handleResetDict();
      await loadDictList();
    }
  } catch (e) {
    console.error('提交失败', e);
  } finally {
    submitLoading.value = false;
  }
}

function handleResetDict() {
  dictFormRef.value.resetFields();
  dictForm.dict_name = '';
  dictForm.dict_code = '';
  dictForm.description = '';
  dictForm.sort_order = 0;
}

async function handleDeleteDict(row) {
  try {
    await ElMessageBox.confirm(`确定要删除字典「${row.dict_name}」吗？`, '提示', { type: 'warning' });
    await request.delete(`/dict/${row.id}`);
    ElMessage.success('删除成功');
    if (selectedDict.value?.id === row.id) {
      selectedDict.value = null;
      dictItemList.value = [];
    }
    await loadDictList();
  } catch (e) {
    if (e !== 'cancel') console.error('删除失败', e);
  }
}

async function handleItemStatusChange(row) {
  try {
    await request.put(`/dict/item/${row.id}`, { status: row.status });
    ElMessage.success('状态更新成功');
  } catch (e) {
    row.status = row.status === 1 ? 0 : 1;
    console.error('更新状态失败', e);
  }
}

function handleEditItem(row) {
  isEditItem.value = true;
  Object.assign(itemForm, {
    id: row.id,
    item_label: row.item_label,
    item_value: row.item_value,
    sort_order: row.sort_order
  });
  itemDialogVisible.value = true;
}

function handleAddItem() {
  isEditItem.value = false;
  Object.assign(itemForm, {
    id: null,
    item_label: '',
    item_value: '',
    sort_order: 0
  });
  itemDialogVisible.value = true;
}

async function handleSubmitItem() {
  const valid = await itemFormRef.value.validate().catch(() => false);
  if (!valid) return;

  itemSubmitLoading.value = true;
  try {
    if (isEditItem.value) {
      await request.put(`/dict/item/${itemForm.id}`, {
        item_label: itemForm.item_label,
        item_value: itemForm.item_value,
        sort_order: itemForm.sort_order
      });
      ElMessage.success('更新成功');
    } else {
      await request.post('/dict/item', {
        dict_id: selectedDict.value.id,
        item_label: itemForm.item_label,
        item_value: itemForm.item_value,
        sort_order: itemForm.sort_order
      });
      ElMessage.success('添加成功');
    }
    itemDialogVisible.value = false;
    await loadDictItems(selectedDict.value.id);
  } catch (e) {
    console.error('操作失败', e);
  } finally {
    itemSubmitLoading.value = false;
  }
}

async function handleDeleteItem(row) {
  try {
    await ElMessageBox.confirm(`确定要删除字典项「${row.item_label}」吗？`, '提示', { type: 'warning' });
    await request.delete(`/dict/item/${row.id}`);
    ElMessage.success('删除成功');
    await loadDictItems(selectedDict.value.id);
  } catch (e) {
    if (e !== 'cancel') console.error('删除失败', e);
  }
}
</script>

<style lang="scss" scoped>
.dict-page {
  .card-header {
    font-weight: bold;
    font-size: 16px;
  }

  .dict-layout {
    display: flex;
    gap: 20px;
    min-height: 500px;
  }

  .left-panel {
    width: 45%;
    flex-shrink: 0;
  }

  .right-panel {
    flex: 1;
    min-width: 0;
  }

  .section {
    margin-bottom: 20px;

    h4 {
      margin: 0 0 15px 0;
      font-size: 14px;
      color: #333;
    }
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 15px;

    h4 {
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .dict-info {
      color: #909399;
      font-size: 13px;
    }
  }

  .selected-row {
    background-color: #f0f9ff;
  }

  .empty-tip {
    padding: 40px 0;
    text-align: center;
  }
}

.el-divider {
  margin: 20px 0;
}
</style>
