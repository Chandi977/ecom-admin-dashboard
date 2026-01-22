import { createSlice } from "@reduxjs/toolkit";

// Persist auth payload returned by /signin or /auth/google
export const persistAuth = (payload) => {
    const user = payload?.data?.user || payload?.user;
    const token = payload?.data?.Token || payload?.Token;
    const refreshToken = payload?.data?.RefreshToken || payload?.RefreshToken;

    if (!user || !token) return;

    const name = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
    localStorage.setItem("user", name);
    localStorage.setItem("token", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("role", user?.role || "");
    localStorage.setItem("id", user?._id || "");
};

const AuthenticationSlice = createSlice({
    name: "AuthsSlice",
    initialState: {
        name: "",
        token: "",
        refreshToken: "",
        role: "",
    },
    reducers: {
        setAuth: () => {
            return {
                token: localStorage.getItem("token"),
                name: localStorage.getItem("user"),
            };
        },
    },
});

export const setAuth = AuthenticationSlice.actions;
export const Auth = (state) => state.Auth;
export default AuthenticationSlice.reducer;
