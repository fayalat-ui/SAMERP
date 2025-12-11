import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSharePointAuth } from '@/contexts/SharePointAuth Context';
import { useSharePointData } from '@/hooks/useSharePointData';
import { trabajadoresService } from '@/lib/sharepoint-services';
import { SHAREPOINT_LISTS } from '@/lib/sharepoint-mappings';
import { Plus, Search, Edit, Trash2, User } from 'lucide-react';

interface Trabajador {
  id: string;
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  telefono: string;
  cargo: string;
  departamento: string;
  fecha_ingreso: string;
  activo: boolean;
}

export function Trabajadores() {
  const { canCollaborate, canAdministrate } = useSharePointAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    data: trabajadores,
    loading,
    error,
    refetch,
    create,
    update,
    remove
  } = useSharePointData<Trabajador>(trabajadoresService, {
    listName: SHAREPOINT_LISTS.TRABAJADORES,
    select: 'id,nombre,apellido,rut,email,telefono,cargo,departamento,fecha_ingreso,activo'
  });

  const canEdit = canCollaborate('rrhh');
  const canDelete = canAdministrate('rrhh');

  const filteredTrabajadores = trabajadores.filter(trabajador =>
    trabajador.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trabajador.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trabajador.rut?.includes(searchTerm) ||
    trabajador.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    // TODO: Implement create modal
    console.log('Create trabajador');
  };

  const handleEdit = async (trabajador: Trabajador) => {
    // TODO: Implement edit modal
    console.log('Edit trabajador:', trabajador);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este trabajador?')) {
      try {
        await remove(id);
      } catch (err: any) {
        alert('Error al eliminar trabajador: ' + err.message);
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
          <h1 className="text-2xl font-bold text-gray-900">Trabajadores</h1>
          <p className="text-gray-600">Gestión de trabajadores y empleados</p>
        </div>
        {canEdit && (
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Trabajador
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
              <User className="h-5 w-5" />
              Lista de Trabajadores ({filteredTrabajadores.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar trabajadores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTrabajadores.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No se encontraron trabajadores' : 'No hay trabajadores registrados'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Nombre</th>
                    <th className="text-left py-3 px-4 font-medium">RUT</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Cargo</th>
                    <th className="text-left py-3 px-4 font-medium">Departamento</th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    {(canEdit || canDelete) && (
                      <th className="text-left py-3 px-4 font-medium">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredTrabajadores.map((trabajador) => (
                    <tr key={trabajador.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{trabajador.nombre} {trabajador.apellido}</div>
                          {trabajador.telefono && (
                            <div className="text-sm text-gray-500">{trabajador.telefono}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">{trabajador.rut}</td>
                      <td className="py-3 px-4 text-sm">{trabajador.email}</td>
                      <td className="py-3 px-4">{trabajador.cargo}</td>
                      <td className="py-3 px-4">{trabajador.departamento}</td>
                      <td className="py-3 px-4">
                        <Badge variant={trabajador.activo ? "default" : "secondary"}>
                          {trabajador.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      {(canEdit || canDelete) && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {canEdit && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(trabajador)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(trabajador.id)}
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