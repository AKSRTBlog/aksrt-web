function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}
function resolveApiBase(configuredApiBase) {
  if (!configuredApiBase) {
    return "";
  }
  const fallback = trimTrailingSlash(configuredApiBase);
  {
    return fallback;
  }
}
function resolveRuntimeApiBase(config) {
  const serverApiBase = String(config.apiBaseInternal || "");
  return resolveApiBase(serverApiBase);
}
export {
  resolveRuntimeApiBase as r
};
//# sourceMappingURL=api-base-COxdl8qP.js.map
