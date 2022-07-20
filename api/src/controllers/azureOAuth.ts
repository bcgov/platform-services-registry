import axios from "axios";
import { logger } from "@bcgov/common-nodejs-utils";

export const fetchAzureAccessToken = async () => {
  logger.info("reached azure token endpoint");
  const options = {
    Host: "login.microsoftonline.com",
    // client_id: process.env.AZURE_CLIENT_ID,
    client_id: process.env.AZURE_CLIENT_ID,
    scope: "https://graph.microsoft.com/.default",
    // client_secret: process.env.AZURE_CLIENT_SECRET,
    client_secret: process.env.AZURE_CLIENT_SECRET,
    grant_type: "client_credentials",
  };
  await axios
    .post(
      `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}}/oauth2/v2.0/token`,
      options
    )
    .then((response) => {
      return response;
    })
    .catch((error) => {
      logger.error(error);
      return error;
    });
  return "something went wrong";
};

export default fetchAzureAccessToken;
