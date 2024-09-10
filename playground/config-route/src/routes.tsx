import { type Route } from 'vite-plugin-remix-flat-routes/client'

export const routes: Route<{
  data: string
}>[] = [
  {
    path: '/',
    lazyComponent: () => import('./pages/home'),
    meta: {
      data: 'this is home',
    },
  },
  {
    path: '/page-a',
    lazyComponent: () => import('./pages/page-a'),
    meta: {
      data: 'this is page a',
    },
  },
  {
    path: '/page-c',
    redirect: '/page-b',
  },
  {
    path: '/page-b',
    lazyComponent: () => import('./pages/page-b'),
    meta: {
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
