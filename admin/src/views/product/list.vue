<template>
  <div class="product-list">
    <!-- 搜索筛选 -->
    <el-card class="filter-card">
      <el-form inline :model="queryForm">
        <el-form-item label="商品名称">
          <el-input v-model="queryForm.keyword" placeholder="请输入商品名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-cascader
            v-model="queryForm.category_id"
            :options="categoryTree"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="请选择分类"
            clearable
          />
        </el-form-item>
        <el-form-item label="商品状态">
          <el-select v-model="queryForm.status" placeholder="请选择状态" clearable>
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品标签">
          <el-select v-model="queryForm.tag" placeholder="请选择标签" clearable>
            <el-option label="推荐" value="is_recommend" />
            <el-option label="热卖" value="is_hot" />
            <el-option label="新品" value="is_new" />
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
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-checkbox v-model="selectAll" @change="handleSelectAll" :indeterminate="isIndeterminate">
              <span style="margin-left: 8px;">全选</span>
            </el-checkbox>
            <el-dropdown @command="handleBatchCommand" v-if="selectedRows.length > 0">
              <el-button type="primary" plain size="small" style="margin-left: 16px;">
                批量操作 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="enable">批量上架</el-dropdown-item>
                  <el-dropdown-item command="disable">批量下架</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>批量删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="header-right">
            <span class="selected-count" v-if="selectedRows.length > 0">
              已选择 {{ selectedRows.length }} 项
            </span>
            <el-button type="primary" @click="handleAdd">添加商品</el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="tableData"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        :row-key="getRowKey"
      >
        <el-table-column type="selection" width="50" :reserve-selection="true" />
        <el-table-column prop="id" label="ID" width="80" sortable />
        <el-table-column label="商品图片" width="100">
          <template #default="{ row }">
            <el-image
              :src="row.cover_image"
              fit="cover"
              style="width: 70px; height: 70px; border-radius: 4px; cursor: pointer;"
              :preview-src-list="[row.cover_image]"
              @click="showProductDetail(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="商品信息" min-width="220">
          <template #default="{ row }">
            <div class="product-info">
              <p class="product-title" @click="showProductDetail(row)">{{ row.title }}</p>
              <p class="product-subtitle">{{ row.subtitle || '暂无副标题' }}</p>
              <div class="product-tags">
                <el-tag v-if="row.is_recommend" type="danger" size="small" effect="plain">推荐</el-tag>
                <el-tag v-if="row.is_hot" type="warning" size="small" effect="plain">热卖</el-tag>
                <el-tag v-if="row.is_new" size="small" effect="plain">新品</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.category?.name || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="售价" width="100" sortable>
          <template #default="{ row }">
            <span class="price">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="original_price" label="原价" width="100">
          <template #default="{ row }">
            <span class="original-price" v-if="row.original_price">¥{{ row.original_price }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" sortable>
          <template #default="{ row }">
            <div class="stock-cell">
              <span :class="{ 'low-stock': row.stock < 10 }">{{ row.stock }}</span>
              <el-tooltip v-if="row.stock < 10" content="库存不足" placement="top">
                <el-icon class="warning-icon"><Warning /></el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="sales_count" label="销量" width="80" sortable />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
              <el-button type="success" link @click="handleCopy(row)">复制</el-button>
              <el-button
                :type="row.status === 1 ? 'warning' : 'success'"
                link
                @click="toggleStatus(row)"
              >
                {{ row.status === 1 ? '下架' : '上架' }}
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 商品详情抽屉 -->
    <el-drawer v-model="detailDrawer" title="商品详情" size="600px" direction="rtl">
      <div class="product-detail" v-if="currentProduct">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="商品名称">{{ currentProduct.title }}</el-descriptions-item>
          <el-descriptions-item label="商品分类">{{ currentProduct.category?.name }}</el-descriptions-item>
          <el-descriptions-item label="商品价格">¥{{ currentProduct.price }}</el-descriptions-item>
          <el-descriptions-item label="原价">¥{{ currentProduct.original_price || '-' }}</el-descriptions-item>
          <el-descriptions-item label="库存">{{ currentProduct.stock }}</el-descriptions-item>
          <el-descriptions-item label="销量">{{ currentProduct.sales_count }}</el-descriptions-item>
          <el-descriptions-item label="单位">{{ currentProduct.unit }}</el-descriptions-item>
          <el-descriptions-item label="商品标签">
            <el-tag v-if="currentProduct.is_recommend" type="danger" size="small" style="margin-right: 4px;">推荐</el-tag>
            <el-tag v-if="currentProduct.is_hot" type="warning" size="small" style="margin-right: 4px;">热卖</el-tag>
            <el-tag v-if="currentProduct.is_new" size="small" style="margin-right: 4px;">新品</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="商品状态">
            <el-tag :type="currentProduct.status === 1 ? 'success' : 'info'">
              {{ currentProduct.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(currentProduct.created_at) }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>商品图片</h4>
          <div class="image-list">
            <el-image
              v-for="(img, idx) in currentProduct.images"
              :key="idx"
              :src="img"
              fit="cover"
              style="width: 100px; height: 100px; margin-right: 10px; border-radius: 4px;"
              :preview-src-list="currentProduct.images"
            />
          </div>
        </div>

        <div class="detail-section" v-if="currentProduct.skus?.length > 0">
          <h4>SKU规格</h4>
          <el-table :data="currentProduct.skus" size="small" border>
            <el-table-column prop="sku_name" label="规格名称" />
            <el-table-column prop="price" label="价格">
              <template #default="{ row }">¥{{ row.price }}</template>
            </el-table-column>
            <el-table-column prop="stock" label="库存" />
          </el-table>
        </div>
      </div>
    </el-drawer>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '添加商品'"
      width="950px"
      :close-on-click-modal="false"
      :destroy-on-close="true"
    >
      <el-form ref="formRef" :model="productForm" :rules="formRules" label-width="100px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-row :gutter="20">
              <el-col :span="16">
                <el-form-item label="商品名称" prop="title">
                  <el-input v-model="productForm.title" placeholder="请输入商品名称" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="商品分类" prop="category_id">
                  <el-cascader
                    v-model="productForm.category_id"
                    :options="categoryTree"
                    :props="{ label: 'name', value: 'id', children: 'children', checkStrictly: true }"
                    placeholder="请选择分类"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="副标题">
              <el-input v-model="productForm.subtitle" placeholder="请输入商品副标题（选填）" />
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="售价" prop="price">
                  <el-input-number v-model="productForm.price" :min="0" :precision="2" :controls="false" style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="原价">
                  <el-input-number v-model="productForm.original_price" :min="0" :precision="2" :controls="false" style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="库存" prop="stock">
                  <el-input-number v-model="productForm.stock" :min="0" :controls="false" style="width: 100%;" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="单位">
                  <el-input v-model="productForm.unit" placeholder="如: 件、盒、套" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="商品标签">
                  <el-checkbox-group v-model="tagLabels">
                    <el-checkbox label="is_recommend">推荐</el-checkbox>
                    <el-checkbox label="is_hot">热卖</el-checkbox>
                    <el-checkbox label="is_new">新品</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="商品状态">
                  <el-switch v-model="productForm.status" :active-value="1" :inactive-value="0" />
                  <span style="margin-left: 10px; color: #999;">{{ productForm.status === 1 ? '上架' : '下架' }}</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="商品图片" name="images">
            <el-form-item label="商品图片">
              <div class="image-uploader">
                <div v-for="(img, index) in productForm.images" :key="index" class="uploaded-image">
                  <el-image :src="img" fit="cover" />
                  <div class="image-actions">
                    <span @click="setCover(index)" :class="{ active: productForm.cover_image === img }">封面</span>
                    <span @click="removeImage(index)">删除</span>
                  </div>
                </div>
                <el-upload
                  :show-file-list="false"
                  :http-request="uploadImage"
                  class="upload-btn"
                  v-if="productForm.images.length < 10"
                >
                  <el-icon><Plus /></el-icon>
                  <span>上传图片</span>
                </el-upload>
              </div>
              <div class="upload-tip">建议尺寸 750x750 或 1:1 比例，最多上传10张</div>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="SKU规格" name="sku">
            <el-form-item label="规格管理">
              <div class="sku-generator">
                <div class="spec-row">
                  <el-input v-model="newSpecName" placeholder="规格名称（如：颜色）" style="width: 150px;" />
                  <el-input v-model="newSpecValues" placeholder="规格值（如：红色,蓝色,绿色）" style="width: 300px;" />
                  <el-button type="primary" @click="addSpec">添加规格</el-button>
                </div>

                <div class="spec-list" v-if="specs.length > 0">
                  <div class="spec-item" v-for="(spec, idx) in specs" :key="idx">
                    <span class="spec-name">{{ spec.name }}：</span>
                    <el-tag
                      v-for="(val, vIdx) in spec.values"
                      :key="vIdx"
                      closable
                      @close="removeSpecValue(idx, vIdx)"
                      style="margin-right: 8px;"
                    >
                      {{ val }}
                    </el-tag>
                    <el-button type="danger" link size="small" @click="removeSpec(idx)">删除</el-button>
                  </div>
                </div>

                <el-button type="success" @click="generateSkus" v-if="specs.length > 0" style="margin-top: 15px;">
                  生成SKU组合
                </el-button>
              </div>
            </el-form-item>

            <el-form-item label="SKU列表" v-if="productForm.skus.length > 0">
              <div class="sku-table">
                <el-table :data="productForm.skus" border size="small">
                  <el-table-column label="规格组合" prop="sku_name" min-width="150" />
                  <el-table-column label="规格编码" prop="sku_code" width="120" />
                  <el-table-column label="价格" width="120">
                    <template #default="{ row }">
                      <el-input-number v-model="row.price" :min="0" :precision="2" :controls="false" size="small" style="width: 100px;" />
                    </template>
                  </el-table-column>
                  <el-table-column label="库存" width="120">
                    <template #default="{ row }">
                      <el-input-number v-model="row.stock" :min="0" :controls="false" size="small" style="width: 100px;" />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="80">
                    <template #default="{ $index }">
                      <el-button type="danger" size="small" @click="removeSku($index)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <div class="sku-tip">共 {{ productForm.skus.length }} 个SKU组合</div>
              </div>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品详情" name="detail">
            <el-form-item label="详情编辑">
              <el-radio-group v-model="detailEditor" style="margin-bottom: 15px;">
                <el-radio label="rich">富文本模式</el-radio>
                <el-radio label="simple">简洁模式</el-radio>
              </el-radio-group>
              <el-input
                v-model="productForm.detail_html"
                type="textarea"
                :rows="12"
                :placeholder="detailEditor === 'rich' ? '请输入商品详情（支持HTML）' : '请输入商品详情描述'"
              />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button @click="handleSaveDraft" :loading="submitLoading">保存草稿</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Warning, ArrowDown } from '@element-plus/icons-vue';
import request from '@/utils/request.js';

const loading = ref(false);
const tableData = ref([]);
const categoryTree = ref([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const detailDrawer = ref(false);
const currentProduct = ref(null);
const activeTab = ref('basic');
const detailEditor = ref('rich');
const tagLabels = ref([]);
const formRef = ref(null);

// 批量选择相关
const selectedRows = ref([]);
const selectAll = ref(false);
const isIndeterminate = ref(false);

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

// 查询表单
const queryForm = reactive({
  keyword: '',
  category_id: null,
  status: null,
  tag: ''
});

// 商品表单
const productForm = reactive({
  id: null,
  title: '',
  category_id: null,
  subtitle: '',
  price: 0,
  original_price: 0,
  stock: 0,
  unit: '件',
  cover_image: '',
  images: [],
  detail_html: '',
  is_recommend: 0,
  is_hot: 0,
  is_new: 0,
  status: 1,
  skus: []
});

// SKU规格生成
const specs = ref([]);
const newSpecName = ref('');
const newSpecValues = ref('');

const formRules = {
  title: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category_id: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入售价', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
};

const getRowKey = (row) => row.id;

onMounted(() => {
  loadCategory();
  loadData();
});

async function loadCategory() {
  try {
    const data = await request.get('/category/tree');
    // 过滤空 children
    function filterEmptyChildren(nodes) {
      return nodes.map(node => ({
        ...node,
        children: node.children && node.children.length > 0 
          ? filterEmptyChildren(node.children) 
          : undefined
      }));
    }
    categoryTree.value = filterEmptyChildren(data || []);
  } catch (e) {
    console.error('加载分类失败', e);
    // 使用模拟数据
    categoryTree.value = [
      { id: 1, name: '护肤', children: [
        { id: 7, name: '面膜' },
        { id: 8, name: '乳液' },
        { id: 9, name: '精华' }
      ]},
      { id: 2, name: '彩妆', children: [
        { id: 10, name: '口红' },
        { id: 11, name: '眼影' }
      ]},
      { id: 3, name: '香水' },
      { id: 4, name: '美发' },
      { id: 5, name: '美甲' },
      { id: 6, name: '工具' }
    ];
  }
}

async function loadData() {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...queryForm
    };
    // 清除空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null) delete params[key];
      // cascader 返回数组，取最后一个值
      if (key === 'category_id' && Array.isArray(params[key])) {
        params[key] = params[key][params[key].length - 1];
      }
    });

    // 使用真实API
    const res = await request.get('/product/list', { params });
    tableData.value = res.list || [];
    pagination.total = res.pagination?.total || 0;
  } catch (e) {
    console.error('加载数据失败', e);
  } finally {
    loading.value = false;
  }
}

function generateMockData() {
  const categories = ['护肤', '彩妆', '香水', '美发', '美甲', '工具'];
  const products = [];
  const titles = [
    '玻尿酸保湿面膜 5片装', '胶原蛋白精华液 30ml', '玫瑰保湿面霜 50g',
    '丝绒哑光口红 #正红色', '12色眼影盘 日常版', '便携式卷发棒',
    '氨基酸洁面乳 100ml', '补水喷雾 150ml', '防晒霜 SPF50+ 50ml',
    '睫毛膏 防水型', '眉笔 自动款', '卸妆水 500ml'
  ];

  for (let i = 1; i <= 20; i++) {
    const titleIdx = (i - 1) % titles.length;
    products.push({
      id: i,
      title: titles[titleIdx],
      subtitle: `【新品】美妆爆款 限时特惠`,
      category_id: (i % 6) + 1,
      category_name: categories[i % 6],
      price: Math.floor(Math.random() * 200) + 29,
      original_price: Math.floor(Math.random() * 300) + 99,
      stock: Math.floor(Math.random() * 500),
      sales_count: Math.floor(Math.random() * 1000),
      unit: '件',
      cover_image: `https://picsum.photos/400/400?random=${i}`,
      images: [
        `https://picsum.photos/400/400?random=${i}`,
        `https://picsum.photos/400/400?random=${i + 20}`,
        `https://picsum.photos/400/400?random=${i + 40}`
      ],
      is_recommend: i % 3 === 0 ? 1 : 0,
      is_hot: i % 4 === 0 ? 1 : 0,
      is_new: i % 5 === 0 ? 1 : 0,
      status: i % 7 === 0 ? 0 : 1,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      skus: i % 2 === 0 ? [
        { id: 1, sku_name: '红色', price: 99, stock: 100 },
        { id: 2, sku_name: '蓝色', price: 99, stock: 0 }
      ] : []
    });
  }
  return products;
}

function handleSearch() {
  pagination.page = 1;
  loadData();
}

function handleReset() {
  queryForm.keyword = '';
  queryForm.category_id = null;
  queryForm.status = null;
  queryForm.tag = '';
  pagination.page = 1;
  loadData();
}

function handleSizeChange(val) {
  pagination.pageSize = val;
  pagination.page = 1;
  loadData();
}

function handlePageChange(val) {
  pagination.page = val;
  loadData();
}

// 批量操作
function handleSelectionChange(selection) {
  selectedRows.value = selection;
  isIndeterminate.value = selection.length > 0 && selection.length < tableData.value.length;
  selectAll.value = selection.length === tableData.value.length;
}

function handleSelectAll(val) {
  if (val) {
    tableData.value.forEach(row => {
      // 全选逻辑
    });
  } else {
    selectedRows.value = [];
  }
}

async function handleBatchCommand(command) {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择商品');
    return;
  }

  if (command === 'delete') {
    ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个商品吗？`, '批量删除', {
      type: 'warning'
    }).then(async () => {
      // await request.post('/product/batch-delete', { ids: selectedRows.value.map(r => r.id) });
      ElMessage.success('批量删除成功');
      loadData();
    }).catch(() => {});
  } else if (command === 'enable' || command === 'disable') {
    const status = command === 'enable' ? 1 : 0;
    await request.put('/product/batch-status', { ids: selectedRows.value.map(r => r.id), status });
    ElMessage.success(`批量${status === 1 ? '上架' : '下架'}成功`);
    loadData();
  }
}

function showProductDetail(row) {
  currentProduct.value = row;
  detailDrawer.value = true;
}

function handleAdd() {
  isEdit.value = false;
  resetForm();
  activeTab.value = 'basic';
  dialogVisible.value = true;
}

function handleEdit(row) {
  isEdit.value = true;
  Object.assign(productForm, {
    id: row.id,
    title: row.title,
    category_id: row.category_id,
    subtitle: row.subtitle || '',
    price: row.price,
    original_price: row.original_price || 0,
    stock: row.stock,
    unit: row.unit || '件',
    cover_image: row.cover_image,
    images: row.images || [],
    detail_html: row.detail_html || '',
    is_recommend: row.is_recommend,
    is_hot: row.is_hot,
    is_new: row.is_new,
    status: row.status,
    skus: row.skus?.map(s => ({
      id: s.id,
      sku_name: s.sku_name,
      sku_code: `SKU${s.id}`,
      price: s.price,
      stock: s.stock
    })) || []
  });

  tagLabels.value = [];
  if (row.is_recommend) tagLabels.value.push('is_recommend');
  if (row.is_hot) tagLabels.value.push('is_hot');
  if (row.is_new) tagLabels.value.push('is_new');

  activeTab.value = 'basic';
  dialogVisible.value = true;
}

function handleCopy(row) {
  ElMessageBox.confirm('确定要复制该商品吗？', '复制商品', {
    type: 'info'
  }).then(() => {
    isEdit.value = false;
    Object.assign(productForm, {
      id: null,
      title: row.title + ' (副本)',
      category_id: row.category_id,
      subtitle: row.subtitle || '',
      price: row.price,
      original_price: row.original_price || 0,
      stock: row.stock,
      unit: row.unit || '件',
      cover_image: row.cover_image,
      images: [...row.images] || [],
      detail_html: row.detail_html || '',
      is_recommend: row.is_recommend,
      is_hot: row.is_hot,
      is_new: row.is_new,
      status: 0, // 复制默认下架
      skus: row.skus?.map(s => ({
        sku_name: s.sku_name,
        sku_code: '',
        price: s.price,
        stock: s.stock
      })) || []
    });

    tagLabels.value = [];
    if (row.is_recommend) tagLabels.value.push('is_recommend');
    if (row.is_hot) tagLabels.value.push('is_hot');
    if (row.is_new) tagLabels.value.push('is_new');

    activeTab.value = 'basic';
    dialogVisible.value = true;
    ElMessage.success('已复制商品信息，请修改后保存');
  }).catch(() => {});
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定要删除商品「${row.title}」吗？删除后不可恢复！`, '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await request.delete(`/product/${row.id}`);
      ElMessage.success('删除成功');
      loadData();
    } catch (e) {
      console.error('删除失败', e);
    }
  }).catch(() => {});
}

async function toggleStatus(row) {
  const newStatus = row.status === 1 ? 0 : 1;
  const action = newStatus === 1 ? '上架' : '下架';
  try {
    await ElMessageBox.confirm(`确定要${action}商品「${row.title}」吗？`, `${action}确认`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await request.put(`/product/${row.id}/status`, { status: newStatus });
    row.status = newStatus;
    ElMessage.success(newStatus === 1 ? '上架成功' : '下架成功');
  } catch (e) {
    if (e !== 'cancel') {
      console.error('更新状态失败', e);
    }
  }
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;

  try {
    processFormData();
    // 清理数据，移除后端不需要的字段
    const { unit, ...cleanData } = productForm;
    // 确保 category_id 是数字（cascader 可能返回数组，取最后一个值）
    const catId = Array.isArray(cleanData.category_id) 
      ? cleanData.category_id[cleanData.category_id.length - 1] 
      : cleanData.category_id;
    cleanData.category_id = Number(catId);
    cleanData.price = Number(cleanData.price);
    cleanData.original_price = Number(cleanData.original_price) || 0;
    cleanData.stock = Number(cleanData.stock);

    if (isEdit.value) {
      const productId = cleanData.id;
      delete cleanData.id;
      await request.put(`/product/${productId}`, cleanData);
      ElMessage.success('更新成功');
    } else {
      // 创建时移除 id
      delete cleanData.id;
      await request.post('/product', cleanData);
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

async function handleSaveDraft() {
  submitLoading.value = true;
  try {
    processFormData();
    const { unit, ...cleanData } = productForm;
    const catId = Array.isArray(cleanData.category_id) 
      ? cleanData.category_id[cleanData.category_id.length - 1] 
      : cleanData.category_id;
    cleanData.category_id = Number(catId);
    cleanData.price = Number(cleanData.price) || 0;
    cleanData.original_price = Number(cleanData.original_price) || 0;
    cleanData.stock = Number(cleanData.stock) || 0;
    cleanData.status = 0; // 草稿默认下架
    await request.post('/product', cleanData);
    ElMessage.success('草稿保存成功');
    dialogVisible.value = false;
    loadData();
  } catch (e) {
    console.error('保存失败', e);
  } finally {
    submitLoading.value = false;
  }
}

function processFormData() {
  // 处理标签
  productForm.is_recommend = tagLabels.value.includes('is_recommend') ? 1 : 0;
  productForm.is_hot = tagLabels.value.includes('is_hot') ? 1 : 0;
  productForm.is_new = tagLabels.value.includes('is_new') ? 1 : 0;

  // 设置封面图
  if (productForm.images.length > 0 && !productForm.cover_image) {
    productForm.cover_image = productForm.images[0];
  }

  // 处理SKU编码
  productForm.skus.forEach((sku, idx) => {
    if (!sku.sku_code) {
      sku.sku_code = `SKU${Date.now()}${idx}`;
    }
  });
}

function resetForm() {
  Object.assign(productForm, {
    id: null,
    title: '',
    category_id: null,
    subtitle: '',
    price: 0,
    original_price: 0,
    stock: 0,
    unit: '件',
    cover_image: '',
    images: [],
    detail_html: '',
    is_recommend: 0,
    is_hot: 0,
    is_new: 0,
    status: 1,
    skus: []
  });
  tagLabels.value = [];
  specs.value = [];
  newSpecName.value = '';
  newSpecValues.value = '';
}

// SKU规格生成
function addSpec() {
  if (!newSpecName.value || !newSpecValues.value) {
    ElMessage.warning('请输入规格名称和规格值');
    return;
  }
  const values = newSpecValues.value.split(',').map(v => v.trim()).filter(Boolean);
  if (values.length === 0) {
    ElMessage.warning('请输入有效的规格值');
    return;
  }
  specs.value.push({
    name: newSpecName.value.trim(),
    values
  });
  newSpecName.value = '';
  newSpecValues.value = '';
}

function removeSpec(idx) {
  specs.value.splice(idx, 1);
}

function removeSpecValue(specIdx, valueIdx) {
  specs.value[specIdx].values.splice(valueIdx, 1);
  if (specs.value[specIdx].values.length === 0) {
    specs.value.splice(specIdx, 1);
  }
}

function generateSkus() {
  if (specs.value.length === 0) {
    ElMessage.warning('请先添加规格');
    return;
  }

  // 生成笛卡尔积
  const combinations = cartesianProduct(specs.value.map(s => s.values));

  productForm.skus = combinations.map(combo => {
    const skuName = combo.join(',');
    return {
      sku_name: skuName,
      sku_code: '',
      price: productForm.price,
      stock: productForm.stock
    };
  });

  ElMessage.success(`成功生成 ${productForm.skus.length} 个SKU组合`);
}

function cartesianProduct(arrays) {
  return arrays.reduce((acc, curr) => {
    return acc.flatMap(x => curr.map(y => [...x, y]));
  }, [[]]);
}

function removeSku(index) {
  productForm.skus.splice(index, 1);
}

async function uploadImage(options) {
  const formData = new FormData();
  formData.append('file', options.file);

  try {
    const res = await request.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    productForm.images.push('http://118.25.192.73' + res.url);
    if (!productForm.cover_image) {
      productForm.cover_image = productForm.images[0];
    }
    ElMessage.success('上传成功');
  } catch (e) {
    // 上传失败时使用占位图
    productForm.images.push(`https://picsum.photos/400/400?random=${Date.now()}`);
    if (!productForm.cover_image) {
      productForm.cover_image = productForm.images[0];
    }
    ElMessage.warning('上传失败，已使用占位图');
  }
}

function setCover(index) {
  productForm.cover_image = productForm.images[index];
}

function removeImage(index) {
  productForm.images.splice(index, 1);
  if (productForm.cover_image === productForm.images[index]) {
    productForm.cover_image = productForm.images[0] || '';
  }
}

function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
</script>

<style lang="scss" scoped>
.product-list {
  .filter-card {
    margin-bottom: 20px;
  }

  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-left {
        display: flex;
        align-items: center;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .selected-count {
        font-size: 14px;
        color: #999;
      }
    }
  }

  .product-info {
    .product-title {
      font-weight: bold;
      cursor: pointer;
      &:hover {
        color: #ff4a8d;
      }
    }

    .product-subtitle {
      color: #999;
      font-size: 12px;
      margin: 4px 0;
    }

    .product-tags {
      display: flex;
      gap: 4px;
    }
  }

  .price {
    color: #ff4a8d;
    font-weight: bold;
  }

  .original-price {
    color: #999;
    text-decoration: line-through;
  }

  .stock-cell {
    display: flex;
    align-items: center;
    gap: 4px;

    .low-stock {
      color: #f56c6c;
      font-weight: bold;
    }

    .warning-icon {
      color: #f56c6c;
    }
  }

  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
}

.product-detail {
  .detail-section {
    margin-top: 20px;

    h4 {
      margin-bottom: 10px;
      font-size: 14px;
      color: #333;
    }

    .image-list {
      display: flex;
      flex-wrap: wrap;
    }
  }
}

.image-uploader {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  .uploaded-image {
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 4px;
    overflow: hidden;

    .el-image {
      width: 100%;
      height: 100%;
    }

    .image-actions {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-around;
      padding: 4px;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      font-size: 12px;
      cursor: pointer;

      span {
        &.active {
          color: #ff4a8d;
        }

        &:hover {
          color: #ff4a8d;
        }
      }
    }
  }

  .upload-btn {
    width: 100px;
    height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    cursor: pointer;
    color: #999;

    .el-icon {
      font-size: 24px;
      margin-bottom: 4px;
    }

    span {
      font-size: 12px;
    }

    &:hover {
      border-color: #ff4a8d;
      color: #ff4a8d;
    }
  }

  .upload-tip {
    margin-top: 10px;
    font-size: 12px;
    color: #999;
  }
}

.sku-generator {
  .spec-row {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
  }

  .spec-list {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .spec-item {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 4px;

      .spec-name {
        font-weight: bold;
        margin-right: 10px;
      }
    }
  }

  .sku-table {
    .sku-tip {
      margin-top: 10px;
      font-size: 12px;
      color: #999;
    }
  }
}
</style>
