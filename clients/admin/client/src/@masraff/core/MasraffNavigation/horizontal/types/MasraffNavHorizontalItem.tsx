import MasraffSvgIcon from "@masraff/core/MasraffSvgIcon";
import {memo, useMemo} from "react";
import {ListItemButton, ListItemText} from "@mui/material";
import clsx from "clsx";
import MasraffNavBadge from "@masraff/core/MasraffNavigation/MasraffNavBadge";
import NavLinkAdapter from "@masraff/core/NavLinkAdapter";
import {styled} from "@mui/material/styles";
import withRouter from "@masraff/core/withRouter";

const StyledListItem = styled(ListItemButton as any)(({theme}) => ({
    color: theme.palette.text.primary,
    textDecoration: 'none!important',
    minHeight: 48,
    '&.active': {
        backgroundColor: `${theme.palette.secondary.main}!important`,
        color: `${theme.palette.secondary.contrastText}!important`,
        pointerEvents: 'none',
        '& .masraff-list-item-text-primary': {
            color: 'inherit',
        },
        '& .masraff-list-item-icon': {
            color: 'inherit',
        },
    },
    '& .masraff-list-item-icon': {},
    '& .masraff-list-item-text': {
        padding: '0 0 0 16px',
    },
}));

function MasraffNavHorizontalItem(props: any) {
    const {item} = props;

    return useMemo(
        () => (
            <StyledListItem
                component={NavLinkAdapter}
                to={item.url || ''}
                activeClassName={item.url ? 'active' : ''}
                className={clsx('masraff-list-item', item.active && 'active')}
                end={item.end}
                sx={item.sx}
                disabled={item.disabled}
            >
                {item.icon && (
                    <MasraffSvgIcon
                        className={clsx('masraff-list-item-icon shrink-0', item.iconClass)}
                        color="action"
                    >
                        {item.icon}
                    </MasraffSvgIcon>
                )}

                <ListItemText
                    className="masraff-list-item-text"
                    primary={item.title}
                    classes={{primary: 'text-13 masraff-list-item-text-primary truncate'}}
                />

                {item.badge && <MasraffNavBadge className="ltr:ml-8 rtl:mr-8" badge={item.badge}/>}
            </StyledListItem>
        ),
        [item.badge, item.icon, item.iconClass, item.title, item.url, item.active, item.disabled, item.end, item.sx]
    );
}

const NavHorizontalItem = withRouter(memo(MasraffNavHorizontalItem));

export default NavHorizontalItem;