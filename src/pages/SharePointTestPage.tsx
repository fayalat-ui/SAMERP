import { SharePointConnectionTest } from '@/components/SharePointConnectionTest';

export default function SharePointTestPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Prueba de Conexión SharePoint</h1>
        <p className="text-gray-600 mt-2">
          Verifica que el SAM ERP se conecte correctamente a SharePoint y pueda acceder a todas las listas.
        </p>
      </div>
      
      <SharePointConnectionTest />
    </div>
  );
}