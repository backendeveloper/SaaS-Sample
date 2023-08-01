import {combineReducers} from "@reduxjs/toolkit";
import navigation from './navigationSlice';
import settings from './settingsSlice';
import navbar from './navbarSlice';
import message from './messageSlice';
// import dialog from './dialogSlice';

const masraffReducers = combineReducers({
    navigation,
    settings,
    navbar,
    message,
    // dialog
});

export default masraffReducers;