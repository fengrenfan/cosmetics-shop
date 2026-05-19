/**
 * 邀请人 ID：扫码 scene 或 query 写入本地，注册/登录时带给后端
 */

export function parseInviterFromLaunch(options) {
  if (!options) return;

  let inviterId = null;

  const query = options.query || {};
  if (query.inviter_id) {
    inviterId = query.inviter_id;
  }

  if (query.scene) {
    try {
      const scene = decodeURIComponent(String(query.scene));
      const match = scene.match(/i=(\d+)/);
      if (match) inviterId = match[1];
    } catch (e) {
      // ignore
    }
  }

  if (inviterId) {
    const id = parseInt(String(inviterId), 10);
    if (id > 0) {
      uni.setStorageSync('inviter_id', id);
    }
  }
}

export function getInviterId() {
  const id = uni.getStorageSync('inviter_id');
  if (!id) return undefined;
  const n = parseInt(String(id), 10);
  return n > 0 ? n : undefined;
}

export function clearInviterId() {
  uni.removeStorageSync('inviter_id');
}
