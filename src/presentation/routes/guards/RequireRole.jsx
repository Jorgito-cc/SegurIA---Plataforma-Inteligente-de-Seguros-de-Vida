import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import { getDashboardRouteByRole, normalizeRole } from '../roleUtils';

export default function RequireRole({ allow = [], children }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to='/login' replace />;

  const role = normalizeRole(user?.rol);
  const allowed = allow.map((x) => normalizeRole(x));

  if (!allowed.includes(role)) {
    return <Navigate to={getDashboardRouteByRole(user?.rol)} replace />;
  }

  return children;
}