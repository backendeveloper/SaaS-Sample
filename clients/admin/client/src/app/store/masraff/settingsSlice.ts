import {createAsyncThunk, createSelector, createSlice} from "@reduxjs/toolkit";
import _ from "@lodash";
import {createTheme, getContrastRatio} from "@mui/material/styles";
import {
    defaultSettings,
    defaultThemeOptions,
    extendThemeWithMixins,
    getParsedQuerySettings,
    mustHaveThemeOptions
} from "@masraff/default-settings/MasraffDefaultSettings";
import {settingsConfig} from "app/configs/index";
import themeLayoutConfigs from "app/theme-layouts/themeLayoutConfigs";
import {setUser, updateUserSettings} from "app/store/userSlice";
import {darkPaletteText, lightPaletteText} from "app/configs/themesConfig";

export const changeMasraffTheme = (theme: any) => (dispatch: any, getState: any) => {
    const { masraff } = getState();
    const { settings } = masraff;

    const newSettings = {
        ...settings.current,
        theme: {
            main: theme,
            navbar: theme,
            toolbar: theme,
            footer: theme,
        },
    };

    dispatch(setDefaultSettings(newSettings));
};

const getInitialSettings = (): any => {
    const defaultLayoutStyle = settingsConfig.layout && settingsConfig.layout.style ? settingsConfig.layout.style : 'layout1';
    const layout = {
        style: defaultLayoutStyle,
        config: themeLayoutConfigs[defaultLayoutStyle as keyof typeof themeLayoutConfigs].defaults,
    };

    return _.merge({}, defaultSettings, { layout }, settingsConfig, getParsedQuerySettings());
}

export const generateSettings = (_defaultSettings: any, _newSettings: any) => {
    return _.merge(
        {},
        _defaultSettings,
        {layout: {config: themeLayoutConfigs[_newSettings?.layout?.style as keyof typeof themeLayoutConfigs]?.defaults}},
        _newSettings
    );
};

const initialSettings = getInitialSettings();
const initialState = {
    initial: initialSettings,
    defaults: _.merge({}, initialSettings),
    current: _.merge({}, initialSettings)
};

export const setDefaultSettings = createAsyncThunk('masraff/settings/setDefaultSettings', async (val: any, { dispatch, getState }: any) => {
    const { masraff }: any = getState();
    const { settings } = masraff;
    const defaults = generateSettings(settings.defaults, val);

    dispatch(updateUserSettings(defaults));

    return {
        ...settings,
        defaults: _.merge({}, defaults),
        current: _.merge({}, defaults),
    };
});

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setSettings: (state, action) => {
            const current = generateSettings(state.defaults, action.payload);

            return {
                ...state,
                current,
            };
        },
        setInitialSettings: () => _.merge({}, initialState),
        resetSettings: (state, action) => {
            return {
                ...state,
                defaults: _.merge({}, state.defaults),
                current: _.merge({}, state.defaults),
            };
        },
    },
    extraReducers: builder => {
        builder
            .addCase(setDefaultSettings.fulfilled, (state, action) => action.payload)
            .addCase(setUser.fulfilled, (state, action: any) => {
                const defaults = generateSettings(state.defaults, action.payload?.data?.settings);

                return {
                    ...state,
                    defaults: _.merge({}, defaults),
                    current: _.merge({}, defaults),
                };
            })
    }
});

const getDirection = (state: any) => state.masraff.settings.current.direction;
const getMainTheme = (state: any) => state.masraff.settings.current.theme.main;
const getNavbarTheme = (state: any) => state.masraff.settings.current.theme.navbar;
const getToolbarTheme = (state: any) => state.masraff.settings.current.theme.toolbar;
const getFooterTheme = (state: any) => state.masraff.settings.current.theme.footer;

const generateMuiTheme = (theme: any, direction: any) => {
    const data = _.merge({}, defaultThemeOptions, theme, mustHaveThemeOptions);

    return createTheme(
        _.merge({}, data, {
            mixins: extendThemeWithMixins(data),
            direction,
        })
    );
};

export const selectContrastMainTheme = (bgColor: any) => {
    const isDark = (color: any) => getContrastRatio(color, '#ffffff') >= 3;

    return isDark(bgColor) ? selectMainThemeDark : selectMainThemeLight;
};

const changeThemeMode = (theme: any, mode: string) => {
    const modes = {
        dark: {
            palette: {
                mode: 'dark',
                divider: 'rgba(241,245,249,.12)',
                background: {
                    paper: '#1E2125',
                    default: '#121212',
                },
                text: darkPaletteText,
            },
        },
        light: {
            palette: {
                mode: 'light',
                divider: '#e2e8f0',
                background: {
                    paper: '#FFFFFF',
                    default: '#F7F7F7',
                },
                text: lightPaletteText,
            },
        },
    };

    return _.merge({}, theme, modes[mode as keyof typeof modes]);
};

export const selectMainTheme = createSelector(
    [getMainTheme, getDirection],
    (theme, direction) => generateMuiTheme(theme, direction)
);

export const selectMainThemeDark = createSelector(
    [getMainTheme, getDirection],
    (theme, direction) => generateMuiTheme(changeThemeMode(theme, 'dark'), direction)
);

export const selectMainThemeLight = createSelector(
    [getMainTheme, getDirection],
    (theme, direction) => generateMuiTheme(changeThemeMode(theme, 'light'), direction)
);

export const selectNavbarTheme = createSelector(
    [getNavbarTheme, getDirection],
    (theme, direction) => generateMuiTheme(theme, direction)
);

export const selectNavbarThemeDark = createSelector(
    [getNavbarTheme, getDirection],
    (theme, direction) => generateMuiTheme(changeThemeMode(theme, 'dark'), direction)
);

export const selectNavbarThemeLight = createSelector(
    [getNavbarTheme, getDirection],
    (theme, direction) => generateMuiTheme(changeThemeMode(theme, 'light'), direction)
);

export const selectToolbarTheme = createSelector(
    [getToolbarTheme, getDirection],
    (theme, direction) => generateMuiTheme(theme, direction)
);

export const selectToolbarThemeDark = createSelector(
    [getToolbarTheme, getDirection],
    (theme, direction) => generateMuiTheme(changeThemeMode(theme, 'dark'), direction)
);

export const selectToolbarThemeLight = createSelector(
    [getToolbarTheme, getDirection],
    (theme, direction) => generateMuiTheme(changeThemeMode(theme, 'light'), direction)
);

export const selectFooterTheme = createSelector(
    [getFooterTheme, getDirection],
    (theme, direction) => generateMuiTheme(theme, direction)
);

export const selectFooterThemeDark = createSelector(
    [getFooterTheme, getDirection],
    (theme, direction) => generateMuiTheme(changeThemeMode(theme, 'dark'), direction)
);

export const selectFooterThemeLight = createSelector(
    [getFooterTheme, getDirection],
    (theme, direction) => generateMuiTheme(changeThemeMode(theme, 'light'), direction)
);

export const selectMasraffCurrentSettings = ({ masraff }: any) => masraff.settings.current;

export const selectMasraffCurrentLayoutConfig = ({ masraff }: any) => masraff.settings.current.layout.config;

export const selectMasraffDefaultSettings = ({ masraff }: any) => masraff.settings.defaults;

export const selectMasraffThemesSettings = ({ masraff }: any) => masraff.settings.themes;

export const { resetSettings, setInitialSettings, setSettings } = settingsSlice.actions;

export default settingsSlice.reducer;