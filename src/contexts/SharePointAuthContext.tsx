import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { msalConfig, loginRequest } from '@/lib/msalConfig';
import { sharePointClient } from '@/lib/sharepoint';
import { MODULES, ACTIONS } from '@/lib/permissions';

interface User {
  id: string;
  email: string;
  nombre: string;
  rol_id: number;
  rol_nombre: string;
  activo: boolean;
  permisos: string[];
}

interface SharePointAuthContextType {
  user: User | null;
  login: () => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (module: string, action: string) => boolean;
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
      // This assumes you have a "Users" or "Usuarios" list in SharePoint
      const users = await sharePointClient.getListItems(
        'Usuarios', 
        'fields/id,fields/email,fields/nombre,fields/rol_id,fields/activo',
        `fields/email eq '${account.username}'`
      );

      if (users.length > 0) {
        const userData = users[0].fields;
        
        // Get user role and permissions from SharePoint
        const roles = await sharePointClient.getListItems(
          'Roles',
          'fields/id,fields/nombre',
          `fields/id eq ${userData.rol_id}`
        );

        const roleName = roles.length > 0 ? roles[0].fields.nombre : 'Usuario';

        // Get permissions for the role
        const rolePermisos = await sharePointClient.getListItems(
          'RolPermisos',
          'fields/permiso_id',
          `fields/rol_id eq ${userData.rol_id}`
        );

        const permisoIds = rolePermisos.map(rp => rp.fields.permiso_id);
        
        let userPermisos: string[] = [];
        if (permisoIds.length > 0) {
          const permisos = await sharePointClient.getListItems(
            'Permisos',
            'fields/modulo,fields/accion',
            `fields/id in (${permisoIds.join(',')})`
          );
          
          userPermisos = permisos.map(p => `${p.fields.modulo}.${p.fields.accion}`);
        }

        const userSession: User = {
          id: userData.id,
          email: userData.email,
          nombre: userData.nombre || account.name || account.username,
          rol_id: userData.rol_id,
          rol_nombre: roleName,
          activo: userData.activo,
          permisos: userPermisos
        };

        setUser(userSession);
      } else {
        // Create new user in SharePoint if not exists
        const newUser = {
          email: account.username,
          nombre: account.name || account.username,
          rol_id: 3, // Default to "Operador" role
          activo: true
        };

        await sharePointClient.createListItem('Usuarios', newUser);
        
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

  const hasPermission = (module: string, action: string): boolean => {
    if (!user || !user.permisos) return false;
    
    // Administrators have full access
    if (user.rol_id === 1) return true;
    
    // Check specific permission
    return user.permisos.includes(`${module}.${action}`);
  };

  return (
    <SharePointAuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      hasPermission,
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