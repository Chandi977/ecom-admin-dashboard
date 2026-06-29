let baseURL = process.env.NODE_ENV === "staging" ? process.env.REACT_APP_BASE_URL_DEV_AR : process.env.REACT_APP_BASE_URL_LIVE;
console.log('base URL - ', baseURL)
export { baseURL };
