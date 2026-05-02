import { createBrowserRouter, Navigate } from 'react-router-dom'

import { PrivateRoute } from './PrivateRoute'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { HabitsPage } from '../pages/habits/HabitsPage'
import { AppLayout } from '../layouts/AppLayout'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/login" replace />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        element: <PrivateRoute />,
        children: [
          {
            path: '/habits',
            element: <HabitsPage />,
          },
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
        ],
      },
    ],
  },
])
