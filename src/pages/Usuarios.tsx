import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSharePointAuth } from '@/contexts/SharePointAuthContext';
import { useSharePointData } from '@/hooks/useSharePointData';
import { usuariosService } from '@/lib/sharepoint-services';
import { SHAREPOINT_LISTS, MODULES, PERMISSION_LEVELS } from '@/lib/sharepoint-mappings';
import { Plus, Search, Edit, Trash2, Users, Shield } from 'lucide-react';

interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol_id: number;
  rol_nombre: string;
  activo: boolean;
  fecha_creacion: string;
}

interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
}

export default function Usuarios() {
  const { canAdministrate } = useSharePointAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  
  const {
    data: usuarios,
    loading: loadingUsuarios,
    error: errorUsuarios,
    refetch: refetchUsuarios,
    create: createUsuario,
    update: updateUsuario,
    remove: removeUsuario
  } = useSharePointData<Usuario>(usuariosService, {
    listName: SHAREPOINT_LISTS.USUARIOS,
    select: 'id,email,nombre,rol_id,rol_nombre,activo,fecha_creacion'
  });

  const {
    data: roles,
    loading: loadingRoles
  } = useSharePointData<Rol>(usuariosService, {
    listName: SHAREPOINT_LISTS.ROLES,
    select: 'id,nombre,descripcion'
  });

  const canManage = canAdministrate('usuarios');

  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = usuario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || usuario.rol_id.toString() === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleCreate = async () => {
    // TODO: Implement create modal
    console.log('Create usuario');
  };

  const handleEdit = async (usuario: Usuario) => {
    // TODO: Implement edit modal
    console.log('Edit usuario:', usuario);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await removeUsuario(id);
      } catch (err: any) {
        alert('Error al eliminar usuario: ' + err.message);
      }
    }
  };

  const handleToggleActive = async (usuario: Usuario) => {
    try {
      await updateUsuario(usuario.id, { activo: !usuario.activo });
    } catch (err: any) {
      alert('Error al actualizar usuario: ' + err.message);
    }
  };

  if (loadingUsuarios || loadingRoles) {
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
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600">Gestión de usuarios del sistema</p>
        </div>
        {canManage && (
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      {errorUsuarios && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800">Error: {errorUsuarios}</p>
            <Button onClick={refetchUsuarios} variant="outline" size="sm" className="mt-2">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Usuarios ({filteredUsuarios.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los roles</SelectItem>
                  {roles.map((rol) => (
                    <SelectItem key={rol.id} value={rol.id.toString()}>
                      {rol.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsuarios.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || selectedRole ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Usuario</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Rol</th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    <th className="text-left py-3 px-4 font-medium">Fecha Creación</th>
                    {canManage && (
                      <th className="text-left py-3 px-4 font-medium">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsuarios.map((usuario) => (
                    <tr key={usuario.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="font-medium">{usuario.nombre}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{usuario.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {usuario.rol_nombre}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={usuario.activo ? "default" : "secondary"}>
                          {usuario.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {usuario.fecha_creacion && new Date(usuario.fecha_creacion).toLocaleDateString()}
                      </td>
                      {canManage && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(usuario)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(usuario)}
                              className={usuario.activo ? "text-orange-600" : "text-green-600"}
                            >
                              {usuario.activo ? "Desactivar" : "Activar"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(usuario.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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