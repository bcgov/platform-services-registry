const msalConfig = {
  auth: {
    clientId: "5afdfc62-637b-41cf-b186-b2de816faaf9",
    authority:
      "https://login.microsoftonline.com/6fdb5200-3d0d-4a8a-b036-d3685e359adc", // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
    clientSecret: process.env.MS_GRAPH_API_CLIENT_SECRET,
  },
};

export default msalConfig;
