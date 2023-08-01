import { combineReducers } from '@reduxjs/toolkit';
import masraff from './masraff';
import i18n from './i18nSlice';
import user from './userSlice';

const createReducer = (asyncReducers?: any) => {
    return (state: any, action: any): any => {
        const combinedReducer = combineReducers({
            masraff,
            i18n,
            user,
            ...asyncReducers,
        });

        /*
          Reset the redux store when user logged out
           */
        if (action.type === 'user/userLoggedOut') {
            // state = undefined;
        }

        // @ts-ignore
        return combinedReducer(state, action);
    };
};

export default createReducer;
