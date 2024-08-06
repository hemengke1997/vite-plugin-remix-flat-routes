import { getPackageInfoSync } from 'local-pkg'
import semver from 'semver'

export function resolveLegacyMode() {
  const pkg = getPackageInfoSync('react-router-dom')
  if (pkg?.version) {
    return semver.lt(pkg.version, '6.4.0')
  }
  return false
}
