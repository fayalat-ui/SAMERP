import { Configuration, PopupRequest } from '@azure/msal-browser';

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '4523a41a-818e-4d92-8775-1ccf155e7327',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || '6b462c35-c003-4f5f-a3f5-0e8a734c0f3c'}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case 1: // Error
            console.error(message);
            return;
          case 2: // Warning
            console.warn(message);
            return;
          case 3: // Info
            console.info(message);
            return;
          case 4: // Verbose
            console.debug(message);
            return;
          default:
            return;
        }
      }
    }
  }
};

// Add here scopes for id token to be used at MS Identity Platform endpoints.
export const loginRequest: PopupRequest = {
  scopes: [
    'User.Read',
    'Sites.Read.All',
    'Sites.ReadWrite.All',
    'Files.ReadWrite.All'
  ],
  prompt: 'select_account'
};

// Add here the endpoints for MS Graph API services you would like to use.
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphSitesEndpoint: 'https://graph.microsoft.com/v1.0/sites'
};