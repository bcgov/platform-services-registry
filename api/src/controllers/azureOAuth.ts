import axios from "axios";
import { logger } from "@bcgov/common-nodejs-utils";
// import { Response } from "express";
import qs from "qs";
import { Request, Response } from "express";

export const fetchAzureAccessToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const options = {
      Host: "login.microsoftonline.com",
      client_id: `${process.env.AZURE_CLIENT_ID}`,
      scope: "https://graph.microsoft.com/.default",
      client_secret: process.env.AZURE_CLIENT_SECRET,
      grant_type: "client_credentials",
    };
    const url: string = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`;
    axios
      .post(url, qs.stringify(options))
      .then((response) => {
        if (!response.data.access_token) {
          throw Error(
            "a result was returned from Microsoft's token endpoint, but it doesn't seem to have an access token included"
          );
        }
        res.status(200).json(response.data.access_token);
      })
      .catch((error) => {
        logger.info(`error: ${error}`);
        res.status(500);
      });
  } catch (err) {
    logger.error(`err = ${err.message}`);
  }
};

export default fetchAzureAccessToken;
