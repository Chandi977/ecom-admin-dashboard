import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
    name: "utilitySlice",
    initialState: {
        isLoading: false,
        isLoadingComponent: false,
    },
    reducers: {
        LOADING_SUCCESS: (state, action) => {
            return {
                ...state,
                isLoading: action.payload,
                isLoadingComponent: action.payload,
            };
        },
    },
});

export const { LOADING_SUCCESS } = slice.actions;
export default slice.reducer;
