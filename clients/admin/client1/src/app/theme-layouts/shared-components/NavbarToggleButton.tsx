'use client';

import {useDispatch, useSelector} from "react-redux";
import {selectMasraffCurrentSettings, setDefaultSettings} from "app/store/masraff/settingsSlice";
import {IconButton} from "@mui/material";
import {navbarToggle, navbarToggleMobile} from "app/store/masraff/navbarSlice";
import _ from "lodash";
import MasraffSvgIcon from "@masraff/core/MasraffSvgIcon";

const NavbarToggleButton = (props: any) => {
    const dispatch = useDispatch();
    // const isMobile = useThemeMediaQuery((theme: any) => theme.breakpoints.down('lg'));
    const isMobile = false;
    const settings = useSelector(selectMasraffCurrentSettings);
    const {config} = settings.layout;

    return (
        <IconButton
            className={props.className}
            color="inherit"
            size="small"
            onClick={(ev) => {
                if (isMobile) {
                    dispatch(navbarToggleMobile(ev));
                } else if (config.navbar.style === 'style-2') {
                    // @ts-ignore
                    dispatch(setDefaultSettings(_.set({}, 'layout.config.navbar.folded', !settings.layout.config.navbar.folded)));
                } else {
                    dispatch(navbarToggle(ev));
                }
            }}
        >
            <MasraffSvgIcon size={20} color="action">
                heroicons-outline:view-list
            </MasraffSvgIcon>
        </IconButton>
    );
};

export default NavbarToggleButton;