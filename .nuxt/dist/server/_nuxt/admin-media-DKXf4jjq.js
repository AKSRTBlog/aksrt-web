const mediaUsageOptions = [
  { value: "", label: "全部用途" },
  { value: "article_cover", label: "文章封面" },
  { value: "article_content", label: "正文图片" },
  { value: "banner", label: "Banner" },
  { value: "site_asset", label: "站点素材" },
  { value: "misc", label: "其他" }
];
const mediaSortOptions = [
  { value: "createdAt", label: "按上传时间" },
  { value: "filename", label: "按文件名" },
  { value: "size", label: "按文件大小" }
];
function getMediaUsageLabel(usage) {
  return mediaUsageOptions.find((item) => item.value === usage)?.label ?? usage;
}
function formatMediaSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function formatMediaDate(value) {
  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function getMediaKindLabel(asset) {
  if (asset.mimeType === "image/svg+xml") {
    return "SVG 图像";
  }
  if (asset.mimeType.startsWith("image/")) {
    return "图片";
  }
  return "文件";
}
function getMediaExtension(asset) {
  const source = asset.originalFilename || asset.filename;
  const extension = source.split(".").pop()?.trim().toLowerCase();
  return extension ? extension.toUpperCase() : "FILE";
}
async function uploadAdminMediaFile(adminApiFetch, file, usage) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("usage", usage);
  return adminApiFetch("/api/v1/admin/media/upload", {
    method: "POST",
    body: formData
  });
}
function readImageDimensions(url) {
  {
    return Promise.resolve(null);
  }
}
export {
  getMediaUsageLabel as a,
  formatMediaDate as b,
  getMediaKindLabel as c,
  formatMediaSize as f,
  getMediaExtension as g,
  mediaSortOptions as m,
  readImageDimensions as r,
  uploadAdminMediaFile as u
};
//# sourceMappingURL=admin-media-DKXf4jjq.js.map
