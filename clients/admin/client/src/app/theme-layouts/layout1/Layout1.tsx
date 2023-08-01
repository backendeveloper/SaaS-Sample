import {memo, useContext} from "react";
import {useSelector} from "react-redux";
import {useRoutes} from 'react-router-dom';
import {styled} from '@mui/material/styles';
import AppContext from "app/AppContext";
import {selectMasraffCurrentLayoutConfig} from "app/store/masraff/settingsSlice";
import {ToolbarLayout1, NavbarWrapperLayout1, LeftSideLayout1} from "app/theme-layouts/layout1/components";
import MasraffSuspense from "@masraff/core/MasraffSuspense";

type InputProps = {
    config: any;
}
const Root = styled('div')<InputProps>(({config}: any) => ({
    ...(config.mode === 'boxed' && {
        clipPath: 'inset(0)',
        maxWidth: `${config.containerWidth}px`,
        margin: '0 auto',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }),
    ...(config.mode === 'container' && {
        '& .container': {
            maxWidth: `${config.containerWidth}px`,
            width: '100%',
            margin: '0 auto',
        },
    }),
}));

const Layout1 = (props: any) => {
    const config = useSelector(selectMasraffCurrentLayoutConfig);
    const appContext = useContext(AppContext);
    const {routes}: any = appContext;

    return (
        <Root id="masraff-layout" config={config} className="w-full flex">
            {config.leftSidePanel.display && <LeftSideLayout1/>}

            <div className="flex flex-auto min-w-0">
                {config.navbar.display && config.navbar.position === 'left' && <NavbarWrapperLayout1/>}

                <main id="masraff-main" className="flex flex-col flex-auto min-h-full min-w-0 relative z-10">
                    {config.toolbar.display && (
                        <ToolbarLayout1 className={config.toolbar.style === 'fixed' && 'sticky top-0'}/>
                    )}

                    <div className="sticky top-0 z-99">
                        {/*<SettingsPanel />*/}
                    </div>

                    <div className="flex flex-col flex-auto min-h-0 relative z-10">
                        {/*<FuseDialog />*/}

                        <MasraffSuspense>{useRoutes(routes)}</MasraffSuspense>

                        {props.children}
                    </div>

                    {/*{config.footer.display && (*/}
                    {/*    <FooterLayout1 className={config.footer.style === 'fixed' && 'sticky bottom-0'} />*/}
                    {/*)}*/}
                </main>

                {config.navbar.display && config.navbar.position === 'right' && <NavbarWrapperLayout1 />}
            </div>

            {/*{config.rightSidePanel.display && <RightSideLayout1 />}*/}
            {/*<FuseMessage />*/}
        </Root>
    );
};

export default memo(Layout1);