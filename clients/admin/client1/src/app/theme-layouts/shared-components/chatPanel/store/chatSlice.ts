// import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
//
// export const getChat = createAsyncThunk(
//     'chatPanel/chat/getChat',
//     async (contactId, { dispatch, getState }) => {
//         const response = await axios.get(`/api/chat/chats/${contactId}`);
//
//         const data = await response.data;
//
//         dispatch(setSelectedContactId(contactId));
//
//         return data;
//     }
// );
//
// export const sendMessage = createAsyncThunk(
//     'chatPanel/chat/sendMessage',
//     async ({ messageText, chatId, contactId }, { dispatch, getState }) => {
//         const response = await axios.post(`/api/chat/chats/${contactId}`, messageText);
//
//         const data = await response.data;
//
//         dispatch(getChats());
//
//         return data;
//     }
// );
//
// const chatSlice = createSlice({
//     name: 'chatPanel/chat',
//     initialState: [],
//     reducers: {
//         removeChat: (state, action) => null,
//     },
//     extraReducers: {
//         [getChat.fulfilled]: (state, action) => action.payload,
//         [sendMessage.fulfilled]: (state, action) => [...state, action.payload],
//         [closeChatPanel]: (state, action) => null,
//     },
// });
//
// export const { removeChat } = chatSlice.actions;
//
// export const selectChat = ({ chatPanel }: any) => chatPanel.chat;
//
// export default chatSlice.reducer;