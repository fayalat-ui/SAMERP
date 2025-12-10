import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Plus, Search, Edit, Trash2, Shield, Eye, UserCheck, Settings, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol_id: string;
  activo: boolean;
  created_at: string;
  rol?: {
    nombre: string;
  };
}

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
}

interface Modulo {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  ruta: string;
  activo: boolean;
}

interface PermisoModulo {
  modulo_id: string;
  nivel_acceso: 'lectura' | 'colaborador' | 'administrador';
  activo: boolean;
}

const NIVELES_ACCESO = [
  { value: 'lectura', label: 'Lectura', description: 'Solo puede ver información', icon: Eye },
  { value: 'colaborador', label: 'Colaborador', description: 'Puede ver y editar', icon: UserCheck },
  { value: 'administrador', label: 'Administrador', description: 'Control total y eliminar', icon: Settings }
];

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [userPermissions, setUserPermissions] = useState<PermisoModulo[]>([]);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    nombre: '',
    email: '',
    rol_id: '',
    activo: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Cargar usuarios con sus roles
      const { data: usuariosData, error: usuariosError } = await supabase
        .from('tbl_usuarios')
        .select(`
          *,
          rol:tbl_roles(nombre)
        `)
        .order('nombre');

      if (usuariosError) throw usuariosError;

      // Cargar roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('tbl_roles')
        .select('*')
        .order('nombre');

      if (rolesError) throw rolesError;

      // Intentar cargar módulos (si existe la tabla)
      let modulosData = [];
      try {
        const { data, error } = await supabase
          .from('tbl_modulos')
          .select('*')
          .eq('activo', true)
          .order('nombre');
        
        if (!error) {
          modulosData = data || [];
        }
      } catch (e) {
        // Si no existe la tabla de módulos, usar módulos predeterminados
        modulosData = [
          { id: '1', nombre: 'Dashboard', descripcion: 'Panel principal', icono: 'LayoutDashboard', ruta: '/dashboard', activo: true },
          { id: '2', nombre: 'Usuarios', descripcion: 'Gestión de usuarios', icono: 'Users', ruta: '/usuarios', activo: true },
          { id: '3', nombre: 'Roles', descripcion: 'Gestión de roles', icono: 'Shield', ruta: '/roles', activo: true },
          { id: '4', nombre: 'Clientes', descripcion: 'Gestión de clientes', icono: 'Building2', ruta: '/clientes', activo: true },
          { id: '5', nombre: 'Trabajadores', descripcion: 'Gestión de trabajadores', icono: 'UserCheck', ruta: '/trabajadores', activo: true },
          { id: '6', nombre: 'Servicios', descripción: 'Gestión de servicios', icono: 'Briefcase', ruta: '/servicios', activo: true },
          { id: '7', nombre: 'Vacaciones', descripcion: 'Solicitudes de vacaciones', icono: 'Calendar', ruta: '/vacaciones', activo: true },
          { id: '8', nombre: 'Directivas', descripcion: 'Directivas empresariales', icono: 'FileText', ruta: '/directivas', activo: true },
          { id: '9', nombre: 'Mandantes', descripcion: 'Gestión de mandantes', icono: 'Building', ruta: '/mandantes', activo: true }
        ];
      }

      setUsuarios(usuariosData || []);
      setRoles(rolesData || []);
      setModulos(modulosData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPermissions = async (userId: string) => {
    try {
      // Intentar cargar permisos existentes del usuario
      const { data, error } = await supabase
        .from('tbl_permisos')
        .select('*')
        .eq('usuario_id', userId);

      if (error && !error.message.includes('does not exist')) {
        throw error;
      }

      // Si no hay permisos o la tabla no existe, inicializar con permisos vacíos
      const permissions = modulos.map(modulo => ({
        modulo_id: modulo.id,
        nivel_acceso: 'lectura' as const,
        activo: false
      }));

      // Si hay permisos existentes, actualizarlos
      if (data && data.length > 0) {
        data.forEach(permiso => {
          const index = permissions.findIndex(p => p.modulo_id === permiso.modulo_id);
          if (index !== -1) {
            permissions[index] = {
              modulo_id: permiso.modulo_id,
              nivel_acceso: permiso.nivel_acceso,
              activo: permiso.activo
            };
          }
        });
      }

      setUserPermissions(permissions);
    } catch (error) {
      console.error('Error loading user permissions:', error);
      // Inicializar con permisos vacíos en caso de error
      const permissions = modulos.map(modulo => ({
        modulo_id: modulo.id,
        nivel_acceso: 'lectura' as const,
        activo: false
      }));
      setUserPermissions(permissions);
    }
  };

  const saveUserPermissions = async () => {
    if (!selectedUser) return;

    try {
      // Eliminar permisos existentes del usuario
      await supabase
        .from('tbl_permisos')
        .delete()
        .eq('usuario_id', selectedUser.id);

      // Insertar nuevos permisos activos
      const activePermissions = userPermissions
        .filter(p => p.activo)
        .map(p => ({
          usuario_id: selectedUser.id,
          modulo_id: p.modulo_id,
          nivel_acceso: p.nivel_acceso,
          activo: true
        }));

      if (activePermissions.length > 0) {
        const { error } = await supabase
          .from('tbl_permisos')
          .insert(activePermissions);

        if (error) throw error;
      }

      toast.success('Permisos actualizados correctamente');
      setIsPermissionsDialogOpen(false);
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Error al guardar permisos');
    }
  };

  const handlePermissionChange = (moduloId: string, field: 'activo' | 'nivel_acceso', value: any) => {
    setUserPermissions(prev => prev.map(p => 
      p.modulo_id === moduloId 
        ? { ...p, [field]: value }
        : p
    ));
  };

  const openPermissionsDialog = async (user: Usuario) => {
    setSelectedUser(user);
    await loadUserPermissions(user.id);
    setIsPermissionsDialogOpen(true);
  };

  const openEditDialog = (user: Usuario) => {
    setSelectedUser(user);
    setEditForm({
      nombre: user.nombre,
      email: user.email,
      rol_id: user.rol_id,
      activo: user.activo
    });
    setIsEditDialogOpen(true);
  };

  const saveUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('tbl_usuarios')
        .update(editForm)
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast.success('Usuario actualizado correctamente');
      setIsEditDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Error al guardar usuario');
    }
  };

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Administración de Usuarios</h1>
            <p className="text-gray-600">Gestión de usuarios y permisos por módulos</p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{usuarios.length}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {usuarios.filter(u => u.activo).length}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Roles Disponibles</p>
                <p className="text-2xl font-bold text-purple-600">{roles.length}</p>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Módulos Sistema</p>
                <p className="text-2xl font-bold text-cyan-600">{modulos.length}</p>
              </div>
              <div className="bg-cyan-100 p-2 rounded-lg">
                <Settings className="h-5 w-5 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usuarios Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Gestiona usuarios y asigna permisos específicos por módulo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsuarios.map((usuario) => (
              <div key={usuario.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{usuario.nombre}</h3>
                        <p className="text-sm text-gray-500">{usuario.email}</p>
                      </div>
                      <Badge variant={usuario.activo ? "default" : "secondary"}>
                        {usuario.activo ? "Activo" : "Inactivo"}
                      </Badge>
                      <Badge variant="outline">
                        {usuario.rol?.nombre || 'Sin rol'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(usuario)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openPermissionsDialog(usuario)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Permisos
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredUsuarios.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron usuarios
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No hay usuarios que coincidan con tu búsqueda.' : 'Comienza agregando tu primer usuario.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Permisos */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Permisos de {selectedUser?.nombre}</span>
            </DialogTitle>
            <DialogDescription>
              Configura los permisos de acceso a cada módulo del sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              {NIVELES_ACCESO.map((nivel) => {
                const Icon = nivel.icon;
                return (
                  <div key={nivel.value} className="text-center">
                    <Icon className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <h4 className="font-medium text-sm">{nivel.label}</h4>
                    <p className="text-xs text-gray-500">{nivel.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              {modulos.map((modulo) => {
                const permission = userPermissions.find(p => p.modulo_id === modulo.id);
                return (
                  <div key={modulo.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={permission?.activo || false}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(modulo.id, 'activo', checked)
                          }
                        />
                        <div>
                          <h4 className="font-medium">{modulo.nombre}</h4>
                          <p className="text-sm text-gray-500">{modulo.descripcion}</p>
                        </div>
                      </div>
                      
                      {permission?.activo && (
                        <Select
                          value={permission.nivel_acceso}
                          onValueChange={(value) => 
                            handlePermissionChange(modulo.id, 'nivel_acceso', value)
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {NIVELES_ACCESO.map((nivel) => (
                              <SelectItem key={nivel.value} value={nivel.value}>
                                {nivel.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveUserPermissions}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Permisos
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={editForm.nombre}
                onChange={(e) => setEditForm(prev => ({ ...prev, nombre: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="rol">Rol</Label>
              <Select
                value={editForm.rol_id}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, rol_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((rol) => (
                    <SelectItem key={rol.id} value={rol.id}>
                      {rol.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="activo"
                checked={editForm.activo}
                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, activo: !!checked }))}
              />
              <Label htmlFor="activo">Usuario activo</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveUser}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}