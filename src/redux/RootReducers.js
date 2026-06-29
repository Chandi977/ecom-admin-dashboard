import { combineReducers } from "@reduxjs/toolkit";
import utilitySlice from "./slices/utilitySlice"
import AuthenticationSlice from "./authSlice"

export default combineReducers({
    utilitySlice,
    AuthenticationSlice
})