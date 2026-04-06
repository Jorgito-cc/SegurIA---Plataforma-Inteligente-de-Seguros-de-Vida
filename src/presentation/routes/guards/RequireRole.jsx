import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';

export default function RequireRole({ allow = [], children }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to='/login' replace />;

  const role = (user?.rol || '').toLowerCase();
  const allowed = allow.map((x) => String(x).toLowerCase());

  if (!allowed.includes(role)) {
    return <Navigate to='/panel' replace />;
  }

  return children;
}