import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMetas } from 'vite-plugin-remix-flat-routes/client'
import { GlobalContext } from '../../contexts/global-context'

export default function () {
  const { value } = GlobalContext.usePicker(['value'])
  const { metas } = useMetas()
  useEffect(() => {
    console.log(metas, 'metas')
  }, [metas])
  return (
    <div>
      /index/index.jsx {value}
      <Link to='/signin'>跳转signin</Link>
    </div>
  )
}
