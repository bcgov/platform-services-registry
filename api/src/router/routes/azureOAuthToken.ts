import { asyncMiddleware } from "@bcgov/common-nodejs-utils";
import express from "express";
import { fetchAzureAccessToken } from "../../controllers/azureOAuth";
// import { authorize, validateRequiredProfile } from "../../libs/authorization";

const router = express.Router();

// Requests
router.get(
  "/",

  asyncMiddleware(fetchAzureAccessToken)
);

export default router;
