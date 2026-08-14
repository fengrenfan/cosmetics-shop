const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const Docker = require('dockerode');
const { exec } = require('child_process');
exec("git config --global --add safe.directory /host/app");
const path = require('path');
const fs = require('fs');

const app = express();
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const JWT_SECRET = process.env.JWT_SECRET || 'CosmeticsShop2024Secret';
const PROJECT_DIR = process.env.PROJECT_DIR || '/host/app';
const PORT = 9090;
const DEVOPS_USERNAME = process.env.DEVOPS_USERNAME || 'admin';
const DEVOPS_PASSWORD = process.env.DEVOPS_PASSWORD || 'admin123';

app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : false,
  credentials: true,
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// JWT 验证中间件
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ code: 401, message: '未登录' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, message: 'Token过期' });
  }
}

// 执行命令
function execCommand(cmd, cwd = PROJECT_DIR) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd, timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stderr });
      } else {
        resolve(stdout);
      }
    });
  });
}

// 登录
app.post('/api/auth/admin-login', async (req, res) => {
  const { username, password } = req.body;
  if (username === DEVOPS_USERNAME && password === DEVOPS_PASSWORD) {
    const token = jwt.sign({ id: 1, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ code: 0, data: { token, user: { nickname: '管理员' } } });
  } else {
    res.status(401).json({ code: 401, message: '用户名或密码错误' });
  }
});

// 获取所有容器状态
app.get('/api/docker/containers', authMiddleware, async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    const result = containers
      .filter(c => c.Names.some(n => n.includes('cosmetics')))
      .map(c => ({
        id: c.Id,
        name: c.Names[0]?.replace('/', ''),
        state: c.State,
        status: c.Status,
        ports: c.Ports,
        image: c.Image,
        created: new Date(c.Created * 1000).toISOString()
      }));
    res.json({ code: 0, data: result });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// 启动容器
app.post('/api/docker/containers/:id/start', authMiddleware, async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.start();
    res.json({ code: 0, message: '启动成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// 停止容器
app.post('/api/docker/containers/:id/stop', authMiddleware, async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.stop();
    res.json({ code: 0, message: '停止成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// 重启容器
app.post('/api/docker/containers/:id/restart', authMiddleware, async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.restart();
    res.json({ code: 0, message: '重启成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// 获取容器日志
app.get('/api/docker/containers/:id/logs', authMiddleware, async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    const logs = await container.logs({
      stdout: true,
      stderr: true,
      tail: 100,
      timestamps: true
    });
    res.json({ code: 0, data: logs.toString() });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// 拉取最新代码
app.post('/api/docker/git/pull', authMiddleware, async (req, res) => {
  try {
    const result = await execCommand('git pull origin main');
    res.json({ code: 0, message: '拉取成功', data: result });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.stderr || err.message });
  }
});

// 获取Git状态
app.get('/api/docker/git/status', authMiddleware, async (req, res) => {
  try {
    const status = await execCommand('git status --short');
    const branch = await execCommand('git branch --show-current');
    const lastCommit = await execCommand('git log -1 --format="%h %s (%cr)"');
    res.json({
      code: 0,
      data: {
        branch: branch.trim(),
        lastCommit: lastCommit.trim(),
        changes: status.trim().split('\n').filter(Boolean)
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// 更新指定服务
app.post('/api/docker/update/:service', authMiddleware, async (req, res) => {
  const { service } = req.params;
  const validServices = ['server', 'admin', 'miniapp', 'mock-server'];
  
  if (!validServices.includes(service)) {
    return res.status(400).json({ code: 400, message: '无效的服务名称' });
  }

  try {
    // 构建镜像
    await execCommand(`docker compose build ${service}`);
    // 重启容器
    await execCommand(`docker compose up -d ${service}`);
    res.json({ code: 0, message: `${service} 更新成功` });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.stderr || err.message });
  }
});

// 更新所有服务
app.post('/api/docker/update/all', authMiddleware, async (req, res) => {
  try {
    await execCommand('docker compose build');
    await execCommand('docker compose up -d');
    res.json({ code: 0, message: '全部更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.stderr || err.message });
  }
});

// 获取系统信息
app.get('/api/docker/system/info', authMiddleware, async (req, res) => {
  try {
    const info = await docker.info();
    const df = await docker.df();
    res.json({
      code: 0,
      data: {
        containers: info.Containers,
        containersRunning: info.ContainersRunning,
        containersStopped: info.ContainersStopped,
        images: info.Images,
        os: info.OperatingSystem,
        kernel: info.kernelVersion,
        dockerVersion: info.ServerVersion
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// 生成H5预览二维码
app.get('/api/docker/miniapp/qrcode', authMiddleware, async (req, res) => {
  try {
    const QRCode = require('qrcode');
    const url = 'http://124.222.204.236:8081/miniapp/';
    const qr = await QRCode.toDataURL(url);
    res.json({ code: 0, data: { url, qrcode: qr } });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// SPA 回退
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 DevOps 管理服务运行在 http://localhost:${PORT}`);
});
