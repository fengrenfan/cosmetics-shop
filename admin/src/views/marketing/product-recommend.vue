<template>
  <div class="product-recommend-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品推荐管理</span>
          <el-button type="primary" @click="handleAdd">添加推荐商品</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" row-key="id">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="商品" min-width="300">
          <template #default="{ row }">
            <div class="product-cell" v-if="row.product">
              <el-image class="product-cover" :src="request.fixImageUrl(row.product.cover_image)" fit="cover" />
              <div class="product-info">
                <div class="product-title">{{ row.product.title }}</div>
                <div class="product-price">¥{{ row.product.price }}</div>
              </div>
            </div>
            <span v-else>商品ID: {{ row.product_id }} (已删除)</span>
          </template>
        </el-table-column>
        <el-table-column prop="recommend_type" label="推荐位置" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ getTypeText(row.recommend_type) }}</el-tag>
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
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加推荐弹窗 -->
    <el-dialog v-model="dialogVisible" title="添加推荐商品" width="900px">
      <div class="add-dialog-content">
        <el-form :model="searchForm" inline class="search-form">
          <el-form-item label="商品搜索">
            <el-input v-model="searchForm.keyword" placeholder="商品名称" clearable @keyup.enter="loadProducts" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadProducts">搜索</el-button>
            <el-button @click="searchForm.keyword = ''; loadProducts()">重置</el-button>
          </el-form-item>
        </el-form>

        <el-table 
          ref="productTableRef"
          :data="productList" 
          v-loading="productLoading" 
          max-height="400"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="商品" min-width="350">
            <template #default="{ row }">
              <div class="product-cell">
                <el-image class="product-cover" :src="request.fixImageUrl(row.cover_image)" fit="cover" />
                <div class="product-info">
                  <div class="product-title">{{ row.title }}</div>
                  <div class="product-price">¥{{ row.price }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="100" />
        </el-table>

        <div class="pagination-wrap">
          <el-pagination
            v-model:current-page="searchForm.page"
            v-model:page-size="searchForm.pageSize"
            :total="productTotal"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            @size-change="loadProducts"
            @current-change="loadProducts"
          />
        </div>

        <div class="dialog-footer">
          <span class="selected-count">已选 {{ selectedProducts.length }} 个商品</span>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAdd" :loading="submitLoading">确定添加</el-button>
        </div>
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
const dialogVisible = ref(false);
const productLoading = ref(false);
const productList = ref([]);
const productTotal = ref(0);
const selectedProducts = ref([]);
const submitLoading = ref(false);
const productTableRef = ref(null);
const existingProductIds = ref(new Set());

const searchForm = reactive({
  keyword: '',
  recommend_type: 'home',
  sort_order: 0,
  page: 1,
  pageSize: 10
});

onMounted(() => {
  loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const data = await request.get('/product-recommend/admin');
    const list = data || [];
    
    // 记录已添加的商品ID
    existingProductIds.value = new Set(list.map(item => item.product_id));
    
    for (const item of list) {
      try {
        const product = await request.get(`/product/${item.product_id}`);
        item.product = product;
      } catch (e) {
        item.product = null;
      }
    }
    tableData.value = list;
  } catch (e) {
    console.error('加载数据失败', e);
    ElMessage.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

function getTypeText(type) {
  const map = {
    home: '首页推荐',
    hot: '热销推荐',
    new: '新品推荐'
  };
  return map[type] || type;
}

function handleAdd() {
  searchForm.keyword = '';
  searchForm.page = 1;
  selectedProducts.value = [];
  productList.value = [];
  dialogVisible.value = true;
  loadProducts();
}

async function loadProducts() {
  productLoading.value = true;
  try {
    const res = await request.get('/product/list', { 
      keyword: searchForm.keyword,
      page: searchForm.page,
      pageSize: searchForm.pageSize
    });
    const list = res?.list || [];
    productTotal.value = res?.pagination?.total || 0;
    
    // 过滤掉已添加的商品
    productList.value = list.filter(p => !existingProductIds.value.has(p.id));
  } catch (e) {
    console.error('加载商品失败', e);
    ElMessage.error('加载商品失败');
  } finally {
    productLoading.value = false;
  }
}

function handleSelectionChange(selection) {
  selectedProducts.value = selection;
}

async function confirmAdd() {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请选择要添加的商品');
    return;
  }
  
  submitLoading.value = true;
  try {
    for (const product of selectedProducts.value) {
      await request.post('/product-recommend', {
        product_id: product.id,
        recommend_type: 'home',
        sort_order: 0
      });
    }
    ElMessage.success(`成功添加 ${selectedProducts.value.length} 个商品`);
    dialogVisible.value = false;
    loadData();
  } catch (e) {
    console.error('添加失败', e);
    ElMessage.error('添加失败');
  } finally {
    submitLoading.value = false;
  }
}

async function handleStatusChange(row) {
  try {
    await request.put(`/product-recommend/${row.id}`, { status: row.status });
    ElMessage.success('状态更新成功');
  } catch (e) {
    row.status = row.status === 1 ? 0 : 1;
    console.error('更新状态失败', e);
  }
}

function handleDelete(row) {
  ElMessageBox.confirm('确定要删除该推荐吗？', '删除确认', {
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete(`/product-recommend/${row.id}`);
      ElMessage.success('删除成功');
      loadData();
    } catch (e) {
      console.error('删除失败', e);
    }
  }).catch(() => {});
}
</script>

<style lang="scss" scoped>
.product-recommend-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-cell .product-cover {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  flex-shrink: 0;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.product-info .product-title {
  font-size: 14px;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-info .product-price {
  font-size: 14px;
  color: #ff4a8d;
  font-weight: bold;
}

.add-dialog-content {
  .search-form {
    margin-bottom: 16px;
  }
  
  .pagination-wrap {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
  
  .dialog-footer {
    margin-top: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid #eee;
    
    .selected-count {
      color: #666;
      font-size: 14px;
    }
  }
}
</style>
