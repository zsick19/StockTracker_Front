import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: null,
        isAuthenticated: true,
        user: 'TEST',
        userId: '6952bd331482f8927092ddcc',
        isLoading: false
    },
    reducers: {
        setCredentials: (state, action) =>
        {
            state.token = action.payload.token
            state.isAuthenticated = true
            state.user = action.payload.user
        },
        logout: (state) =>
        {
            state.token = null
            state.isAuthenticated = false
            state.user = null
        },
        setLoading: (state, action) =>
        {
            state.isLoading = action.payload;
        }
    }
})

export const { setCredentials, logout, setLoading } = authSlice.actions

export default authSlice.reducer

export const selectCurrentUser = (state) => state.auth