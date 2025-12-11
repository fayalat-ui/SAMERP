import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSharePointAuth } from '@/contexts/SharePointAuthContext';
import { useSharePointData } from '@/hooks/useSharePointData';
import { mandantesService } from '@/lib/sharepoint-services';
import { SHAREPOINT_LISTS } from '@/lib/sharepoint-mappings';
import { Plus, Search, Edit, Trash2, Building } from 'lucide-react';

interface Mandante {
  id: string;
  nombre: string;
  rut: string;
  direccion: string;
  telefono: string;
  email: string;
  contacto: string;
  activo: boolean;
}

export default function Mandantes() {
  const { canCollaborate, canAdministrate } = useSharePointAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    data: mandantes,
    loading,
    error,
    refetch,
    create,
    update,
    remove
  } = useSharePointData<Mandante>(mandantesService, {
    listName: SHAREPOINT_LISTS.MANDANTES,
    select: 'id,nombre,rut,direccion,telefono,email,contacto,activo'
  });

  const canEdit = canCollaborate('administradores');
  const canDelete = canAdministrate('administradores');

  const filteredMandantes = mandantes.filter(mandante =>
    mandante.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mandante.rut?.includes(searchTerm) ||
    mandante.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    // TODO: Implement create modal
    console.log('Create mandante');
  };

  const handleEdit = async (mandante: Mandante) => {
    // TODO: Implement edit modal
    console.log('Edit mandante:', mandante);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este mandante?')) {
      try {
        await remove(id);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        alert('Error al eliminar mandante: ' + errorMessage);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mandantes</h1>
          <p className="text-gray-600">Gestión de empresas mandantes</p>
        </div>
        {canEdit && (
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Mandante
          </Button>
        )}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800">Error: {error}</p>
            <Button onClick={refetch} variant="outline" size="sm" className="mt-2">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Lista de Mandantes ({filteredMandantes.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar mandantes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMandantes.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No se encontraron mandantes' : 'No hay mandantes registrados'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Empresa</th>
                    <th className="text-left py-3 px-4 font-medium">RUT</th>
                    <th className="text-left py-3 px-4 font-medium">Contacto</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    {(canEdit || canDelete) && (
                      <th className="text-left py-3 px-4 font-medium">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredMandantes.map((mandante) => (
                    <tr key={mandante.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{mandante.nombre}</div>
                          {mandante.direccion && (
                            <div className="text-sm text-gray-500">{mandante.direccion}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">{mandante.rut}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{mandante.contacto}</div>
                          {mandante.telefono && (
                            <div className="text-sm text-gray-500">{mandante.telefono}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{mandante.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant={mandante.activo ? "default" : "secondary"}>
                          {mandante.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      {(canEdit || canDelete) && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {canEdit && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(mandante)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(mandante.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}