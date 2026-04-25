<!--
 * @Author: 冯仁凡 fengrf@thinkive.com
 * @Date: 2026-04-25 14:14:26
 * @LastEditors: 冯仁凡 fengrf@thinkive.com
 * @LastEditTime: 2026-04-25 14:33:14
 * @FilePath: /cosmetics-shop/admin/src/App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <router-view />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* el-select 宽度与 input 保持一致 - Element Plus 2.x */
.el-select {
  --el-select-input-size: 32px;
}

.el-select .el-select__wrapper {
  min-height: var(--el-input-height, 32px) !important;
  padding: 1px 11px !important;
  border-radius: var(--el-input-border-radius, var(--el-border-radius-base)) !important;
}

.el-input {
  width: 200px;
}

.el-form--inline .el-input,
.el-form--inline .el-select {
  width: 200px !important;
}

.el-form--inline .el-form-item__content {
  width: 200px !important;
  flex: none !important;
}

.el-form-item .el-input,
.el-form-item .el-select {
  width: 100%;
}

.el-date-editor.el-input {
  width: 200px !important;
}
</style>
