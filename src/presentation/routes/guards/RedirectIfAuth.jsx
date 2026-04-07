import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import { getDashboardRouteByRole } from '../roleUtils';

export default function RedirectIfAuth({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) return <Navigate to={getDashboardRouteByRole(user?.rol)} replace />;
  return children;
}