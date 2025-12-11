# SAM ERP - Guía de Despliegue en Netlify

## 🚀 Despliegue Automático

### Paso 1: Conectar con Netlify
1. Ve a [netlify.com](https://netlify.com) e inicia sesión
2. Haz clic en "New site from Git"
3. Conecta tu repositorio de GitHub/GitLab
4. Selecciona la rama `main` o `master`

### Paso 2: Configuración de Build
- **Build command**: `pnpm run build`
- **Publish directory**: `dist`
- **Node version**: `18`

### Paso 3: Variables de Entorno (CRÍTICO)
En Netlify Dashboard → Site Settings → Environment Variables, añade:

```
VITE_AZURE_CLIENT_ID=4523a41a-818e-4d92-8775-1ccf155e7327
VITE_AZURE_TENANT_ID=2f7e4660-def9-427d-9c23-603e4e4dae55
VITE_REDIRECT_URI=https://tu-sitio.netlify.app
VITE_SHAREPOINT_SITE_URL=https://seguryservicios.sharepoint.com
VITE_SHAREPOINT_SITE_ID=/sites/root
```

### Paso 4: Configurar Azure AD
En Azure Portal → App Registrations → tu app:

1. **Redirect URIs**: Añadir `https://tu-sitio.netlify.app`
2. **Implicit grant**: Habilitar "Access tokens" y "ID tokens"
3. **API permissions**: Verificar permisos de Microsoft Graph:
   - User.Read
   - Sites.Read.All
   - Sites.ReadWrite.All
   - Files.ReadWrite.All

## 🔧 Verificación Post-Despliegue

### Checklist de Funcionalidad
- [ ] Login con Azure AD funciona
- [ ] Conexión a SharePoint exitosa
- [ ] Carga de datos desde listas SharePoint
- [ ] Permisos por módulo funcionando
- [ ] CRUD operations en todas las listas

### URLs de Prueba
- `/login` - Página de autenticación
- `/test-sharepoint` - Verificar conexión SharePoint
- `/trabajadores` - Módulo RR.HH
- `/mandantes` - Módulo Administradores
- `/servicios` - Módulo OSP

## 🛠️ Troubleshooting

### Error: CORS
Si aparecen errores CORS, verificar:
1. Redirect URI en Azure AD
2. Content Security Policy en netlify.toml
3. Permisos de SharePoint

### Error: Authentication
1. Verificar variables de entorno en Netlify
2. Comprobar Tenant ID y Client ID
3. Revisar permisos de Azure AD

### Error: SharePoint Access
1. Verificar permisos de Microsoft Graph
2. Comprobar URL del sitio SharePoint
3. Validar nombres de listas SharePoint

## 📋 Listas SharePoint Requeridas

El sistema espera estas listas en SharePoint:
- `Tbl_Mandantes` (Módulo Administradores)
- `TBL_PRESUPUESTO` (Módulo Administradores)
- `TBL_JORNADAS` (Módulo RR.HH)
- `TBL_TRABAJADORES` (Módulo RR.HH)
- `SOLICITUD_CONTRATOS` (Módulo RR.HH)
- `TBL_VACACIONES` (Módulo RR.HH)
- `TBL_SERVICIOS` (Módulo OSP)
- `TBL_REGISTRO_CURSO_OS10` (Módulo OSP)
- `TBL_DIRECTIVAS` (Módulo OSP)

## 🔐 Seguridad

- Todas las variables de entorno están configuradas como `VITE_*` para el frontend
- Azure AD maneja la autenticación
- SharePoint controla el acceso a datos
- Permisos granulares por módulo implementados