import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSharePointAuth } from '@/contexts/SharePointAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  module?: string;
  level?: string;
}

export function ProtectedRoute({ children, module, level }: ProtectedRouteProps) {
  const { user, isLoading, hasPermission } = useSharePointAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check module-specific permissions
  if (module && level && !hasPermission(module, level)) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Acceso Denegado</h2>
            <p className="text-gray-600">
              No tienes permisos para acceder a este módulo.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Módulo: <span className="font-medium">{module}</span><br />
              Nivel requerido: <span className="font-medium">{level}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;