import { lazy } from 'react'
import Root from '@/components/root'
import { createHashRouter } from 'react-router'

const router = createHashRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: lazy(() => import('@/pages/home')) },
      { path: '/sync-report', Component: lazy(() => import('@/pages/sync-report')) }
    ]
  }
])

export default router
