export const DEV =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000/premind/api"
    : "https://server.prempackaging.com/premind/api";


// export const DEV = "https://server.prempackaging.com/premind/api/";
