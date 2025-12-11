import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSharePointAuth } from '@/contexts/SharePointAuthContext';
import { Building2, Shield, Users } from 'lucide-react';

export function LoginPage() {
  const { user, login, isLoading } = useSharePointAuth();

  useEffect(() => {
    // Auto-redirect if already logged in
    if (user) {
      return;
    }
  }, [user]);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async () => {
    await login();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              SAM ERP
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Sistema de Administración y Monitoreo
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>Autenticación segura con Azure AD</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Users className="h-4 w-4 text-blue-600" />
                <span>Gestión de permisos por módulos</span>
              </div>
            </div>

            <Button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión con Microsoft'
              )}
            </Button>

            <div className="text-center">
              <Button 
                variant="link" 
                className="text-sm text-gray-500"
                onClick={() => window.location.href = '/test-sharepoint'}
              >
                Probar Conexión SharePoint
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}