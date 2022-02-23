import { URLSearchParams } from "url";
import axios from "axios";
import { SELECTEDCOMMUNICATIONS } from "./constants";

const suscribeData = (contactId) => ({
  ContactId: contactId,
  SegmentsAndIds: SELECTEDCOMMUNICATIONS,
});

export const getToken = async () => {
  const keycloakClientSecret =
    process.env.MAUTIC_SUBSSCRIPTION_API_CLIENT_SECRET;
  const url = process.env.MAUTIC_TOKEN_URL || "";

  const params = {
    client_id: "mautic-subscription-api",
    client_secret: keycloakClientSecret,
    grant_type: "client_credentials",
  };

  const urlData = new URLSearchParams(params).toString();

  try {
    const { data } = await axios.post(url, urlData, {
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      withCredentials: true,
    });

    return data.access_token;
  } catch (error) {
    return error.response;
  }
};

export const getContactId = async (email, token) => {
  const mauticSubscriptionUrlBase =
    process.env.MAUTIC_SUBSSCRIPTION_API_URL || "";

  try {
    const { data: segments } = await axios.get(
      `${mauticSubscriptionUrlBase}/segments`,
      {
        headers: {
          Email: email,
          Connection: "keep-alive",
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          Authorization: `bearer ${token}`,
        },
      }
    );

    return segments.contactId;
  } catch (error) {
    return error.response;
  }
};

export const subscribeUserToMautic = async (contactId, token) => {
  const mauticSubscriptionUrlBase =
    process.env.MAUTIC_SUBSSCRIPTION_API_URL || "";

  try {
    const response = await axios.post(
      `${mauticSubscriptionUrlBase}/segments/contact/add`,
      suscribeData(contactId),
      {
        headers: {
          Connection: "keep-alive",
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          Authorization: `bearer ${token}`,
        },
      }
    );

    return response;
  } catch (error) {
    return error.response;
  }
};

export const subscribeUserToMessages = async (email) => {
  try {
    const token = await getToken();
    const contactId = await getContactId(email, token);
    const response = await subscribeUserToMautic(contactId, token);

    return response.status;
  } catch (error) {
    return error.response;
  }
};
