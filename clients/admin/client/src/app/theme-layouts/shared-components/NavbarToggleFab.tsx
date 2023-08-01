import {useDispatch, useSelector} from 'react-redux';
import {styled} from '@mui/material/styles';
import {Fab, Tooltip} from "@mui/material";
import clsx from 'clsx';
import {selectMasraffCurrentLayoutConfig} from "app/store/masraff/settingsSlice";
import {navbarToggle, navbarToggleMobile} from "app/store/masraff/navbarSlice";
import MasraffSvgIcon from "@masraff/core/MasraffSvgIcon";

interface StyledRootProps {
    position?: any;
    title?: string;
    placement?: string;
    theme?: any;
    children?: any;
}

interface NavbarToggleFabProps {
    className?: string;
}

const Root = styled(Tooltip)<StyledRootProps>(({position, theme}) => ({
    '& > .button': {
        height: 40,
        position: 'absolute',
        zIndex: 99,
        top: 12,
        width: 24,
        borderRadius: 38,
        padding: 8,
        backgroundColor: theme.palette.background.paper,
        transition: theme.transitions.create(
            ['background-color', 'border-radius', 'width', 'min-width', 'padding'],
            {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.shorter,
            }
        ),
        '&:hover': {
            width: 52,
            paddingLeft: 8,
            paddingRight: 8,
        },

        '& > .button-icon': {
            fontSize: 18,
            transition: theme.transitions.create(['transform'], {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.short,
            }),
        },

        ...(position === 'left' && {
            borderBottomLeftRadius: 0,
            borderTopLeftRadius: 0,
            paddingLeft: 4,
            left: 0,
        }),

        ...(position === 'right' && {
            borderBottomRightRadius: 0,
            borderTopRightRadius: 0,
            paddingRight: 4,
            right: 0,
            '& > .button-icon': {
                transform: 'rotate(-180deg)',
            },
        }),
    },
}));

const NavbarToggleFab = (props: NavbarToggleFabProps) => {
    const isMobile = false; // useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const config = useSelector(selectMasraffCurrentLayoutConfig);

    const dispatch = useDispatch();

    return (
        <Root
            title="Show Navigation"
            placement={config.navbar.position === 'left' ? 'right' : 'left'}
            position={config.navbar.position}
        >
            <Fab
                className={clsx('button', props.className)}
                onClick={(ev: any) => dispatch(isMobile ? navbarToggleMobile(ev) : navbarToggle(ev))}
                disableRipple
            >
                <MasraffSvgIcon color="action" className="button-icon">
                    heroicons-outline:view-list
                </MasraffSvgIcon>
            </Fab>
        </Root>
    );
};

export default NavbarToggleFab;