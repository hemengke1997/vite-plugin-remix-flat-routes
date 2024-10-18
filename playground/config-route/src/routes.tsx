import { type Route } from 'vite-plugin-remix-flat-routes/client'

const x = 1

export const routes: Route<{
  data: string
  fn?: () => void
}>[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    lazyComponent: () => import('./pages/home'),
    handle: {
      data: 'this is home',
    },
  },
  {
    path: '/page-a',
    lazyComponent: () => import('./pages/page-a'),
    handle: {
      data: 'this is page a',
      fn: () => {
        console.log(x, '执行fn')
      },
    },
  },
  {
    path: '/page-c',
    redirect: '/page-b',
  },
  {
    path: '/page-b',
    lazyComponent: () => import('./pages/page-b'),
    handle: {
      data: 'this is page b',
    },
  },
  {
    path: '/nest',
    children: [
      {
        path: 'a',
        lazyComponent: () => import('./pages/nest/a'),
      },
    ],
  },
  {
    path: '*',
    element: <div>404</div>,
  },
]
