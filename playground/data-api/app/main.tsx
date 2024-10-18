import { matchRoutes, type RouteObject } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { routes } from 'virtual:remix-flat-routes'
import App from './app'
import './css/index.css'

console.log(matchRoutes(routes as RouteObject[], window.location.pathname), 'matchRoutes')
createRoot(document.querySelector('#root')!).render(<App />)
