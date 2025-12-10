import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Warehouse, Plus, Search, AlertTriangle, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface InventarioItem {
  id: string;
  producto_id: string;
  cantidad_actual: number;
  cantidad_reservada: number;
  cantidad_disponible: number;
  ubicacion: string;
  lote: string;
  fecha_vencimiento: string;
  created_at: string;
  producto: {
    codigo: string;
    nombre: string;
    categoria: string;
    stock_minimo: number;
    stock_maximo: number;
    unidad_medida: string;
  };
}

export default function Inventario() {
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInventario();
  }, []);

  const fetchInventario = async () => {
    try {
      const { data, error } = await supabase
        .from('tbl_inventario')
        .select(`
          *,
          producto:tbl_productos(
            codigo,
            nombre,
            categoria,
            stock_minimo,
            stock_maximo,
            unidad_medida
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInventario(data || []);
    } catch (error) {
      console.error('Error fetching inventario:', error);
      toast.error('Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  const filteredInventario = inventario.filter(item =>
    item.producto?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.producto?.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.lote?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (item: InventarioItem) => {
    if (!item.producto) return 'normal';
    
    if (item.cantidad_actual <= item.producto.stock_minimo) {
      return 'bajo';
    } else if (item.cantidad_actual >= item.producto.stock_maximo) {
      return 'alto';
    }
    return 'normal';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'bajo':
        return <Badge variant="destructive">Stock Bajo</Badge>;
      case 'alto':
        return <Badge className="bg-orange-500">Stock Alto</Badge>;
      default:
        return <Badge variant="default">Normal</Badge>;
    }
  };

  const stockBajo = inventario.filter(item => getStockStatus(item) === 'bajo').length;
  const stockAlto = inventario.filter(item => getStockStatus(item) === 'alto').length;
  const totalItems = inventario.length;
  const totalStock = inventario.reduce((sum, item) => sum + item.cantidad_actual, 0);

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
            <Warehouse className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
            <p className="text-gray-600">Control y gestión de stock</p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Ajuste de Inventario
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por producto, código, ubicación o lote..."
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
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Total</p>
                <p className="text-2xl font-bold text-cyan-600">{totalStock.toLocaleString()}</p>
              </div>
              <div className="bg-cyan-100 p-2 rounded-lg">
                <Warehouse className="h-5 w-5 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                <p className="text-2xl font-bold text-red-600">{stockBajo}</p>
              </div>
              <div className="bg-red-100 p-2 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Alto</p>
                <p className="text-2xl font-bold text-orange-600">{stockAlto}</p>
              </div>
              <div className="bg-orange-100 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Stock Bajo */}
      {stockBajo > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-800">Alertas de Stock Bajo</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-3">
              Hay {stockBajo} productos con stock por debajo del mínimo requerido.
            </p>
            <Button size="sm" variant="outline" className="text-red-700 border-red-300">
              Ver Productos Críticos
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Inventario Table */}
      <Card>
        <CardHeader>
          <CardTitle>Items de Inventario</CardTitle>
          <CardDescription>
            Lista completa del inventario actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInventario.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.producto?.nombre || 'Producto no encontrado'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.producto?.codigo} • {item.producto?.categoria}
                    </p>
                  </div>
                  {getStatusBadge(getStockStatus(item))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Stock Actual</p>
                    <p className="font-medium text-lg">
                      {item.cantidad_actual} {item.producto?.unidad_medida}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Reservado</p>
                    <p className="font-medium">
                      {item.cantidad_reservada} {item.producto?.unidad_medida}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Disponible</p>
                    <p className="font-medium text-green-600">
                      {item.cantidad_disponible} {item.producto?.unidad_medida}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ubicación</p>
                    <p className="font-medium">{item.ubicacion || 'No especificada'}</p>
                  </div>
                </div>

                {(item.lote || item.fecha_vencimiento) && (
                  <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-4 text-sm">
                    {item.lote && (
                      <div>
                        <p className="text-gray-500">Lote</p>
                        <p className="font-medium">{item.lote}</p>
                      </div>
                    )}
                    {item.fecha_vencimiento && (
                      <div>
                        <p className="text-gray-500">Vencimiento</p>
                        <p className="font-medium">
                          {new Date(item.fecha_vencimiento).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3 pt-3 border-t">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      Ajustar Stock
                    </Button>
                    <Button size="sm" variant="outline">
                      Mover Ubicación
                    </Button>
                    <Button size="sm" variant="outline">
                      Ver Historial
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredInventario.length === 0 && (
            <div className="text-center py-8">
              <Warehouse className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron items de inventario
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No hay items que coincidan con tu búsqueda.' : 'El inventario está vacío.'}
              </p>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Item al Inventario
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}