import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSharePointAuth } from '@/contexts/SharePointAuthContext';
import { useSharePointData } from '@/hooks/useSharePointData';
import { vacacionesService } from '@/lib/sharepoint-services';
import { SHAREPOINT_LISTS } from '@/lib/sharepoint-mappings';
import { Plus, Search, Edit, Trash2, Calendar } from 'lucide-react';

interface Vacacion {
  id: string;
  trabajador_id: string;
  trabajador_nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  dias_solicitados: number;
  estado: string;
  observaciones: string;
}

export default function Vacaciones() {
  const { canCollaborate, canAdministrate } = useSharePointAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    data: vacaciones,
    loading,
    error,
    refetch,
    create,
    update,
    remove
  } = useSharePointData<Vacacion>(vacacionesService, {
    listName: SHAREPOINT_LISTS.VACACIONES,
    select: 'id,trabajador_id,trabajador_nombre,fecha_inicio,fecha_fin,dias_solicitados,estado,observaciones'
  });

  const canEdit = canCollaborate('rrhh');
  const canDelete = canAdministrate('rrhh');

  const filteredVacaciones = vacaciones.filter(vacacion =>
    vacacion.trabajador_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vacacion.estado?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    // TODO: Implement create modal
    console.log('Create vacacion');
  };

  const handleEdit = async (vacacion: Vacacion) => {
    // TODO: Implement edit modal
    console.log('Edit vacacion:', vacacion);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta solicitud de vacaciones?')) {
      try {
        await remove(id);
      } catch (err: any) {
        alert('Error al eliminar solicitud: ' + err.message);
      }
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'aprobado':
        return <Badge variant="default">Aprobado</Badge>;
      case 'pendiente':
        return <Badge variant="secondary">Pendiente</Badge>;
      case 'rechazado':
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
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
          <h1 className="text-2xl font-bold text-gray-900">Vacaciones</h1>
          <p className="text-gray-600">Gestión de solicitudes de vacaciones</p>
        </div>
        {canEdit && (
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Solicitud
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
              <Calendar className="h-5 w-5" />
              Solicitudes de Vacaciones ({filteredVacaciones.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar solicitudes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredVacaciones.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No se encontraron solicitudes' : 'No hay solicitudes de vacaciones'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Trabajador</th>
                    <th className="text-left py-3 px-4 font-medium">Fecha Inicio</th>
                    <th className="text-left py-3 px-4 font-medium">Fecha Fin</th>
                    <th className="text-left py-3 px-4 font-medium">Días</th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    {(canEdit || canDelete) && (
                      <th className="text-left py-3 px-4 font-medium">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredVacaciones.map((vacacion) => (
                    <tr key={vacacion.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{vacacion.trabajador_nombre}</div>
                        {vacacion.observaciones && (
                          <div className="text-sm text-gray-500">{vacacion.observaciones}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {vacacion.fecha_inicio && new Date(vacacion.fecha_inicio).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {vacacion.fecha_fin && new Date(vacacion.fecha_fin).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-medium">{vacacion.dias_solicitados}</td>
                      <td className="py-3 px-4">
                        {getEstadoBadge(vacacion.estado)}
                      </td>
                      {(canEdit || canDelete) && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {canEdit && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(vacacion)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(vacacion.id)}
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