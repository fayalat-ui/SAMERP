const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qznkrrcdvtubcwwldndo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6bmtycmNkdnR1YmN3d2xkbmRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTYxMDQ5MCwiZXhwIjoyMDc3MTg2NDkwfQ.iNGOy6xVOZNJNhpJZjJhFPdBKUmEgKhKlPGwWfxvlKA'
);

async function createMissingTables() {
  console.log('🔄 Creando tablas faltantes para SAM ERP...');

  try {
    // 1. Tabla de módulos
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tbl_modulos (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          descripcion TEXT,
          icono VARCHAR(50),
          ruta VARCHAR(200),
          activo BOOLEAN DEFAULT true,
          orden INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        INSERT INTO tbl_modulos (nombre, descripcion, icono, ruta, activo, orden) VALUES
        ('Dashboard', 'Panel principal del sistema', 'LayoutDashboard', '/dashboard', true, 1),
        ('Clientes', 'Gestión de clientes', 'Users', '/clientes', true, 2),
        ('Proveedores', 'Gestión de proveedores', 'Truck', '/proveedores', true, 3),
        ('Productos', 'Catálogo de productos', 'Package', '/productos', true, 4),
        ('Inventario', 'Control de inventario', 'Warehouse', '/inventario', true, 5),
        ('Ventas', 'Gestión de ventas', 'ShoppingCart', '/ventas', true, 6),
        ('Compras', 'Gestión de compras', 'ShoppingBag', '/compras', true, 7),
        ('Facturación', 'Sistema de facturación', 'FileText', '/facturas', true, 8),
        ('Pagos', 'Control de pagos', 'CreditCard', '/pagos', true, 9),
        ('Empleados', 'Gestión de empleados', 'UserCheck', '/empleados', true, 10),
        ('Nómina', 'Sistema de nómina', 'Calculator', '/nomina', true, 11),
        ('Reportes', 'Reportes y análisis', 'BarChart3', '/reportes', true, 12),
        ('Configuración', 'Configuración del sistema', 'Settings', '/configuracion', true, 13)
        ON CONFLICT DO NOTHING;
      `
    });
    console.log('✅ Tabla tbl_modulos creada');

    // 2. Tabla de proveedores
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tbl_proveedores (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          codigo VARCHAR(20) UNIQUE NOT NULL,
          nombre VARCHAR(200) NOT NULL,
          contacto VARCHAR(100),
          telefono VARCHAR(20),
          email VARCHAR(100),
          direccion TEXT,
          ciudad VARCHAR(100),
          pais VARCHAR(100) DEFAULT 'Colombia',
          nit VARCHAR(20),
          activo BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        INSERT INTO tbl_proveedores (codigo, nombre, contacto, telefono, email, direccion, ciudad, nit) VALUES
        ('PROV001', 'Distribuidora Nacional S.A.S', 'Carlos Mendez', '3001234567', 'carlos@distnacional.com', 'Calle 50 #25-30', 'Bogotá', '900123456-1'),
        ('PROV002', 'Tecnología Avanzada Ltda', 'Ana Rodriguez', '3109876543', 'ana@tecavanzada.com', 'Carrera 15 #80-45', 'Medellín', '800987654-2')
        ON CONFLICT DO NOTHING;
      `
    });
    console.log('✅ Tabla tbl_proveedores creada');

    // 3. Tabla de productos
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tbl_productos (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          codigo VARCHAR(50) UNIQUE NOT NULL,
          nombre VARCHAR(200) NOT NULL,
          descripcion TEXT,
          categoria VARCHAR(100),
          marca VARCHAR(100),
          precio_compra DECIMAL(12,2) DEFAULT 0,
          precio_venta DECIMAL(12,2) DEFAULT 0,
          stock_minimo INTEGER DEFAULT 0,
          stock_maximo INTEGER DEFAULT 0,
          unidad_medida VARCHAR(20) DEFAULT 'UND',
          activo BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        INSERT INTO tbl_productos (codigo, nombre, descripcion, categoria, marca, precio_compra, precio_venta, stock_minimo, stock_maximo) VALUES
        ('PROD001', 'Laptop Dell Inspiron 15', 'Laptop Dell Inspiron 15 pulgadas, 8GB RAM, 256GB SSD', 'Tecnología', 'Dell', 2500000, 3200000, 5, 50),
        ('PROD002', 'Mouse Inalámbrico Logitech', 'Mouse inalámbrico ergonómico Logitech MX Master 3', 'Accesorios', 'Logitech', 180000, 250000, 10, 100)
        ON CONFLICT DO NOTHING;
      `
    });
    console.log('✅ Tabla tbl_productos creada');

    // 4. Tabla de inventario
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tbl_inventario (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          producto_id UUID REFERENCES tbl_productos(id),
          cantidad_actual INTEGER DEFAULT 0,
          cantidad_reservada INTEGER DEFAULT 0,
          cantidad_disponible INTEGER GENERATED ALWAYS AS (cantidad_actual - cantidad_reservada) STORED,
          ubicacion VARCHAR(100),
          lote VARCHAR(50),
          fecha_vencimiento DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    console.log('✅ Tabla tbl_inventario creada');

    // 5. Tabla de ventas
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tbl_ventas (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          numero_venta VARCHAR(20) UNIQUE NOT NULL,
          cliente_id UUID REFERENCES tbl_clientes(id),
          fecha_venta DATE DEFAULT CURRENT_DATE,
          subtotal DECIMAL(12,2) DEFAULT 0,
          impuestos DECIMAL(12,2) DEFAULT 0,
          descuento DECIMAL(12,2) DEFAULT 0,
          total DECIMAL(12,2) DEFAULT 0,
          estado VARCHAR(20) DEFAULT 'Pendiente',
          observaciones TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    console.log('✅ Tabla tbl_ventas creada');

    // 6. Tabla de compras
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tbl_compras (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          numero_compra VARCHAR(20) UNIQUE NOT NULL,
          proveedor_id UUID REFERENCES tbl_proveedores(id),
          fecha_compra DATE DEFAULT CURRENT_DATE,
          subtotal DECIMAL(12,2) DEFAULT 0,
          impuestos DECIMAL(12,2) DEFAULT 0,
          descuento DECIMAL(12,2) DEFAULT 0,
          total DECIMAL(12,2) DEFAULT 0,
          estado VARCHAR(20) DEFAULT 'Pendiente',
          observaciones TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    console.log('✅ Tabla tbl_compras creada');

    // 7. Tabla de facturas
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tbl_facturas (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          numero_factura VARCHAR(20) UNIQUE NOT NULL,
          venta_id UUID REFERENCES tbl_ventas(id),
          fecha_factura DATE DEFAULT CURRENT_DATE,
          fecha_vencimiento DATE,
          subtotal DECIMAL(12,2) DEFAULT 0,
          impuestos DECIMAL(12,2) DEFAULT 0,
          total DECIMAL(12,2) DEFAULT 0,
          estado VARCHAR(20) DEFAULT 'Pendiente',
          observaciones TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    console.log('✅ Tabla tbl_facturas creada');

    // 8. Tabla de pagos
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tbl_pagos (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          factura_id UUID REFERENCES tbl_facturas(id),
          numero_pago VARCHAR(20) UNIQUE NOT NULL,
          fecha_pago DATE DEFAULT CURRENT_DATE,
          monto DECIMAL(12,2) DEFAULT 0,
          metodo_pago VARCHAR(50) DEFAULT 'Efectivo',
          referencia VARCHAR(100),
          observaciones TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    console.log('✅ Tabla tbl_pagos creada');

    // 9. Tabla de empleados
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tbl_empleados (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          codigo VARCHAR(20) UNIQUE NOT NULL,
          nombres VARCHAR(100) NOT NULL,
          apellidos VARCHAR(100) NOT NULL,
          documento VARCHAR(20) UNIQUE NOT NULL,
          telefono VARCHAR(20),
          email VARCHAR(100),
          direccion TEXT,
          cargo VARCHAR(100),
          salario DECIMAL(12,2) DEFAULT 0,
          fecha_ingreso DATE DEFAULT CURRENT_DATE,
          activo BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        INSERT INTO tbl_empleados (codigo, nombres, apellidos, documento, telefono, email, cargo, salario) VALUES
        ('EMP001', 'Juan Carlos', 'Pérez López', '12345678', '3001234567', 'juan.perez@empresa.com', 'Gerente General', 5000000),
        ('EMP002', 'María Elena', 'González Ruiz', '87654321', '3109876543', 'maria.gonzalez@empresa.com', 'Contadora', 3500000)
        ON CONFLICT DO NOTHING;
      `
    });
    console.log('✅ Tabla tbl_empleados creada');

    // 10. Tabla de nómina
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tbl_nomina (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          empleado_id UUID REFERENCES tbl_empleados(id),
          periodo VARCHAR(20) NOT NULL,
          salario_base DECIMAL(12,2) DEFAULT 0,
          horas_extras DECIMAL(8,2) DEFAULT 0,
          bonificaciones DECIMAL(12,2) DEFAULT 0,
          deducciones DECIMAL(12,2) DEFAULT 0,
          total_devengado DECIMAL(12,2) DEFAULT 0,
          total_deducido DECIMAL(12,2) DEFAULT 0,
          neto_pagar DECIMAL(12,2) DEFAULT 0,
          estado VARCHAR(20) DEFAULT 'Pendiente',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    console.log('✅ Tabla tbl_nomina creada');

    // 11. Tabla de reportes
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tbl_reportes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          tipo VARCHAR(50) NOT NULL,
          descripcion TEXT,
          parametros JSONB,
          consulta TEXT,
          activo BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        INSERT INTO tbl_reportes (nombre, tipo, descripcion, parametros) VALUES
        ('Ventas por Cliente', 'ventas', 'Reporte de ventas agrupadas por cliente', '{"periodo": "mensual"}'),
        ('Inventario Bajo Stock', 'inventario', 'Productos con stock por debajo del mínimo', '{"limite": "stock_minimo"}'),
        ('Facturas Pendientes', 'facturacion', 'Facturas pendientes de pago', '{"estado": "Pendiente"}')
        ON CONFLICT DO NOTHING;
      `
    });
    console.log('✅ Tabla tbl_reportes creada');

    // 12. Tabla de configuración
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tbl_configuracion (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          clave VARCHAR(100) UNIQUE NOT NULL,
          valor TEXT,
          descripcion TEXT,
          tipo VARCHAR(20) DEFAULT 'string',
          categoria VARCHAR(50) DEFAULT 'general',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        INSERT INTO tbl_configuracion (clave, valor, descripcion, tipo, categoria) VALUES
        ('empresa_nombre', 'SAM ERP - Sistema de Administración y Monitoreo', 'Nombre de la empresa', 'string', 'empresa'),
        ('empresa_nit', '900123456-1', 'NIT de la empresa', 'string', 'empresa'),
        ('empresa_telefono', '601-234-5678', 'Teléfono de la empresa', 'string', 'empresa'),
        ('empresa_email', 'info@samerp.com', 'Email de la empresa', 'string', 'empresa'),
        ('moneda_simbolo', '$', 'Símbolo de la moneda', 'string', 'sistema'),
        ('iva_porcentaje', '19', 'Porcentaje de IVA', 'number', 'sistema')
        ON CONFLICT DO NOTHING;
      `
    });
    console.log('✅ Tabla tbl_configuracion creada');

    console.log('🎉 ¡Todas las tablas han sido creadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createMissingTables();