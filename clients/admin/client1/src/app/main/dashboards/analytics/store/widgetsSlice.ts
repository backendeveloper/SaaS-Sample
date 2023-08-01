import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {setUser, updateUserSettings, updateUserShortcuts} from "app/store/userSlice";
// import axios from 'axios';

export const getWidgets = createAsyncThunk('analyticsDashboardApp/widgets/getWidgets', async () => {
    // const response = await axios.get('/api/dashboards/analytics/widgets');
    //
    // const data = await response.data;

    // return data;
    return null;
});

const widgetsSlice = createSlice({
    name: 'analyticsDashboardApp/widgets',
    initialState: null,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getWidgets.fulfilled, (state, action) => action.payload)
    }
});

export const selectWidgets = ({ analyticsDashboardApp }: any) => analyticsDashboardApp.widgets;

export default widgetsSlice.reducer;
