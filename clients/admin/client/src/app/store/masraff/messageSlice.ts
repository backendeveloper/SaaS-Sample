import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    state: null,
    options: {
        anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
        },
        autoHideDuration: 2000,
        message: 'Hi',
        variant: null,
    },
};
const messageSlice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        showMessage: (state: any, action: any) => {
            state.state = true;
            state.options = {
                ...initialState.options,
                ...action.payload,
            };
        },
        hideMessage: (state, action) => {
            state.state = null;
        },
    },
});

export const { hideMessage, showMessage }: any = messageSlice.actions;

export const selectMasraffMessageState = ({ masraff }: any) => masraff.message.state;

export const selectMasraffMessageOptions = ({ masraff }: any) => masraff.message.options;

export default messageSlice.reducer;