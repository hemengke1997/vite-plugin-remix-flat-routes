import { getPackageInfoSync } from 'local-pkg'
import semver from 'semver'

export function detectLegacyMode() {
  const pkg = getPackageInfoSync('react-router-dom')
  if (pkg?.version) {
    if (semver.lt(pkg.version, '6.0.0')) {
      throw new Error('react-router-dom version at least 6.0.0 is required')
    }
    return semver.lte(pkg.version, '6.3.0')
  }
  return false
}

export function detectReactRefresh() {
  const react = getPackageInfoSync('@vitejs/plugin-react')

  if (react?.version && semver.gte(react.version, '4.3.2')) {
    return true
  }

  const reactSWC = getPackageInfoSync('@vitejs/plugin-react-swc')

  if (reactSWC?.version && semver.gte(reactSWC.version, '3.6.0')) {
    return true
  }

  return false
}
