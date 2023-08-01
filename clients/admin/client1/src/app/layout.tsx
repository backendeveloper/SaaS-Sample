'use client';

import '../styles/app-base.css';
import '../styles/app-components.css';
import '../styles/app-utilities.css';

import React, {ReactNode} from "react";
import { appWithTranslation } from 'next-i18next'
import MasraffLayout from "@masraff/core/MasraffLayout";
import themeLayouts from "app/theme-layouts/themeLayouts";
import MasraffTheme from "@masraff/core/MassraffTheme";
import {useSelector} from "react-redux";
import {selectMainTheme} from "app/store/masraff/settingsSlice";
import withAppProviders from "@/app/withAppProviders";
import { CacheProvider } from '@emotion/react';
// import './i18n';
import createCache from "@emotion/cache";
import rtlPlugin from 'stylis-plugin-rtl';
import {selectCurrentLanguageDirection} from "app/store/i18nSlice";
import {SnackbarProvider} from "notistack";
import {BrowserRouter} from "react-router-dom";

// const emotionCacheOptions = {
//     rtl: {
//         key: 'muirtl',
//         stylisPlugins: [rtlPlugin],
//         insertionPoint: document.getElementById('emotion-insertion-point'),
//     },
//     ltr: {
//         key: 'muiltr',
//         stylisPlugins: [],
//         insertionPoint: document.getElementById('emotion-insertion-point'),
//     },
// };

const RootLayout = ({children}: { children: ReactNode }) => {
    const mainTheme = useSelector(selectMainTheme);
    const langDirection: any = useSelector(selectCurrentLanguageDirection);

    return (
        <html lang="en">
        <head/>
        <body>
        {/*<CacheProvider value={createCache(emotionCacheOptions[langDirection])}>*/}
            <MasraffTheme theme={mainTheme}>
                <BrowserRouter>
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
                        <MasraffLayout layouts={themeLayouts} />
                    </SnackbarProvider>
                </BrowserRouter>
            </MasraffTheme>
        {/*</CacheProvider>*/}
        </body>
        </html>
    )
};

// @ts-ignore
export default appWithTranslation(withAppProviders(RootLayout)());