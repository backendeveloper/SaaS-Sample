'use client';

import AppContext from './AppContext';
import {Provider} from "react-redux";
import store from "@/app/store";
import {StyledEngineProvider} from "@mui/material/styles";
import routes from "app/configs/routesConfig";
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";

const withAppProviders = (Component: any) => (props: any) => {
    return () => (
        <AppContext.Provider
            value={{
                routes,
            }}
        >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Provider store={store}>
                    <StyledEngineProvider injectFirst>
                        <Component {...props} />
                    </StyledEngineProvider>
                </Provider>
            </LocalizationProvider>
        </AppContext.Provider>
    );
};

export default withAppProviders;
