import { ConfidentialClientApplication } from "@azure/msal-node";
import fetch from "node-fetch";
import msalConfig from "./config.js";

let msalInstance;

export async function getAccessToken() {
  const request = {
    scopes: ["https://graph.microsoft.com/.default"],
  };
  
  try {
    if(!msalInstance){
      msalInstance = new ConfidentialClientApplication(msalConfig);
    }

    const response = await msalInstance.acquireTokenByClientCredential(request);
    return response.accessToken;
  } catch (error) {
    console.error(error);
    throw new Error("Error acquiring access token");
  }
}

export async function callMsGraph(endpoint, accessToken, options = {}) {
  const headers = new fetch.Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append("Authorization", bearer);
  headers.append("ConsistencyLevel", "eventual");

  const defaultOptions = {
    method: "GET",
    headers: headers,
  };

  return fetch(endpoint, { ...defaultOptions, ...options });
}
