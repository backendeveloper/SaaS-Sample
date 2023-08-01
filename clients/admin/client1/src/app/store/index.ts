import { configureStore } from '@reduxjs/toolkit';
import createReducer from './rootReducer';
import {setupListeners} from "@reduxjs/toolkit/query";

// if (process.env.NODE_ENV === 'development' && module.hot) {
//     module.hot.accept('./rootReducer', () => {
//         const newRootReducer = require('./rootReducer').default;
//         store.replaceReducer(newRootReducer.createReducer());
//     });
// }

const middlewares: any[] = [];

// if (process.env.NODE_ENV === 'development') {
//     const { createLogger } = require(`redux-logger`);
//     const logger = createLogger({ collapsed: (getState, action, logEntry) => !logEntry.error });
//
//     middlewares.push(logger);
// }

const store = configureStore({
    reducer: createReducer(),
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            immutableCheck: false,
            serializableCheck: false,
        }).concat(middlewares),
    devTools: true // process.env.NODE_ENV === 'development',
});

// @ts-ignore
store.asyncReducers = {};

setupListeners(store.dispatch);

export const injectReducer = (key: any, reducer: any) => {

    // @ts-ignore
    if (store.asyncReducers[key]) {
        return false;
    }

    // @ts-ignore
    store.asyncReducers[key] = reducer;
    // @ts-ignore
    store.replaceReducer(createReducer(store.asyncReducers));

    return store;
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
