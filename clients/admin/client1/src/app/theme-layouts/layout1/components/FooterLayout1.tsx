'use client';

import {ThemeProvider} from "@mui/material/styles";
import {AppBar, Toolbar} from "@mui/material";
import clsx from "clsx";
import {useSelector} from "react-redux";
import {selectFooterTheme} from "app/store/masraff/settingsSlice";
import {memo} from "react";
import PoweredByLinks from "app/theme-layouts/shared-components/PoweredByLinks";

const FooterLayout1 = (props: any) => {
    const footerTheme = useSelector(selectFooterTheme);

    return (
        <ThemeProvider theme={footerTheme}>
            <AppBar
                id="masraff-footer"
                className={clsx('relative z-20 shadow-md', props.className)}
                color="default"
                sx={{
                    backgroundColor: (theme: any) =>
                        theme.palette.mode === 'light'
                            ? footerTheme.palette.background.paper
                            : footerTheme.palette.background.default,
                }}
            >
                <Toolbar className="min-h-48 md:min-h-64 px-8 sm:px-12 py-0 flex items-center overflow-x-auto">
                    <div className="flex grow shrink-0">
                        {/*<PurchaseButton className="mx-4" />*/}
                        {/*<DocumentationButton className="mx-4" />*/}
                    </div>

                    <div className="flex grow shrink-0 px-12 justify-end">
                        <PoweredByLinks />
                    </div>
                </Toolbar>
            </AppBar>
        </ThemeProvider>
    );
};

export default memo(FooterLayout1);
