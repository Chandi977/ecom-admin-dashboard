import { createSlice } from "@reduxjs/toolkit";

export const AuthSlice = async (userData) => {
    const name = `${userData?.user?.first_name}  ${userData?.user?.last_name}`;
    localStorage.setItem("user", name);
    localStorage.setItem("token", userData?.Token);
    localStorage.setItem("refreshToken", userData?.RefreshToken);
    localStorage.setItem("role", userData?.user?.role);
    localStorage.setItem("id", userData?.user?._id);
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
