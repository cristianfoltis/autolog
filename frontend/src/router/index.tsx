import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { VehiclesPage } from '../pages/VehiclesPage';
import { AuthCallbackPage } from '../pages/AuthCallbackPage';
import { ProtectedRoute } from '../components/ProtectedRoute';

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <VehiclesPage />
      </ProtectedRoute>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
