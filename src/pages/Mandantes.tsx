import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, Search, Edit, Trash2, MapPin, Phone, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Mandante {
  id: string;
  nombre: string;
  rut: string;
  direccion: string;
  telefono: string;
  email: string;
  contacto_principal: string;
  activo: boolean;
  created_at: string;
}

export default function Mandantes() {
  const [mandantes, setMandantes] = useState<Mandante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMandantes();
  }, []);

  const fetchMandantes = async () => {
    try {
      const { data, error } = await supabase
        .from('tbl_mandantes')
        .select('*')
        .order('nombre');

      if (error) {
        console.error('Error fetching mandantes:', error);
        toast.error('Error al cargar mandantes: ' + error.message);
        // Mostrar datos de ejemplo si hay error
        setMandantes([
          {
            id: '1',
            nombre: 'Empresa Ejemplo S.A.',
            rut: '12.345.678-9',
            direccion: 'Av. Principal 123, Santiago',
            telefono: '+56 2 2345 6789',
            email: 'contacto@ejemplo.cl',
            contacto_principal: 'Juan Pérez',
            activo: true,
            created_at: new Date().toISOString()
          }
        ]);
      } else {
        setMandantes(data || []);
      }
    } catch (error) {
      console.error('Error fetching mandantes:', error);
      toast.error('Error de conexión');
      setMandantes([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMandantes = mandantes.filter(mandante =>
    mandante.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mandante.rut?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mandante.contacto_principal?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Building className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mandantes</h1>
            <p className="text-gray-600">Gestión de empresas mandantes</p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Mandante
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, RUT o contacto..."
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
                <p className="text-sm font-medium text-gray-600">Total Mandantes</p>
                <p className="text-2xl font-bold text-gray-900">{mandantes.length}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {mandantes.filter(m => m.activo).length}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <Building className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactivos</p>
                <p className="text-2xl font-bold text-red-600">
                  {mandantes.filter(m => !m.activo).length}
                </p>
              </div>
              <div className="bg-red-100 p-2 rounded-lg">
                <Building className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Este Mes</p>
                <p className="text-2xl font-bold text-purple-600">
                  {mandantes.filter(m => {
                    const created = new Date(m.created_at);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Plus className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mandantes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMandantes.map((mandante) => (
          <Card key={mandante.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{mandante.nombre}</CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    RUT: {mandante.rut}
                  </CardDescription>
                </div>
                <Badge variant={mandante.activo ? "default" : "secondary"}>
                  {mandante.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {mandante.direccion || 'No especificada'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {mandante.telefono || 'No especificado'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {mandante.email || 'No especificado'}
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500 mb-3">
                  Contacto: {mandante.contacto_principal || 'No especificado'}
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMandantes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron mandantes
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No hay mandantes que coincidan con tu búsqueda.' : 'Comienza agregando tu primer mandante.'}
            </p>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Mandante
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}