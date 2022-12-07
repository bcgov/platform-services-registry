/* this is used by the (hopefully silent) OAuth flow to get a token to access Microsoft Graph's API assigning contacts 
to project requests. It should not require editing. You can find the Azure project, where the Tenant and Client IDs are
defined, here: https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/5afdfc62-637b-41cf-b186-b2de816faaf9/isMSAApp~/false
or look for 'Platform Services Registry' on BC Gov's Azure environment. */

export const msalConfig = {
  auth: {
    clientId: '5afdfc62-637b-41cf-b186-b2de816faaf9',
    authority: 'https://login.microsoftonline.com/6fdb5200-3d0d-4a8a-b036-d3685e359adc', // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
    redirectUri: '/',
  },
  cache: {
    cacheLocation: 'sessionStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to 'true' if you are having issues on IE11 or Edge
  },
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
  scopes: ['User.ReadBasic.All'],
};
