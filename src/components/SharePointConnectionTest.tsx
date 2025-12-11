import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSharePointAuth } from '@/contexts/SharePointAuthContext';
import { checkSharePointConnection } from '@/lib/sharepoint';
import { 
  trabajadoresService, 
  mandantesService, 
  serviciosService,
  vacacionesService,
  directivasService,
  usuariosService
} from '@/lib/sharepoint-services';
import { SHAREPOINT_LISTS } from '@/lib/sharepoint-mappings';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'loading';
  message: string;
  data?: unknown[];
  count?: number;
}

export function SharePointConnectionTest() {
  const { user, login } = useSharePointAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const testServices = [
    { name: 'TBL_TRABAJADORES', service: trabajadoresService, listName: SHAREPOINT_LISTS.TRABAJADORES },
    { name: 'Tbl_Mandantes', service: mandantesService, listName: SHAREPOINT_LISTS.MANDANTES },
    { name: 'TBL_SERVICIOS', service: serviciosService, listName: SHAREPOINT_LISTS.SERVICIOS },
    { name: 'TBL_VACACIONES', service: vacacionesService, listName: SHAREPOINT_LISTS.VACACIONES },
    { name: 'TBL_DIRECTIVAS', service: directivasService, listName: SHAREPOINT_LISTS.DIRECTIVAS },
    { name: 'TBL_USUARIOS', service: usuariosService, listName: SHAREPOINT_LISTS.USUARIOS },
  ];

  const runComprehensiveTest = async () => {
    setTesting(true);
    const testResults: TestResult[] = [];

    // Test 1: SharePoint Connection
    testResults.push({ name: 'Conexión SharePoint', status: 'loading', message: 'Probando...' });
    setResults([...testResults]);

    try {
      const connectionResult = await checkSharePointConnection();
      testResults[0] = {
        name: 'Conexión SharePoint',
        status: connectionResult.success ? 'success' : 'error',
        message: connectionResult.message
      };
      setResults([...testResults]);
    } catch (error) {
      testResults[0] = {
        name: 'Conexión SharePoint',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
      setResults([...testResults]);
    }

    // Test 2-7: Each SharePoint List
    for (let i = 0; i < testServices.length; i++) {
      const { name, service, listName } = testServices[i];
      
      testResults.push({ name, status: 'loading', message: 'Cargando datos...' });
      setResults([...testResults]);

      try {
        const data = await service.getItems(listName);
        testResults[i + 1] = {
          name,
          status: 'success',
          message: `✓ Lista encontrada y accesible`,
          data: data.slice(0, 2), // Solo primeros 2 registros para preview
          count: data.length
        };
      } catch (error) {
        testResults[i + 1] = {
          name,
          status: 'error',
          message: `Error: ${error instanceof Error ? error.message : 'Lista no encontrada o sin permisos'}`
        };
      }
      
      setResults([...testResults]);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-600">Exitoso</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'loading':
        return <Badge variant="secondary">Cargando...</Badge>;
      default:
        return <Badge variant="outline">Pendiente</Badge>;
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prueba de Conexión SharePoint</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Debes iniciar sesión para probar la conexión a SharePoint.
            </AlertDescription>
          </Alert>
          <Button onClick={login} className="mt-4">
            Iniciar Sesión con Azure AD
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Verificación Completa de SharePoint</CardTitle>
          <p className="text-sm text-gray-600">
            Prueba la conexión y acceso a todas las listas de SharePoint del SAM ERP
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Usuario: {user.nombre}</p>
                <p className="text-sm text-gray-600">Rol: {user.rol_nombre}</p>
              </div>
              <Button 
                onClick={runComprehensiveTest} 
                disabled={testing}
                className="flex items-center gap-2"
              >
                {testing && <Loader2 className="h-4 w-4 animate-spin" />}
                {testing ? 'Probando...' : 'Ejecutar Prueba Completa'}
              </Button>
            </div>

            {results.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Resultados de la Prueba:</h3>
                
                {results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <span className="font-medium">{result.name}</span>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                    
                    {result.count !== undefined && (
                      <p className="text-sm font-medium text-blue-600">
                        Registros encontrados: {result.count}
                      </p>
                    )}
                    
                    {result.data && result.data.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-sm cursor-pointer text-gray-500 hover:text-gray-700">
                          Ver datos de ejemplo ({result.data.length} registros)
                        </summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
                
                {!testing && results.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Resumen de la Prueba</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-green-600 font-medium">
                          ✓ Exitosos: {results.filter(r => r.status === 'success').length}
                        </span>
                      </div>
                      <div>
                        <span className="text-red-600 font-medium">
                          ✗ Errores: {results.filter(r => r.status === 'error').length}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">
                          Total: {results.length} pruebas
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}