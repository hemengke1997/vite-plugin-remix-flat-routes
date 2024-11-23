import { type GetScrollRestorationKeyFunction, type UIMatch } from 'react-router-dom'

function resolveShouldKeepAlive(matches: UIMatch<unknown, unknown>[]) {
  let shouldKeepAlive = false
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    const handle = match.handle
    if (!handle) continue

    if (handle?.['keepAlive']) {
      shouldKeepAlive = true
      break
    }
  }

  return shouldKeepAlive
}

export const getScrollRestoration: GetScrollRestorationKeyFunction = (location, matches) => {
  const shouldKeepAlive = resolveShouldKeepAlive(matches)
  return shouldKeepAlive ? location.pathname : null
}
