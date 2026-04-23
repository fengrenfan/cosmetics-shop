<script>
export default {
  onLaunch() {
    console.log('App Launch');
  },
  onShow() {
    console.log('App Show');
  },
  onHide() {
    console.log('App Hide');
  }
};
</script>

<style>
/* 引入 Font Awesome 字体 */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

/* 全局样式 + 图标系统 */
page {
  background-color: #f5f5f5;
}

.container {
  padding: 20rpx;
}

.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

/* Font Awesome 图标全局样式 */
.iconfont {
  font-family: 'Font Awesome 6 Free' !important;
  font-weight: 900;
  display: inline-block;
  vertical-align: middle;
  line-height: 1;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 填充类图标 */
.iconfont-filled,
.iconfont.filled {
  font-weight: 400;
}
</style>
