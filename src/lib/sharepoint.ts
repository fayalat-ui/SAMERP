import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client';

// SharePoint API Client
class SharePointAuthProvider implements AuthenticationProvider {
  private accessToken: string | null = null;

  constructor(private clientId: string, private clientSecret: string, private tenantId: string) {}

  async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    
    const params = new URLSearchParams();
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('scope', 'https://graph.microsoft.com/.default');
    params.append('grant_type', 'client_credentials');

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      const data = await response.json();
      this.accessToken = data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }
}

// SharePoint Client Configuration
const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '';
const clientSecret = process.env.AZURE_CLIENT_SECRET || '';
const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID || '';
const siteUrl = process.env.NEXT_PUBLIC_SHAREPOINT_SITE_URL || '';

const authProvider = new SharePointAuthProvider(clientId, clientSecret, tenantId);
const graphClient = Client.initWithMiddleware({ authProvider });

// SharePoint API Functions
export class SharePointClient {
  private static instance: SharePointClient;
  private siteId: string = '';

  private constructor() {}

  static getInstance(): SharePointClient {
    if (!SharePointClient.instance) {
      SharePointClient.instance = new SharePointClient();
    }
    return SharePointClient.instance;
  }

  async initializeSite(): Promise<void> {
    try {
      const site = await graphClient.api(`/sites/${new URL(siteUrl).hostname}:/`).get();
      this.siteId = site.id;
    } catch (error) {
      console.error('Error initializing SharePoint site:', error);
      throw error;
    }
  }

  // Get all lists from SharePoint site
  async getLists(): Promise<any[]> {
    try {
      if (!this.siteId) await this.initializeSite();
      
      const lists = await graphClient.api(`/sites/${this.siteId}/lists`).get();
      return lists.value || [];
    } catch (error) {
      console.error('Error getting SharePoint lists:', error);
      throw error;
    }
  }

  // Get items from a specific list
  async getListItems(listName: string, select?: string, filter?: string): Promise<any[]> {
    try {
      if (!this.siteId) await this.initializeSite();
      
      let query = graphClient.api(`/sites/${this.siteId}/lists/${listName}/items`);
      
      if (select) {
        query = query.select(select);
      }
      
      if (filter) {
        query = query.filter(filter);
      }

      const items = await query.expand('fields').get();
      return items.value || [];
    } catch (error) {
      console.error(`Error getting items from list ${listName}:`, error);
      throw error;
    }
  }

  // Create item in SharePoint list
  async createListItem(listName: string, itemData: any): Promise<any> {
    try {
      if (!this.siteId) await this.initializeSite();
      
      const item = await graphClient
        .api(`/sites/${this.siteId}/lists/${listName}/items`)
        .post({
          fields: itemData
        });
      
      return item;
    } catch (error) {
      console.error(`Error creating item in list ${listName}:`, error);
      throw error;
    }
  }

  // Update item in SharePoint list
  async updateListItem(listName: string, itemId: string, itemData: any): Promise<any> {
    try {
      if (!this.siteId) await this.initializeSite();
      
      const item = await graphClient
        .api(`/sites/${this.siteId}/lists/${listName}/items/${itemId}`)
        .update({
          fields: itemData
        });
      
      return item;
    } catch (error) {
      console.error(`Error updating item in list ${listName}:`, error);
      throw error;
    }
  }

  // Delete item from SharePoint list
  async deleteListItem(listName: string, itemId: string): Promise<void> {
    try {
      if (!this.siteId) await this.initializeSite();
      
      await graphClient
        .api(`/sites/${this.siteId}/lists/${listName}/items/${itemId}`)
        .delete();
    } catch (error) {
      console.error(`Error deleting item from list ${listName}:`, error);
      throw error;
    }
  }

  // Upload file to SharePoint document library
  async uploadFile(libraryName: string, fileName: string, fileContent: ArrayBuffer): Promise<any> {
    try {
      if (!this.siteId) await this.initializeSite();
      
      const file = await graphClient
        .api(`/sites/${this.siteId}/lists/${libraryName}/drive/root:/${fileName}:/content`)
        .put(fileContent);
      
      return file;
    } catch (error) {
      console.error(`Error uploading file to ${libraryName}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const sharePointClient = SharePointClient.getInstance();

// Helper function to check SharePoint connection
export const checkSharePointConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    await sharePointClient.initializeSite();
    const lists = await sharePointClient.getLists();
    return { 
      success: true, 
      message: `Conexión exitosa. Encontradas ${lists.length} listas en SharePoint.` 
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, message: errorMessage };
  }
};