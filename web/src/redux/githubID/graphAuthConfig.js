export const msalConfig = {
    auth: {
      clientId: "5afdfc62-637b-41cf-b186-b2de816faaf9",
      authority: "https://login.microsoftonline.com/6fdb5200-3d0d-4a8a-b036-d3685e359adc", // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
      redirectUri: "/",
    },
    cache: {
      cacheLocation: "sessionStorage", // This configures where your cache will be stored
      storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    }
  };
  
  // Add scopes here for ID token to be used at Microsoft identity platform endpoints.
  export const loginRequest = {
   scopes: ["User.ReadBasic.All"]
  };
  
  // Add the endpoints here for Microsoft Graph API services you'd like to use.
  export const graphConfig = {
      graphMeEndpoint: "https://graph.microsoft.com/v1.0/users/oamar.kanji@gov.bc.ca"
  };
  
  