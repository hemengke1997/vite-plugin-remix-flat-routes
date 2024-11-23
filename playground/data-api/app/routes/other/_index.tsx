import { useEffect } from 'react'

export default function Component() {
  useEffect(() => {
    console.log('other')
  }, [])
  return <div>Other</div>
}

export const handle = {
  other: 'other handle',
}
