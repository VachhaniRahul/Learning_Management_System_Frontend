
// import axios from "axios";
// import { getRefreshToken, isAccessTokenExpired, setAuthUser } from "./auth";
// import { API_BASE_URL } from "./constant";
// import Cookie from 'js-cookie'

// const useAxios = () => {
//     const access_token = Cookie.get('access_token')
//     const refresh_token = Cookie.get('refresh_token')

//     const axiosInstanse = axios.create({
//         baseURL: API_BASE_URL,
//         headers: {
//             Authorization : `Bearer ${access_token}`
//         }
//     })

//     axiosInstanse.interceptors.request.use(async (req) => {
//         if (!isAccessTokenExpired(access_token)){
//             return req;
//         }
//         const response = await getRefreshToken(refresh_token);
//         setAuthUser(response.data.access, refresh_token)
//         req.headers.Authorization = `Bearer ${response.data?.access}`
//         return req;
//     })

//     return axiosInstanse
// }

// export default useAxios




import axios from "axios";
import { getRefreshToken, isAccessTokenExpired, setAuthUser } from "./auth";
import { API_BASE_URL } from "./constant";
import Cookie from "js-cookie";

const useAxios = () => {
  const access_token = Cookie.get("access_token");
  const refresh_token = Cookie.get("refresh_token");

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
  });

  // Only attach token if available
  if (access_token) {
    axiosInstance.defaults.headers.Authorization = `Bearer ${access_token}`;
  }

  // Interceptor to refresh token if expired
  axiosInstance.interceptors.request.use(
    async (req) => {
      // If no tokens, skip refreshing
      if (!access_token || !refresh_token) {
        return req; // unauthenticated request
      }

      if (!isAccessTokenExpired(access_token)) {
        return req; // token still valid
      }

      try {
        const response = await getRefreshToken(refresh_token);
        setAuthUser(response.data.access, refresh_token);
        req.headers.Authorization = `Bearer ${response.data.access}`;
      } catch (error) {
        console.error("Token refresh failed:", error);
        // You can redirect to login here if desired
      }

      return req;
    },
    (error) => Promise.reject(error)
  );

  return axiosInstance;
};

export default useAxios;
