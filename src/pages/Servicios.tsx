import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Plus, Search, Edit, Trash2, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: string;
  categoria: string;
  activo: boolean;
  created_at: string;
}

export default function Servicios() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchServicios();
  }, []);

  const fetchServicios = async () => {
    try {
      const { data, error } = await supabase
        .from('tbl_servicios')
        .select('*')
        .order('nombre');

      if (error) {
        console.error('Error fetching servicios:', error);
        toast.error('Error al cargar servicios: ' + error.message);
        // Mostrar datos de ejemplo si hay error
        setServicios([
          {
            id: '1',
            nombre: 'Consultoría Empresarial',
            descripcion: 'Asesoría integral para optimización de procesos empresariales',
            precio: 150000,
            duracion: '2 horas',
            categoria: 'Consultoría',
            activo: true,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            nombre: 'Capacitación en Seguridad',
            descripcion: 'Programa de capacitación en seguridad industrial y prevención de riesgos',
            precio: 200000,
            duracion: '4 horas',
            categoria: 'Capacitación',
            activo: true,
            created_at: new Date().toISOString()
          }
        ]);
      } else {
        setServicios(data || []);
      }
    } catch (error) {
      console.error('Error fetching servicios:', error);
      toast.error('Error de conexión');
      setServicios([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredServicios = servicios.filter(servicio =>
    servicio.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servicio.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servicio.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

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
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
            <p className="text-gray-600">Catálogo de servicios ofrecidos</p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Servicio
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, descripción o categoría..."
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
                <p className="text-sm font-medium text-gray-600">Total Servicios</p>
                <p className="text-2xl font-bold text-gray-900">{servicios.length}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
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
                  {servicios.filter(s => s.activo).length}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categorías</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(servicios.map(s => s.categoria)).size}
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Briefcase className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Promedio</p>
                <p className="text-2xl font-bold text-cyan-600">
                  {formatPrice(servicios.reduce((sum, s) => sum + s.precio, 0) / servicios.length || 0)}
                </p>
              </div>
              <div className="bg-cyan-100 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Servicios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServicios.map((servicio) => (
          <Card key={servicio.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{servicio.nombre}</CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    {servicio.categoria}
                  </CardDescription>
                </div>
                <Badge variant={servicio.activo ? "default" : "secondary"}>
                  {servicio.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 line-clamp-3">
                {servicio.descripcion}
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Precio</p>
                  <p className="font-medium text-green-600">
                    {formatPrice(servicio.precio)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Duración</p>
                  <p className="font-medium flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {servicio.duracion}
                  </p>
                </div>
              </div>
              
              <div className="pt-3 border-t">
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

      {filteredServicios.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron servicios
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No hay servicios que coincidan con tu búsqueda.' : 'Comienza agregando tu primer servicio.'}
            </p>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Servicio
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}