'use client';

import {styled} from "@mui/material/styles";
import {SwipeableDrawer} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {selectMasraffCurrentLayoutConfig} from "app/store/masraff/settingsSlice";
import {navbarCloseMobile, selectMasraffNavbar} from "app/store/masraff/navbarSlice";
import NavbarStyle1Content from "app/theme-layouts/layout1/components/navbar/style-1/NavbarStyle1Content";

const navbarWidth = 280;

type StyledNavBarConfig = {
    theme?: any;
    open: boolean;
    position: string;
    children: any;
    sx: any;
    className: string;
}

const StyledNavBar = styled('div')(({theme, open, position}: StyledNavBarConfig) => ({
    minWidth: navbarWidth,
    width: navbarWidth,
    maxWidth: navbarWidth,
    ...(!open && {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.leavingScreen,
        }),
        ...(position === 'left' && {
            marginLeft: `-${navbarWidth}px`,
        }),
        ...(position === 'right' && {
            marginRight: `-${navbarWidth}px`,
        }),
    }),
    ...(open && {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const StyledNavBarMobile = styled(SwipeableDrawer)(({theme}) => ({
    '& .MuiDrawer-paper': {
        minWidth: navbarWidth,
        width: navbarWidth,
        maxWidth: navbarWidth,
    },
}));

function NavbarStyle1(props: any) {
    const dispatch = useDispatch();
    const config = useSelector(selectMasraffCurrentLayoutConfig);
    const navbar = useSelector(selectMasraffNavbar);

    return (
        <>
            <StyledNavBar
                sx={{display: {xs: 'none', lg: 'block'}}}
                className="flex-col flex-auto sticky top-0 overflow-hidden h-screen shrink-0 z-20 shadow-5"
                open={navbar.open}
                position={config.navbar.position}
            >
                <NavbarStyle1Content/>
            </StyledNavBar>

            <StyledNavBarMobile
                sx={{display: {lg: 'none', xs: 'block'}}}
                classes={{
                    paper: 'flex-col flex-auto h-full',
                }}
                anchor={config.navbar.position}
                variant="temporary"
                open={navbar.mobileOpen}
                onClose={(ev) => dispatch(navbarCloseMobile(ev))}
                onOpen={() => {
                }}
                disableSwipeToOpen
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
            >
                <NavbarStyle1Content/>
            </StyledNavBarMobile>
        </>
    );
}

export default NavbarStyle1;