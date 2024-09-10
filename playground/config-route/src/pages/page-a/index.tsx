import { useMetas } from 'vite-plugin-remix-flat-routes/client'

export default function () {
  const { metas } = useMetas()
  console.log(metas, 'metas')
  return <div>page a</div>
}
