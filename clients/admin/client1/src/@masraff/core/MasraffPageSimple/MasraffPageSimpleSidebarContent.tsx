import {useSelector} from "react-redux";
import {selectContrastMainTheme} from "app/store/masraff/settingsSlice";
import {ThemeProvider, useTheme} from "@mui/material/styles";
import clsx from "clsx";
import MasraffScrollbars from "@masraff/core/MasraffScrollbars";


const MasraffPageSimpleSidebarContent = (props: any) => {
    const theme = useTheme();
    const contrastTheme = useSelector(selectContrastMainTheme(theme.palette.primary.main));

    return (
        <MasraffScrollbars enable={props.innerScroll}>
            {props.header && (
                <ThemeProvider theme={contrastTheme}>
                    <div className={clsx('MasraffPageSimple-sidebarHeader', props.variant)}>{props.header}</div>
                </ThemeProvider>
            )}

            {props.content && <div className="MasraffPageSimple-sidebarContent">{props.content}</div>}
        </MasraffScrollbars>
    );
};

export default MasraffPageSimpleSidebarContent;
