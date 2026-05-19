/** 历史上错误写入、服务器上并不存在的占位图路径 */
const INVALID_IMAGE_MARKERS = ['/static/uploads/placeholder', 'placeholder.jpg'];

export function isInvalidImageUrl(url?: string | null): boolean {
  if (!url || !String(url).trim()) return true;
  const u = String(url).trim();
  return INVALID_IMAGE_MARKERS.some((m) => u.includes(m));
}

/** 将无效图片替换为可访问的占位图（按商品 id 稳定） */
export function resolveProductImageUrl(url?: string | null, seed?: number): string {
  if (!isInvalidImageUrl(url)) return String(url).trim();
  return seed != null
    ? `https://picsum.photos/seed/product${seed}/400/400`
    : 'https://picsum.photos/400/400';
}

export function sanitizeProductImages<T extends { id?: number; cover_image?: string; images?: any }>(
  product: T,
): T {
  if (!product) return product;
  product.cover_image = resolveProductImageUrl(product.cover_image, product.id);
  if (Array.isArray(product.images)) {
    product.images = product.images.map((img: string, i: number) =>
      resolveProductImageUrl(img, product.id != null ? product.id * 10 + i : undefined),
    );
  } else if (typeof product.images === 'string') {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed)) {
        product.images = parsed.map((img: string, i: number) =>
          resolveProductImageUrl(img, product.id != null ? product.id * 10 + i : undefined),
        ) as any;
      }
    } catch {
      /* ignore */
    }
  }
  return product;
}
