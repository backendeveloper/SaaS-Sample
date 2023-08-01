import React from 'react';
import createCache from "@emotion/cache";
import {CacheProvider} from "@emotion/react";
import {useSelector} from "react-redux";
import {SnackbarProvider} from 'notistack';
import rtlPlugin from 'stylis-plugin-rtl';
import MasraffTheme from "@masraff/core/MassraffTheme";
import BrowserRouter from "@masraff/core/BrowserRouter";
import MasraffLayout from "@masraff/core/MasraffLayout";
import {selectCurrentLanguageDirection} from "app/store/i18nSlice";
import {selectMainTheme} from "app/store/masraff/settingsSlice";
import themeLayouts from "app/theme-layouts/themeLayouts";
import withAppProviders from "./withAppProviders";
import {AuthProvider} from "./auth/AuthContext";
import {settingsConfig} from "app/configs/index";
import {selectUser} from "app/store/userSlice";
import MasraffAuthorization from "@masraff/core/MasraffAuthorization";

const emotionCacheOptions: any = {
    rtl: {
        key: 'muirtl',
        stylisPlugins: [rtlPlugin],
        insertionPoint: document.getElementById('emotion-insertion-point'),
    },
    ltr: {
        key: 'muiltr',
        stylisPlugins: [],
        insertionPoint: document.getElementById('emotion-insertion-point'),
    },
};

const App = () => {
    const user = useSelector(selectUser);
    const langDirection = useSelector(selectCurrentLanguageDirection);
    const mainTheme = useSelector(selectMainTheme);

    return (
        <CacheProvider value={createCache(emotionCacheOptions[langDirection])}>
            <MasraffTheme theme={mainTheme} direction={langDirection}>
                <AuthProvider>
                    <BrowserRouter>
                        <MasraffAuthorization
                            userRole={user.role}
                            loginRedirectUrl={settingsConfig.loginRedirectUrl}
                        >
                            <SnackbarProvider
                                maxSnack={5}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                classes={{
                                    containerRoot: 'bottom-0 right-0 mb-52 md:mb-68 mr-8 lg:mr-80 z-99',
                                }}
                            >
                                <MasraffLayout layouts={themeLayouts}/>
                            </SnackbarProvider>
                        </MasraffAuthorization>
                    </BrowserRouter>
                </AuthProvider>
            </MasraffTheme>
        </CacheProvider>
    );
};

// @ts-ignore
export default withAppProviders(App)();
