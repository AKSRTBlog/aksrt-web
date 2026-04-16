const mediaUsageOptions = [
  { value: "", label: "\u5168\u90E8\u7528\u9014" },
  { value: "article_cover", label: "\u6587\u7AE0\u5C01\u9762" },
  { value: "article_content", label: "\u6B63\u6587\u56FE\u7247" },
  { value: "banner", label: "Banner" },
  { value: "site_asset", label: "\u7AD9\u70B9\u7D20\u6750" },
  { value: "misc", label: "\u5176\u4ED6" }
];
const mediaSortOptions = [
  { value: "createdAt", label: "\u6309\u4E0A\u4F20\u65F6\u95F4" },
  { value: "filename", label: "\u6309\u6587\u4EF6\u540D" },
  { value: "size", label: "\u6309\u6587\u4EF6\u5927\u5C0F" }
];
function getMediaUsageLabel(usage) {
  var _a, _b;
  return (_b = (_a = mediaUsageOptions.find((item) => item.value === usage)) == null ? void 0 : _a.label) != null ? _b : usage;
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
    return "SVG \u56FE\u50CF";
  }
  if (asset.mimeType.startsWith("image/")) {
    return "\u56FE\u7247";
  }
  return "\u6587\u4EF6";
}
function getMediaExtension(asset) {
  var _a;
  const source = asset.originalFilename || asset.filename;
  const extension = (_a = source.split(".").pop()) == null ? void 0 : _a.trim().toLowerCase();
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

export { getMediaUsageLabel as a, getMediaKindLabel as b, formatMediaSize as c, formatMediaDate as f, getMediaExtension as g, mediaSortOptions as m, readImageDimensions as r, uploadAdminMediaFile as u };
//# sourceMappingURL=admin-media-DKXf4jjq.mjs.map
