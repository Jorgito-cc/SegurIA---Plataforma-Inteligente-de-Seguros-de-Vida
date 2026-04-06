import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';

export default function RedirectIfAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to='/panel' replace />;
  return children;
}