import {createSelector, createSlice} from "@reduxjs/toolkit";
import {setDefaultSettings} from "./masraff/settingsSlice";
import i18n from "../../i18n";

export const changeLanguage = (languageId: any) => (dispatch: any, getState: any) => {
    const { direction } = getState().masraff.settings.defaults;

    const newLangDirection = i18n.dir(languageId);

    /*
      If necessary, change theme direction
       */
    if (newLangDirection !== direction) {
        dispatch(setDefaultSettings({ direction: newLangDirection }));
    }

    /*
      Change Language
       */
    return i18n.changeLanguage(languageId).then(() => {
        dispatch(i18nSlice.actions.languageChanged(languageId));
    });
};

const i18nSlice = createSlice({
    name: 'i18n',
    initialState: {
        language: i18n.options.lng,
        languages: [
            {id: 'en', title: 'English', flag: 'US'},
            {id: 'tr', title: 'Turkish', flag: 'TR'},
            {id: 'ar', title: 'Arabic', flag: 'SA'},
        ],
    },
    reducers: {
        languageChanged: (state, action) => {
            state.language = action.payload;
        },
    }
});

export const selectCurrentLanguageId = (currentState: any) => currentState.i18n.language;

export const selectLanguages = (currentState: any) => currentState.i18n.languages;

export const selectCurrentLanguageDirection = createSelector([selectCurrentLanguageId], (id) => {
    return i18n.dir(id);
});

export const selectCurrentLanguage = createSelector(
    [selectCurrentLanguageId, selectLanguages],
    (id, languages) => {
        return languages.find((lng: any) => lng.id === id);
    }
);

export default i18nSlice.reducer;