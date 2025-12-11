import { Configuration, PopupRequest } from '@azure/msal-browser';

// MSAL Configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}`,
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

// Add scopes for SharePoint and Graph API
export const loginRequest: PopupRequest = {
  scopes: [
    'User.Read',
    'Sites.Read.All',
    'Sites.ReadWrite.All',
    'Files.ReadWrite.All'
  ],
};

export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphSitesEndpoint: 'https://graph.microsoft.com/v1.0/sites',
};