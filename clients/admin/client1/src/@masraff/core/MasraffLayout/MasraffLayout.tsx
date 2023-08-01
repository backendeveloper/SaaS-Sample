'use client';

import _ from "lodash";
import {
    generateSettings,
    selectMasraffCurrentSettings,
    selectMasraffDefaultSettings,
    setSettings
} from "app/store/masraff/settingsSlice";
import React, {memo, useCallback, useContext, useMemo, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import GlobalStyles from '@mui/material/GlobalStyles';
import {alpha} from '@mui/material/styles';
import AppContext from "app/AppContext";
import useDeepCompareEffect from "@masraff/hooks/useDeepCompareEffect";
import {usePathname} from "next/navigation";
import {matchRoutes} from "react-router-dom";

const inputGlobalStyles = (
    <GlobalStyles
        styles={(theme) => ({
            html: {
                backgroundColor: `${theme.palette.background.default}!important`,
                color: `${theme.palette.text.primary}!important`,
            },
            body: {
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
            },
            /*  'code:not([class*="language-"])': {
              color: theme.palette.secondary.dark,
              backgroundColor:
                theme.palette.mode === 'light' ? 'rgba(255, 255, 255, .9)' : 'rgba(0, 0, 0, .9)',
              padding: '2px 3px',
              borderRadius: 2,
              lineHeight: 1.7,
            }, */
            'table.simple tbody tr th': {
                borderColor: theme.palette.divider,
            },
            'table.simple thead tr th': {
                borderColor: theme.palette.divider,
            },
            'a:not([role=button]):not(.MuiButtonBase-root)': {
                color: theme.palette.secondary.main,
                textDecoration: 'underline',
                '&:hover': {},
            },
            'a.link, a:not([role=button])[target=_blank]': {
                background: alpha(theme.palette.secondary.main, 0.2),
                color: 'inherit',
                borderBottom: `1px solid ${theme.palette.divider}`,
                textDecoration: 'none',
                '&:hover': {
                    background: alpha(theme.palette.secondary.main, 0.3),
                    textDecoration: 'none',
                },
            },
            '[class^="border"]': {
                borderColor: theme.palette.divider,
            },
            '[class*="border"]': {
                borderColor: theme.palette.divider,
            },
            '[class*="divide-"] > :not([hidden]) ~ :not([hidden])': {
                borderColor: theme.palette.divider,
            },
            hr: {
                borderColor: theme.palette.divider,
            },

            '::-webkit-scrollbar-thumb': {
                boxShadow: `inset 0 0 0 20px ${
                    theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.24)' : 'rgba(255, 255, 255, 0.24)'
                }`,
            },
            '::-webkit-scrollbar-thumb:active': {
                boxShadow: `inset 0 0 0 20px ${
                    theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.37)' : 'rgba(255, 255, 255, 0.37)'
                }`,
            },
        })}
    />
);

const MasraffLayout = (props: any) => {
    const {layouts} = props;

    const dispatch = useDispatch();
    const settings = useSelector(selectMasraffCurrentSettings);

    const defaultSettings = useSelector(selectMasraffDefaultSettings);

    const appContext = useContext(AppContext);
    const {routes}: any = appContext;

    const pathname = usePathname() || '';
    const matchedRoutes = matchRoutes(routes, pathname);
    const matched = matchedRoutes ? matchedRoutes[0] : false;

    const newSettings = useRef(null);

    const shouldAwaitRender = useCallback(() => {
        let _newSettings;
        /**
         * On Path changed
         */
        // if (prevPathname !== pathname) {
        // @ts-ignore
        if (matched && matched.route.settings) {
            /**
             * if matched route has settings
             */
                // @ts-ignore
            const routeSettings = matched.route.settings;

            _newSettings = generateSettings(defaultSettings, routeSettings);
        } else if (!_.isEqual(newSettings.current, defaultSettings)) {
            /**
             * Reset to default settings on the new path
             */
            _newSettings = _.merge({}, defaultSettings);
        } else {
            _newSettings = newSettings.current;
        }

        if (!_.isEqual(newSettings.current, _newSettings)) {
            newSettings.current = _newSettings;
        }
    }, [defaultSettings, matched]);

    shouldAwaitRender();

    useDeepCompareEffect(() => {
        if (!_.isEqual(newSettings.current, settings)) {
            dispatch(setSettings(newSettings.current));
        }
    }, [dispatch, newSettings.current, settings]);

    // console.warn('::MasraffLayout:: rendered');

    const Layout = useMemo(() => layouts[settings.layout.style], [layouts, settings.layout.style]);
    // console.log('Layout: ', Layout);

    return _.isEqual(newSettings.current, settings) ? (
        <>
            {inputGlobalStyles}
            <Layout {...props} />
        </>
    ) : null;
};

export default memo(MasraffLayout);
