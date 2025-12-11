import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSharePointAuth } from '@/contexts/SharePointAuthContext';
import { useSharePointData } from '@/hooks/useSharePointData';
import { serviciosService } from '@/lib/sharepoint-services';
import { SHAREPOINT_LISTS } from '@/lib/sharepoint-mappings';
import { Plus, Search, Edit, Trash2, Briefcase } from 'lucide-react';

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  codigo: string;
  categoria: string;
  precio: number;
  activo: boolean;
}

export default function Servicios() {
  const { canCollaborate, canAdministrate } = useSharePointAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    data: servicios,
    loading,
    error,
    refetch,
    create,
    update,
    remove
  } = useSharePointData<Servicio>(serviciosService, {
    listName: SHAREPOINT_LISTS.SERVICIOS,
    select: 'id,nombre,descripcion,codigo,categoria,precio,activo'
  });

  const canEdit = canCollaborate('osp');
  const canDelete = canAdministrate('osp');

  const filteredServicios = servicios.filter(servicio =>
    servicio.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servicio.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servicio.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    // TODO: Implement create modal
    console.log('Create servicio');
  };

  const handleEdit = async (servicio: Servicio) => {
    // TODO: Implement edit modal
    console.log('Edit servicio:', servicio);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      try {
        await remove(id);
      } catch (err: any) {
        alert('Error al eliminar servicio: ' + err.message);
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
          <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
          <p className="text-gray-600">Gestión de servicios OSP</p>
        </div>
        {canEdit && (
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Servicio
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
              <Briefcase className="h-5 w-5" />
              Lista de Servicios ({filteredServicios.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar servicios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredServicios.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No se encontraron servicios' : 'No hay servicios registrados'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Servicio</th>
                    <th className="text-left py-3 px-4 font-medium">Código</th>
                    <th className="text-left py-3 px-4 font-medium">Categoría</th>
                    <th className="text-left py-3 px-4 font-medium">Precio</th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    {(canEdit || canDelete) && (
                      <th className="text-left py-3 px-4 font-medium">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredServicios.map((servicio) => (
                    <tr key={servicio.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{servicio.nombre}</div>
                          {servicio.descripcion && (
                            <div className="text-sm text-gray-500">{servicio.descripcion}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">{servicio.codigo}</td>
                      <td className="py-3 px-4">{servicio.categoria}</td>
                      <td className="py-3 px-4">
                        {servicio.precio && (
                          <span className="font-medium">
                            ${servicio.precio.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={servicio.activo ? "default" : "secondary"}>
                          {servicio.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      {(canEdit || canDelete) && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {canEdit && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(servicio)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(servicio.id)}
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