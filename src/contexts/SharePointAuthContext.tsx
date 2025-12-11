import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { msalConfig, loginRequest } from '@/lib/msalConfig';
import { sharePointClient } from '@/lib/sharepoint';
import { usuariosService } from '@/lib/sharepoint-services';
import { MODULES, PERMISSION_LEVELS } from '@/lib/sharepoint-mappings';

interface User {
  id: string;
  email: string;
  nombre: string;
  rol_id: number;
  rol_nombre: string;
  activo: boolean;
  permisos: { [module: string]: string }; // module -> permission level
}

interface SharePointAuthContextType {
  user: User | null;
  login: () => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (module: string, level: string) => boolean;
  canRead: (module: string) => boolean;
  canCollaborate: (module: string) => boolean;
  canAdministrate: (module: string) => boolean;
  account: AccountInfo | null;
}

const SharePointAuthContext = createContext<SharePointAuthContextType | undefined>(undefined);

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

export function SharePointAuthProvider({ children }: { children: ReactNode }) {
  return (
    <MsalProvider instance={msalInstance}>
      <SharePointAuthProviderInner>
        {children}
      </SharePointAuthProviderInner>
    </MsalProvider>
  );
}

function SharePointAuthProviderInner({ children }: { children: ReactNode }) {
  const { instance, accounts } = useMsal();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    if (accounts.length > 0) {
      loadUserData(accounts[0]);
    } else {
      setIsLoading(false);
    }
  }, [accounts]);

  const loadUserData = async (account: AccountInfo) => {
    try {
      setIsLoading(true);
      
      // Initialize SharePoint connection
      await sharePointClient.initializeSite();
      
      // Try to find user in SharePoint Users list
      const existingUser = await usuariosService.getUsuarioByEmail(account.username);

      if (existingUser) {
        // Get user role
        const roles = await usuariosService.getRoles();
        const userRole = roles.find(role => role.id === existingUser.rol_id);
        
        // Get permissions for the role
        const rolePermisos = await usuariosService.getRolPermisos(existingUser.rol_id.toString());
        const permisos = await usuariosService.getPermisos();
        
        // Build permissions object
        const userPermisos: { [module: string]: string } = {};
        
        rolePermisos.forEach(rp => {
          const permiso = permisos.find(p => p.id === rp.permiso_id);
          if (permiso) {
            userPermisos[permiso.modulo] = permiso.nivel;
          }
        });

        const userSession: User = {
          id: existingUser.id,
          email: existingUser.email,
          nombre: existingUser.nombre || account.name || account.username,
          rol_id: existingUser.rol_id,
          rol_nombre: userRole?.nombre || 'Usuario',
          activo: existingUser.activo,
          permisos: userPermisos
        };

        setUser(userSession);
      } else {
        // Create new user with basic permissions
        const newUser = {
          email: account.username,
          nombre: account.name || account.username,
          rol_id: 3, // Default role
          activo: true
        };

        await usuariosService.createUsuario(newUser);
        
        // Reload user data
        await loadUserData(account);
      }
    } catch (error) {
      console.error('Error loading user data from SharePoint:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await instance.loginPopup(loginRequest);
      
      if (response.account) {
        await loadUserData(response.account);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    instance.logoutPopup();
    setUser(null);
  };

  const hasPermission = (module: string, level: string): boolean => {
    if (!user || !user.permisos) return false;
    
    // Super admin has full access
    if (user.rol_id === 1) return true;
    
    const userPermissionLevel = user.permisos[module];
    if (!userPermissionLevel) return false;
    
    // Check permission hierarchy
    switch (level) {
      case PERMISSION_LEVELS.LECTURA:
        return [PERMISSION_LEVELS.LECTURA, PERMISSION_LEVELS.COLABORACION, PERMISSION_LEVELS.ADMINISTRACION].includes(userPermissionLevel);
      case PERMISSION_LEVELS.COLABORACION:
        return [PERMISSION_LEVELS.COLABORACION, PERMISSION_LEVELS.ADMINISTRACION].includes(userPermissionLevel);
      case PERMISSION_LEVELS.ADMINISTRACION:
        return userPermissionLevel === PERMISSION_LEVELS.ADMINISTRACION;
      default:
        return false;
    }
  };

  const canRead = (module: string): boolean => hasPermission(module, PERMISSION_LEVELS.LECTURA);
  const canCollaborate = (module: string): boolean => hasPermission(module, PERMISSION_LEVELS.COLABORACION);
  const canAdministrate = (module: string): boolean => hasPermission(module, PERMISSION_LEVELS.ADMINISTRACION);

  return (
    <SharePointAuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      hasPermission,
      canRead,
      canCollaborate,
      canAdministrate,
      account: accounts.length > 0 ? accounts[0] : null
    }}>
      {children}
    </SharePointAuthContext.Provider>
  );
}

export function useSharePointAuth() {
  const context = useContext(SharePointAuthContext);
  if (context === undefined) {
    throw new Error('useSharePointAuth must be used within a SharePointAuthProvider');
  }
  return context;
}