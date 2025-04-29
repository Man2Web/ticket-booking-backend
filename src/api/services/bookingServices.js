const axios = require("axios");
const qs = require("qs");

const getAuthToken = async () => {
  const url = process.env.AUTH_TOKEN_URL;
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const data = qs.stringify({
    client_id: clientId,
    client_version: "1",
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });
  try {
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const authToken = response.data.access_token;
    return authToken;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get Auth Token");
  }
};

const initiate = async (
  authToken,
  transactionId,
  amount,
  event,
  eventTicket
) => {
  const paymentUrl = process.env.PAYMENT_URL;
  const serverUrl = process.env.URL;
  try {
    const data = JSON.stringify({
      merchantOrderId: transactionId,
      amount: 100,
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: "MN JEWEL PAYMENT",
        merchantUrls: {
          redirectUrl: `${serverUrl}/events/${event.eventId}/${eventTicket.eventTicketId}/booking/validate/${transactionId}`,
        },
      },
    });
    const response = await axios.post(paymentUrl, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to initiate payment");
  }
};

const status = async (transactionId) => {
  const statusUrl = process.env.STATUS_URL;
  const authToken = await getAuthToken();
  try {
    const response = await axios.get(`${statusUrl}/${transactionId}/status`, {
      params: {
        details: false,
      },
      headers: {
        Authorization: `O-Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error.response.data);
    throw new Error("Failed to get Payment Status");
  }
};

module.exports = { getAuthToken, initiate, status };
