'use client';

import {Provider} from 'react-redux';
import AppContext from './AppContext';
import routes from "app/configs/routesConfig";
import store from "@/app/store/index";
import {StyledEngineProvider} from '@mui/material/styles';
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";

export function Providers({children}: any) {
    return (
        <AppContext.Provider value={{
            routes,
        }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Provider store={store}>
                <StyledEngineProvider injectFirst>
                    {children}
                </StyledEngineProvider>
            </Provider>
            </LocalizationProvider>
        </AppContext.Provider>
    )
}