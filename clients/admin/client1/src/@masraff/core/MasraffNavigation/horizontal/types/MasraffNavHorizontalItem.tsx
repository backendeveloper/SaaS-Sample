'use client';

import MasraffSvgIcon from "@masraff/core/MasraffSvgIcon";
import {memo, useMemo} from "react";
import {ListItem, ListItemText} from "@mui/material";
import clsx from "clsx";
import MasraffNavBadge from "@masraff/core/MasraffNavigation/MasraffNavBadge";
import NavLinkAdapter from "@masraff/core/NavLinkAdapter";
import {styled} from "@mui/material/styles";
import {withRouter} from "next/router";

const StyledListItem = styled(ListItem)(({theme}) => ({
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
                button
                component={NavLinkAdapter}
                to={item.url || ''}
                activeClassName={item.url ? 'active' : ''}
                className={clsx('masraff-list-item', item.active && 'active')}
                end={item.end}
                role="button"
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
        [item.badge, item.exact, item.icon, item.iconClass, item.title, item.url]
    );
}

const NavHorizontalItem = withRouter(memo(MasraffNavHorizontalItem));

export default NavHorizontalItem;