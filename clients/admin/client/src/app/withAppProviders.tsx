import {Provider} from "react-redux";
import routes from "app/configs/routesConfig";
import {StyledEngineProvider} from "@mui/material/styles";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import AppContext from 'app/AppContext';
import store from "./store";

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