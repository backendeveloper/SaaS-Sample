import {memo} from "react";
import {useSelector} from "react-redux";
import {ThemeProvider} from "@mui/material/styles";
import {AppBar, Toolbar} from "@mui/material";
import clsx from "clsx";
import {selectMasraffCurrentLayoutConfig, selectToolbarTheme} from "app/store/masraff/settingsSlice";
import {selectMasraffNavbar} from "app/store/masraff/navbarSlice";
import {LanguageSwitcher, NavbarToggleButton, NavigationShortcuts, AdjustFontSize, FullScreenToggle, UserMenu} from 'app/theme-layouts/shared-components';

const ToolbarLayout1 = (props: any) => {
    const config = useSelector(selectMasraffCurrentLayoutConfig);
    const navbar = useSelector(selectMasraffNavbar);
    const toolbarTheme = useSelector(selectToolbarTheme);

    return (
        <ThemeProvider theme={toolbarTheme}>
            <AppBar
                id="masraff-toolbar"
                className={clsx('flex relative z-20 shadow-md', props.className)}
                color="default"
                sx={{
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                            ? toolbarTheme.palette.background.paper
                            : toolbarTheme.palette.background.default,
                }}
                position="static"
            >
                <Toolbar className="p-0 min-h-48 md:min-h-64">
                    <div className="flex flex-1 px-16">
                        {config.navbar.display && config.navbar.position === 'left' && (
                            <>
                                {(config.navbar.style === 'style-3' ||
                                    config.navbar.style === 'style-3-dense') && (
                                    <NavbarToggleButton className="w-40 h-40 p-0 mx-0"/>
                                )}
                                {config.navbar.style === 'style-1' && !navbar.open && (
                                    <NavbarToggleButton
                                        sx={{display: {xs: 'none', md: 'block'}}}
                                        className="w-40 h-40 p-0 mx-0"/>
                                )}

                                <NavbarToggleButton
                                    sx={{display: {lg: 'none', xs: 'block'}}}
                                    className="w-40 h-40 p-0 mx-0 sm:mx-8"/>
                            </>
                        )}

                        <NavigationShortcuts sx={{display: {xs: 'none', lg: 'block'}}}/>
                    </div>

                    <div className="flex items-center px-8 h-full overflow-x-auto">
                        <LanguageSwitcher/>

                        <AdjustFontSize/>

                        <FullScreenToggle/>

                        {/*<NavigationSearch />*/}

                        {/*<Hidden lgUp>*/}
                        {/*    <ChatPanelToggleButton />*/}
                        {/*</Hidden>*/}

                        {/*<QuickPanelToggleButton />*/}

                        {/*<NotificationPanelToggleButton />*/}

                        <UserMenu/>
                    </div>

                    {config.navbar.display && config.navbar.position === 'right' && (
                        <>
                            {!navbar.open && <NavbarToggleButton sx={{display: {xs: 'none', lg: 'block'}}}
                                                                 className="w-40 h-40 p-0 mx-0"/>}

                            <NavbarToggleButton sx={{display: {lg: 'none', xs: 'block'}}}
                                                className="w-40 h-40 p-0 mx-0 sm:mx-8"/>
                        </>
                    )}
                </Toolbar>
            </AppBar>
        </ThemeProvider>
    );
};

export default memo(ToolbarLayout1);