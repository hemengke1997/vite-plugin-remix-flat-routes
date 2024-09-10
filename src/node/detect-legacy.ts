import { getPackageInfoSync } from 'local-pkg'
import semver from 'semver'

export function resolveLegacyMode() {
  const pkg = getPackageInfoSync('react-router-dom')
  if (pkg?.version) {
    if (semver.lt(pkg.version, '6.0.0')) {
      throw new Error('react-router-dom version at least 6.0.0 is required')
    }
    return semver.lte(pkg.version, '6.3.0')
  }
  return false
}
