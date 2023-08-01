'use client';

import {styled, useTheme} from "@mui/material/styles";
import {red} from "@mui/material/colors";
import {Button, Dialog, IconButton, Slide, Typography} from "@mui/material";
import {forwardRef, memo, useState} from "react";
import {useDispatch} from "react-redux";
import MasraffSvgIcon from "@masraff/core/MasraffSvgIcon";
import {useSwipeable} from "react-swipeable";
// import MasraffScrollbars from "@masraff/core/MasraffScrollbars";
import MasraffSettings from "@masraff/core/MasraffSettings";
import themesConfig from 'app/configs/themesConfig';
import MasraffSettingsViewerDialog from "app/theme-layouts/shared-components/MasraffSettingsViewerDialog";
import {changeMasraffTheme} from "app/store/masraff/settingsSlice";
import MasraffThemeSchemes from "@masraff/core/MasraffThemeSchemes";

const Root = styled('div')(({theme}) => ({
    position: 'absolute',
    height: 80,
    right: 0,
    top: 160,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 0,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
    zIndex: 999,
    color: theme.palette.getContrastText(red[500]),
    backgroundColor: red[400],
    '&:hover': {
        backgroundColor: red[500],
    },

    '& .settingsButton': {
        '& > span': {
            animation: 'rotating 3s linear infinite',
        },
    },

    '@keyframes rotating': {
        from: {
            transform: 'rotate(0deg)',
        },
        to: {
            transform: 'rotate(360deg)',
        },
    },
}));

const StyledDialog = styled(Dialog)(({theme}) => ({
    '& .MuiDialog-paper': {
        position: 'fixed',
        width: 380,
        maxWidth: '90vw',
        backgroundColor: theme.palette.background.paper,
        top: 0,
        height: '100%',
        minHeight: '100%',
        bottom: 0,
        right: 0,
        margin: 0,
        zIndex: 1000,
        borderRadius: 0,
    },
}));

const Transition = forwardRef(function Transition(props: any, ref: any) {
    const theme = useTheme();
    return <Slide direction={theme.direction === 'ltr' ? 'left' : 'right'} ref={ref} {...props} />;
});

function SettingsPanel() {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();

    const handlerOptions = {
        onSwipedLeft: () => {
            return open && theme.direction === 'rtl' && handleClose();
        },
        onSwipedRight: () => {
            return open && theme.direction === 'ltr' && handleClose();
        },
    };

    const settingsHandlers = useSwipeable(handlerOptions);
    const shemesHandlers = useSwipeable(handlerOptions);

    const handleOpen = (panelId: any) => {
        setOpen(panelId);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Root id="masraff-settings-schemes" className="buttonWrapper">
                <Button
                    className="settingsButton min-w-40 w-40 h-40 m-0"
                    onClick={() => handleOpen('settings')}
                    variant="text"
                    color="inherit"
                    disableRipple
                >
          <span>
            <MasraffSvgIcon size={20}>heroicons-solid:cog</MasraffSvgIcon>
          </span>
                </Button>

                <Button
                    className="min-w-40 w-40 h-40 m-0"
                    onClick={() => handleOpen('schemes')}
                    variant="text"
                    color="inherit"
                    disableRipple
                >
                    <MasraffSvgIcon size={20}>heroicons-outline:color-swatch</MasraffSvgIcon>
                </Button>
            </Root>
            <StyledDialog
                TransitionComponent={Transition}
                aria-labelledby="settings-panel"
                aria-describedby="settings"
                open={open === 'settings'}
                onClose={handleClose}
                BackdropProps={{invisible: true}}
                classes={{
                    paper: 'shadow-lg',
                }}
                {...settingsHandlers}
            >
                {/*<MasraffScrollbars className="p-16 sm:p-32">*/}
                {/*    <IconButton*/}
                {/*        className="fixed top-0 ltr:right-0 rtl:left-0 z-10"*/}
                {/*        onClick={handleClose}*/}
                {/*        size="large"*/}
                {/*    >*/}
                {/*        <MasraffSvgIcon>heroicons-outline:x</MasraffSvgIcon>*/}
                {/*    </IconButton>*/}

                {/*    <Typography className="mb-32 font-semibold" variant="h6">*/}
                {/*        Theme Settings*/}
                {/*    </Typography>*/}

                {/*    <MasraffSettings />*/}

                {/*    <MasraffSettingsViewerDialog className="mt-32" />*/}
                {/*</MasraffScrollbars>*/}
            </StyledDialog>
            <StyledDialog
                TransitionComponent={Transition}
                aria-labelledby="schemes-panel"
                aria-describedby="schemes"
                open={open === 'schemes'}
                onClose={handleClose}
                BackdropProps={{invisible: true}}
                classes={{
                    paper: 'shadow-lg',
                }}
                {...shemesHandlers}
            >
                {/*<MasraffScrollbars className="p-16 sm:p-32">*/}
                {/*    <IconButton*/}
                {/*        className="fixed top-0 ltr:right-0 rtl:left-0 z-10"*/}
                {/*        onClick={handleClose}*/}
                {/*        size="large"*/}
                {/*    >*/}
                {/*        <MasraffSvgIcon>heroicons-outline:x</MasraffSvgIcon>*/}
                {/*    </IconButton>*/}

                {/*    <Typography className="mb-32" variant="h6">*/}
                {/*        Theme Color Schemes*/}
                {/*    </Typography>*/}

                {/*    <Typography className="mb-24 text-12 italic text-justify" color="text.secondary">*/}
                {/*        * Selected color scheme will be applied to all theme layout elements (navbar, toolbar,*/}
                {/*        etc.). You can also select a different color scheme for each layout element at theme*/}
                {/*        settings.*/}
                {/*    </Typography>*/}

                {/*    <MasraffThemeSchemes*/}
                {/*        themes={themesConfig}*/}
                {/*        onSelect={(_theme: any) => {*/}
                {/*            dispatch(changeMasraffTheme(_theme) as any);*/}
                {/*        }}*/}
                {/*    />*/}
                {/*</MasraffScrollbars>*/}
            </StyledDialog>
        </>
    );
}

export default memo(SettingsPanel);