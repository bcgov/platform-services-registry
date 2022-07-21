import axios from "axios";
import { logger } from "@bcgov/common-nodejs-utils";
import { Response } from "express";
import qs from "qs";

export const fetchAzureAccessToken = async (
  // { body }: { body: any },
  res: Response
): Promise<void> => {
  logger.info("reached azure token endpoint");
  const options = {
    Host: "login.microsoftonline.com",
    client_id: `${process.env.AZURE_CLIENT_ID}`,
    scope: "https://graph.microsoft.com/.default",
    client_secret: process.env.AZURE_CLIENT_SECRET,
    grant_type: "client_credentials",
  };
  await axios
    .post(
      `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
      qs.stringify(options)
    )
    .then((response) => {
      logger.info("response.data: ", response.data);
      res.status(200).json(response.data);
    })
    .catch((error) => {
      logger.error(error);
      throw error;
    });
};

export default fetchAzureAccessToken;
