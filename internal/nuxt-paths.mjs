import { joinRelativeURL } from 'ufo'

function getAppConfig() {
  return {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    buildAssetsDir: process.env.NUXT_APP_BUILD_ASSETS_DIR || '/_nuxt/',
    cdnURL: process.env.NUXT_APP_CDN_URL || '',
  }
}

export const baseURL = () => getAppConfig().baseURL

export const buildAssetsDir = () => getAppConfig().buildAssetsDir

export const publicAssetsURL = (...path) => {
  const appConfig = getAppConfig()
  const publicBase = appConfig.cdnURL || appConfig.baseURL
  return path.length ? joinRelativeURL(publicBase, ...path) : publicBase
}

export const buildAssetsURL = (...path) =>
  joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path)

