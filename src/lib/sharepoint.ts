import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client';
import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { msalConfig, loginRequest } from './msalConfig';

// Custom authentication provider for Microsoft Graph
class MsalAuthProvider implements AuthenticationProvider {
  private msalInstance: PublicClientApplication;

  constructor() {
    this.msalInstance = new PublicClientApplication(msalConfig);
  }

  async getAccessToken(): Promise<string> {
    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      throw new Error('No authenticated user found');
    }

    try {
      const response = await this.msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0]
      });
      return response.accessToken;
    } catch (error) {
      console.error('Silent token acquisition failed:', error);
      // If silent token acquisition fails, try interactive
      try {
        const response = await this.msalInstance.acquireTokenPopup(loginRequest);
        return response.accessToken;
      } catch (interactiveError) {
        console.error('Interactive token acquisition failed:', interactiveError);
        throw new Error('Failed to acquire access token');
      }
    }
  }
}

class SharePointClient {
  private graphClient: Client;
  private siteId: string = '';
  private authProvider: MsalAuthProvider;

  constructor() {
    this.authProvider = new MsalAuthProvider();
    this.graphClient = Client.initWithMiddleware({
      authProvider: this.authProvider
    });
  }

  async initializeSite() {
    try {
      // Get site information
      const hostname = 'seguryservicios.sharepoint.com';
      const sitePath = '/';
      
      const site = await this.graphClient
        .api(`/sites/${hostname}:${sitePath}`)
        .get();
      
      this.siteId = site.id;
      console.log('SharePoint site initialized:', site.displayName);
      return site;
    } catch (error) {
      console.error('Error initializing SharePoint site:', error);
      throw error;
    }
  }

  async getListItems(listName: string, select?: string, filter?: string): Promise<SharePointListItem[]> {
    try {
      if (!this.siteId) {
        await this.initializeSite();
      }

      let query = this.graphClient.api(`/sites/${this.siteId}/lists/${listName}/items`);
      
      if (select) {
        query = query.select(select);
      }
      
      if (filter) {
        query = query.filter(filter);
      }

      const response = await query.expand('fields').get();
      return response.value || [];
    } catch (error) {
      console.error(`Error getting list items from ${listName}:`, error);
      throw error;
    }
  }

  async createListItem(listName: string, fields: Record<string, unknown>): Promise<SharePointListItem> {
    try {
      if (!this.siteId) {
        await this.initializeSite();
      }

      const response = await this.graphClient
        .api(`/sites/${this.siteId}/lists/${listName}/items`)
        .post({
          fields: fields
        });

      return response;
    } catch (error) {
      console.error(`Error creating item in ${listName}:`, error);
      throw error;
    }
  }

  async updateListItem(listName: string, itemId: string, fields: Record<string, unknown>): Promise<SharePointListItem> {
    try {
      if (!this.siteId) {
        await this.initializeSite();
      }

      const response = await this.graphClient
        .api(`/sites/${this.siteId}/lists/${listName}/items/${itemId}/fields`)
        .patch(fields);

      return response;
    } catch (error) {
      console.error(`Error updating item in ${listName}:`, error);
      throw error;
    }
  }

  async deleteListItem(listName: string, itemId: string): Promise<void> {
    try {
      if (!this.siteId) {
        await this.initializeSite();
      }

      await this.graphClient
        .api(`/sites/${this.siteId}/lists/${listName}/items/${itemId}`)
        .delete();
    } catch (error) {
      console.error(`Error deleting item from ${listName}:`, error);
      throw error;
    }
  }

  async uploadFile(libraryName: string, fileName: string, fileContent: Blob): Promise<DriveItem> {
    try {
      if (!this.siteId) {
        await this.initializeSite();
      }

      const response = await this.graphClient
        .api(`/sites/${this.siteId}/drive/root:/${libraryName}/${fileName}:/content`)
        .put(fileContent);

      return response;
    } catch (error) {
      console.error(`Error uploading file to ${libraryName}:`, error);
      throw error;
    }
  }
}

// Types
interface SharePointListItem {
  id: string;
  fields: Record<string, unknown>;
  [key: string]: unknown;
}

interface DriveItem {
  id: string;
  name: string;
  webUrl: string;
  [key: string]: unknown;
}

// Export singleton instance
export const sharePointClient = new SharePointClient();

// Export function to check connection
export async function checkSharePointConnection(): Promise<{ success: boolean; message: string }> {
  try {
    await sharePointClient.initializeSite();
    return { success: true, message: 'Conexión exitosa con SharePoint' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, message: `Error de conexión: ${errorMessage}` };
  }
}