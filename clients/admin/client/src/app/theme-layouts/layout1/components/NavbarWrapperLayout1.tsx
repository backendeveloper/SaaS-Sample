import {memo} from "react";
import {ThemeProvider} from "@mui/material/styles";
import {useSelector} from "react-redux";
import {selectMasraffCurrentLayoutConfig, selectNavbarTheme} from "app/store/masraff/settingsSlice";
import {selectMasraffNavbar} from "app/store/masraff/navbarSlice";
import NavbarStyle1 from "app/theme-layouts/layout1/components/navbar/style-1/NavbarStyle1";
import {NavbarToggleFab} from "app/theme-layouts/shared-components";

function NavbarWrapperLayout1(props: any) {
    const config = useSelector(selectMasraffCurrentLayoutConfig);
    const navbar = useSelector(selectMasraffNavbar);
    const navbarTheme = useSelector(selectNavbarTheme);

    return (
        <>
            <ThemeProvider theme={navbarTheme}>
                <>
                    {config.navbar.style === 'style-1' && <NavbarStyle1 />}
                    {/*{config.navbar.style === 'style-2' && <NavbarStyle2 />}*/}
                    {/*{config.navbar.style === 'style-3' && <NavbarStyle3 />}*/}
                    {/*{config.navbar.style === 'style-3-dense' && <NavbarStyle3 dense />}*/}
                </>
            </ThemeProvider>
            {config.navbar.display && !config.toolbar.display && !navbar.open && <NavbarToggleFab />}
        </>
    );
}

export default memo(NavbarWrapperLayout1);
