import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSharePointAuth } from '@/contexts/SharePointAuthContext';
import { checkSharePointConnection } from '@/lib/sharepoint';
import { trabajadoresService, mandantesService, serviciosService } from '@/lib/sharepoint-services';
import { MODULES } from '@/lib/sharepoint-mappings';

interface TestData {
  [key: string]: {
    count?: number;
    data?: Record<string, unknown>[];
    error?: string;
  };
}

export function SharePointTest() {
  const { user, login, logout, isLoading, canRead, canCollaborate, canAdministrate } = useSharePointAuth();
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [testData, setTestData] = useState<TestData>({});
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    try {
      const status = await checkSharePointConnection();
      setConnectionStatus(status);

      if (status.success) {
        // Test data loading from different lists
        const testResults: TestData = {};

        try {
          const trabajadores = await trabajadoresService.getTrabajadores();
          testResults.trabajadores = { count: trabajadores.length, data: trabajadores.slice(0, 3) };
        } catch (error) {
          testResults.trabajadores = { error: 'Lista TBL_TRABAJADORES no encontrada o sin acceso' };
        }

        try {
          const mandantes = await mandantesService.getMandantes();
          testResults.mandantes = { count: mandantes.length, data: mandantes.slice(0, 3) };
        } catch (error) {
          testResults.mandantes = { error: 'Lista Tbl_Mandantes no encontrada o sin acceso' };
        }

        try {
          const servicios = await serviciosService.getServicios();
          testResults.servicios = { count: servicios.length, data: servicios.slice(0, 3) };
        } catch (error) {
          testResults.servicios = { error: 'Lista TBL_SERVICIOS no encontrada o sin acceso' };
        }

        setTestData(testResults);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setConnectionStatus({ success: false, message: `Error: ${errorMessage}` });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Prueba de Conexión SharePoint - SAM ERP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Authentication Status */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Estado de Autenticación</h3>
            {isLoading ? (
              <Badge variant="secondary">Cargando...</Badge>
            ) : user ? (
              <div className="space-y-2">
                <Badge variant="default">Conectado</Badge>
                <div className="text-sm space-y-1">
                  <p><strong>Usuario:</strong> {user.nombre}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Rol:</strong> {user.rol_nombre}</p>
                  <p><strong>Estado:</strong> {user.activo ? 'Activo' : 'Inactivo'}</p>
                </div>
                <Button onClick={logout} variant="outline" size="sm">
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Badge variant="destructive">No autenticado</Badge>
                <div>
                  <Button onClick={login} size="sm">
                    Iniciar Sesión con Azure AD
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Permissions Check */}
          {user && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Permisos por Módulo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.values(MODULES).map(module => (
                  <div key={module} className="border rounded p-3">
                    <h4 className="font-medium capitalize mb-2">{module}</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Lectura:</span>
                        <Badge variant={canRead(module) ? "default" : "secondary"}>
                          {canRead(module) ? "✓" : "✗"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Colaboración:</span>
                        <Badge variant={canCollaborate(module) ? "default" : "secondary"}>
                          {canCollaborate(module) ? "✓" : "✗"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Administración:</span>
                        <Badge variant={canAdministrate(module) ? "default" : "secondary"}>
                          {canAdministrate(module) ? "✓" : "✗"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connection Test */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Prueba de Conexión a Listas</h3>
            <Button 
              onClick={testConnection} 
              disabled={testing || !user}
              className="mb-4"
            >
              {testing ? 'Probando...' : 'Probar Conexión'}
            </Button>

            {connectionStatus && (
              <div className={`p-3 rounded ${connectionStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {connectionStatus.message}
              </div>
            )}

            {testData && Object.keys(testData).length > 0 && (
              <div className="space-y-4 mt-4">
                {Object.entries(testData).map(([listName, data]) => (
                  <div key={listName} className="border rounded p-3">
                    <h4 className="font-medium capitalize mb-2">{listName}</h4>
                    {data.error ? (
                      <Badge variant="destructive">{data.error}</Badge>
                    ) : (
                      <div>
                        <Badge variant="default">{data.count} registros encontrados</Badge>
                        {data.data && data.data.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Primeros registros:</p>
                            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                              {JSON.stringify(data.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}