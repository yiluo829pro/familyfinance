import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { FinancialProvider } from '@/context/FinancialContext'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { BalanceSheet } from '@/pages/BalanceSheet'
import { Portfolio } from '@/pages/Portfolio'
import { Fire } from '@/pages/Fire'

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { index: true, element: <Dashboard />, handle: { title: 'Dashboard' } },
        { path: '/balance-sheet', element: <BalanceSheet />, handle: { title: 'Balance Sheet' } },
        { path: '/portfolio', element: <Portfolio />, handle: { title: 'Portfolio' } },
        { path: '/fire', element: <Fire />, handle: { title: 'FIRE Calculator' } },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)

export function App() {
  return (
    <FinancialProvider>
      <RouterProvider router={router} />
    </FinancialProvider>
  )
}
