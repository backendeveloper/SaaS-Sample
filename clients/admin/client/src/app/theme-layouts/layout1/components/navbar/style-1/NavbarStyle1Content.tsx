import {memo} from "react";
import clsx from "clsx";
import {styled} from "@mui/material/styles";
import MasraffScrollbars from "@masraff/core/MasraffScrollbars";
import {Logo, NavbarToggleButton, Navigation, UserNavbarHeader} from "app/theme-layouts/shared-components";

type StyledContentConfig = {
    theme?: any;
    option: any;
    children: any;
    className: string;
}

const Root = styled('div')(({theme}: any) => ({
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    '& ::-webkit-scrollbar-thumb': {
        boxShadow: `inset 0 0 0 20px ${
            theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.24)' : 'rgba(255, 255, 255, 0.24)'
        }`,
    },
    '& ::-webkit-scrollbar-thumb:active': {
        boxShadow: `inset 0 0 0 20px ${
            theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.37)' : 'rgba(255, 255, 255, 0.37)'
        }`,
    },
}));

const StyledContent = styled(MasraffScrollbars)(({theme}: StyledContentConfig) => ({
    overscrollBehavior: 'contain',
    overflowX: 'hidden',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 40px, 100% 10px',
    backgroundAttachment: 'local, scroll',
}));

const NavbarStyle1Content = (props: any) => (
    <Root className={clsx('flex flex-auto flex-col overflow-hidden h-full', props.className)}>
        <div className="flex flex-row items-center shrink-0 h-48 md:h-72 px-20">
            <div className="flex flex-1 mx-4">
                <Logo/>
            </div>

            <NavbarToggleButton className="w-40 h-40 p-0"/>
        </div>

        <StyledContent
            className="flex flex-1 flex-col min-h-0"
            option={{suppressScrollX: true, wheelPropagation: false}}
        >
            <UserNavbarHeader/>

            <Navigation layout="vertical"/>

            <div className="flex flex-0 items-center justify-center py-48 opacity-10">
                <img className="w-full max-w-64" src="assets/images/logo/logo.svg" alt="footer logo"/>
            </div>
        </StyledContent>
    </Root>
);

export default memo(NavbarStyle1Content);