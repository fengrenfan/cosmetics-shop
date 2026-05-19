<script>
import { parseInviterFromLaunch } from '@/utils/inviter.js';

export default {
  onLaunch(options) {
    parseInviterFromLaunch(options);
  },
  onShow(options) {
    parseInviterFromLaunch(options);
  },
};
</script>

<style>
/* 全局样式 */
</style>
