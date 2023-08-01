'use client';

import {alpha, styled} from "@mui/material/styles";
import {ListItem, ListItemText} from "@mui/material";
import {useMemo} from "react";
import NavLinkAdapter from "@masraff/core/NavLinkAdapter";
import clsx from "clsx";
import MasraffSvgIcon from "@masraff/core/MasraffSvgIcon";
import MasraffNavBadge from "@masraff/core/MasraffNavigation/MasraffNavBadge";

const Root = styled(ListItem)(({ theme, ...props }: any) => ({
    minHeight: 44,
    width: '100%',
    borderRadius: '6px',
    margin: '0 0 4px 0',
    paddingRight: 16,
    paddingLeft: props.itempadding > 80 ? 80 : props.itempadding,
    paddingTop: 10,
    paddingBottom: 10,
    color: alpha(theme.palette.text.primary, 0.7),
    cursor: 'pointer',
    textDecoration: 'none!important',
    '&:hover': {
        color: theme.palette.text.primary,
    },
    '&.active': {
        color: theme.palette.text.primary,
        backgroundColor:
            theme.palette.mode === 'light'
                ? 'rgba(0, 0, 0, .05)!important'
                : 'rgba(255, 255, 255, .1)!important',
        pointerEvents: 'none',
        transition: 'border-radius .15s cubic-bezier(0.4,0.0,0.2,1)',
        '& > .masraff-list-item-text-primary': {
            color: 'inherit',
        },
        '& > .masraff-list-item-icon': {
            color: 'inherit',
        },
    },
    '& >.masraff-list-item-icon': {
        marginRight: 16,
        color: 'inherit',
    },
    '& > .masraff-list-item-text': {},
}));

const MasraffNavVerticalItem = (props: any) => {
    const { item, nestedLevel, onItemClick } = props;

    const itempadding = nestedLevel > 0 ? 38 + nestedLevel * 16 : 16;

    return useMemo(
        () => (
            <Root
                button
                component={NavLinkAdapter}
                to={item.url || ''}
                activeClassName={item.url ? 'active' : ''}
                className={clsx('masraff-list-item', item.active && 'active')}
                onClick={() => onItemClick && onItemClick(item)}
                end={item.end}
                itempadding={itempadding}
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
                    secondary={item.subtitle}
                    classes={{
                        primary: 'text-13 font-medium masraff-list-item-text-primary truncate',
                        secondary: 'text-11 font-medium masraff-list-item-text-secondary leading-normal truncate',
                    }}
                />
                {item.badge && <MasraffNavBadge badge={item.badge} />}
            </Root>
        ),
        [item, itempadding, onItemClick]
    );
};

const NavVerticalItem = MasraffNavVerticalItem;

export default NavVerticalItem;