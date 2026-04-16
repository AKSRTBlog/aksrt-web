import type { MediaAssetItem, MediaUsage } from '~/types/admin';

export type MediaSortField = 'createdAt' | 'filename' | 'size';
export type MediaSortOrder = 'asc' | 'desc';
export type MediaStatusFilter = 'active' | 'deleted' | '';

type AdminMediaFetch = <T>(path: string, init?: RequestInit) => Promise<T>;

export const mediaUsageOptions: Array<{ value: MediaUsage | ''; label: string }> = [
  { value: '', label: '全部用途' },
  { value: 'article_cover', label: '文章封面' },
  { value: 'article_content', label: '正文图片' },
  { value: 'banner', label: 'Banner' },
  { value: 'site_asset', label: '站点素材' },
  { value: 'misc', label: '其他' },
];

export const mediaStatusOptions: Array<{ value: MediaStatusFilter; label: string }> = [
  { value: '', label: '全部状态' },
  { value: 'active', label: '正常' },
  { value: 'deleted', label: '已删除' },
];

export const mediaSortOptions: Array<{ value: MediaSortField; label: string }> = [
  { value: 'createdAt', label: '按上传时间' },
  { value: 'filename', label: '按文件名' },
  { value: 'size', label: '按文件大小' },
];

export function getMediaUsageLabel(usage: MediaUsage | string) {
  return mediaUsageOptions.find((item) => item.value === usage)?.label ?? usage;
}

export function formatMediaSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatMediaDate(value: string) {
  return new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isImageAsset(asset: Pick<MediaAssetItem, 'mimeType'>) {
  return asset.mimeType.startsWith('image/');
}

export function getMediaKindLabel(asset: Pick<MediaAssetItem, 'mimeType'>) {
  if (asset.mimeType === 'image/svg+xml') {
    return 'SVG 图像';
  }

  if (asset.mimeType.startsWith('image/')) {
    return '图片';
  }

  return '文件';
}

export function getMediaExtension(asset: Pick<MediaAssetItem, 'filename' | 'originalFilename'>) {
  const source = asset.originalFilename || asset.filename;
  const extension = source.split('.').pop()?.trim().toLowerCase();
  return extension ? extension.toUpperCase() : 'FILE';
}

export async function uploadAdminMediaFile(
  adminApiFetch: AdminMediaFetch,
  file: File,
  usage: MediaUsage,
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('usage', usage);

  return adminApiFetch<MediaAssetItem>('/api/v1/admin/media/upload', {
    method: 'POST',
    body: formData,
  });
}

export function readImageDimensions(url: string) {
  if (import.meta.server) {
    return Promise.resolve<string | null>(null);
  }

  return new Promise<string | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(`${image.naturalWidth} × ${image.naturalHeight}`);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}
