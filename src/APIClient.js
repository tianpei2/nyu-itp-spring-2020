import Cookies from "js-cookie";
import axios from "axios";

export const tokenCookieKey = "foursquare_oauth_token";

const foursquare = axios.create({
  baseURL: "https://api.foursquare.com/v2/",
});

foursquare.interceptors.request.use((config) => {
  config.params = config.params || {};
  config.params.oauth_token = Cookies.get(tokenCookieKey);
  config.params.v = process.env.REACT_APP_FOURSQUARE_API_VERSION;
  return config;
});

foursquare.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response.data.response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (!error.config.ejectErrorAlert) {
      let message = error.message;
      const response = error.response;
      if (response) message = `${message}: ${response.data.meta.errorDetail}`;
      window.setAlert({ severity: "error", message });
    }
    return Promise.reject(error);
  }
);

foursquare.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";

foursquare.getUserAudios = async (userId) => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const resp = await foursquare.get("demo/marsbot/audio/snippetuser", {
    params: {
      userId,
      tz: tz,
    },
  });
  return resp.audio;
};

export default foursquare;
