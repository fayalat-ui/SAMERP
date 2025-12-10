import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Search, Edit, Eye, DollarSign, Calendar, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Venta {
  id: string;
  numero_venta: string;
  cliente_id: string;
  fecha_venta: string;
  subtotal: number;
  impuestos: number;
  descuento: number;
  total: number;
  estado: string;
  observaciones: string;
  created_at: string;
  cliente?: {
    nombre: string;
    email: string;
  };
}

export default function Ventas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    try {
      const { data, error } = await supabase
        .from('tbl_ventas')
        .select(`
          *,
          cliente:tbl_clientes(nombre, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVentas(data || []);
    } catch (error) {
      console.error('Error fetching ventas:', error);
      toast.error('Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  const filteredVentas = ventas.filter(venta =>
    venta.numero_venta.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venta.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venta.estado.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'Completada':
        return <Badge className="bg-green-500">Completada</Badge>;
      case 'Pendiente':
        return <Badge className="bg-yellow-500">Pendiente</Badge>;
      case 'Cancelada':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const totalVentas = ventas.reduce((sum, venta) => sum + venta.total, 0);
  const ventasCompletadas = ventas.filter(v => v.estado === 'Completada').length;
  const ventasPendientes = ventas.filter(v => v.estado === 'Pendiente').length;

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
            <ShoppingCart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
            <p className="text-gray-600">Gestión de ventas y pedidos</p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Venta
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por número de venta, cliente o estado..."
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
                <p className="text-sm font-medium text-gray-600">Total Ventas</p>
                <p className="text-2xl font-bold text-gray-900">{ventas.length}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(totalVentas)}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-emerald-600">{ventasCompletadas}</p>
              </div>
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Badge className="bg-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{ventasPendientes}</p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Badge className="bg-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ventas List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ventas</CardTitle>
          <CardDescription>
            Historial completo de ventas registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredVentas.map((venta) => (
              <div key={venta.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      Venta #{venta.numero_venta}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {venta.cliente?.nombre || 'Cliente no especificado'}
                    </p>
                  </div>
                  {getStatusBadge(venta.estado)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-500">Fecha</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(venta.fecha_venta).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Subtotal</p>
                    <p className="font-medium">{formatPrice(venta.subtotal)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Impuestos</p>
                    <p className="font-medium">{formatPrice(venta.impuestos)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total</p>
                    <p className="font-medium text-lg text-green-600">
                      {formatPrice(venta.total)}
                    </p>
                  </div>
                </div>

                {venta.descuento > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500">
                      Descuento aplicado: {formatPrice(venta.descuento)}
                    </p>
                  </div>
                )}

                {venta.observaciones && (
                  <div className="mb-3 p-2 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">
                      <strong>Observaciones:</strong> {venta.observaciones}
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      Ver Detalles
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    {venta.estado === 'Completada' && (
                      <Button size="sm" variant="outline" className="text-blue-600">
                        Generar Factura
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredVentas.length === 0 && (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron ventas
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No hay ventas que coincidan con tu búsqueda.' : 'Comienza registrando tu primera venta.'}
              </p>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Venta
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}