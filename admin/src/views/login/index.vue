<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-header">
        <h2>唯伊美妆</h2>
        <p>管理后台登录</p>
      </div>

      <el-form ref="formRef" :model="formData" :rules="formRules" class="login-form">
        <el-form-item prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入管理员账号"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width: 100%;" :loading="loading" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p>默认账号：admin / admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import request from '@/utils/request.js';

const router = useRouter();
const formRef = ref(null);
const loading = ref(false);

const formData = reactive({
  username: '',
  password: ''
});

const formRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    const res = await request.post('/auth/admin-login', {
      username: formData.username,
      password: formData.password
    });

    // 保存 Token 和用户信息
    request.setToken(res.token);
    localStorage.setItem('adminUser', JSON.stringify(res.user));

    ElMessage.success('登录成功');

    // 使用 Vue Router 跳转到首页
    router.push('/');
  } catch (e) {
    console.error('登录失败', e);
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff4a8d 0%, #ff6b9d 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;

  h2 {
    font-size: 28px;
    color: #333;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: #999;
  }
}

.login-footer {
  text-align: center;
  margin-top: 20px;

  p {
    font-size: 12px;
    color: #999;
  }
}
</style>
