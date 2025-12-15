import { createSlice } from "@reduxjs/toolkit";

const testSlice=createSlice({
    name:'test',
    initialState:{
        test:null
    },
    reducers:{
        setTest:(state,action)=>{
            state.test=action.payload
        },
        clearTest:(state,action)=>{
            state.test=null
        }
    }
})

export const {setTest,clearTest}=testSlice.actions

export default testSlice.reducer