import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import settingsConfig from "app/configs/settingsConfig";
import history from '@history';
import _ from "@lodash";
import {setInitialSettings} from "app/store/masraff/settingsSlice";

export const setUser = createAsyncThunk(
    'user/setUser',
    async (user: any, {dispatch, getState}: any) => {
        /*
          You can redirect the logged-in user to a specific route depending on his role
          */
        if (user.loginRedirectUrl) {
            settingsConfig.loginRedirectUrl = user.loginRedirectUrl; // for example '/apps/academy'
        }

        return user;
    });

export const updateUserSettings = createAsyncThunk(
    'user/updateSettings',
    async (settings: any, {dispatch, getState}: any) => {
        const {user}: any = getState();
        const newUser = _.merge({}, user, {data: {settings}});

        dispatch(updateUserData(newUser));

        return newUser;
    }
);

export const updateUserShortcuts = createAsyncThunk(
    'user/updateShortucts',
    async (shortcuts, {dispatch, getState}) => {
        const {user}: any = getState();
        const newUser = {
            ...user,
            data: {
                ...user.data,
                shortcuts,
            },
        };

        dispatch(updateUserData(newUser));

        return newUser;
    }
);

export const logoutUser = async () => async (dispatch: any, getState: any) => {
    const {user} = getState();

    if (!user.role || user.role.length === 0) {
        // is guest
        return null;
    }

    history.push({
        pathname: '/',
    });

    await dispatch(setInitialSettings());

    return await dispatch(userLoggedOut());
};

export const updateUserData = (user: any) => async (dispatch: any, getState: any) => {
    if (!user.role || user.role.length === 0) {
        // is guest
        return;
    }

    // TODO: degisecek
    // jwtService
    //     .updateUserData(user)
    //     .then(() => {
    //         dispatch(showMessage({ message: 'User data saved with api' }));
    //     })
    //     .catch((error) => {
    //         dispatch(showMessage({ message: error.message }));
    //     });
};

const initialState = {
    role: [], // guest
    data: {
        displayName: 'John Doe',
        photoURL: 'assets/images/avatars/brian-hughes.jpg',
        email: 'johndoe@withinpixels.com',
        shortcuts: ['apps.calendar', 'apps.mailbox', 'apps.contacts', 'apps.tasks'],
    },
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        userLoggedOut: (state, action) => initialState,
    },
    extraReducers: builder => {
        builder
            .addCase(updateUserSettings.fulfilled, (state, action) => action.payload)
            .addCase(updateUserShortcuts.fulfilled, (state, action) => action.payload)
            .addCase(setUser.fulfilled, (state, action): any => action.payload)
    }
});

export const {userLoggedOut}: any = userSlice.actions;

export const selectUser = ({user}: any) => user;

export const selectUserShortcuts = ({user}: any) => user.data.shortcuts;

export default userSlice.reducer;