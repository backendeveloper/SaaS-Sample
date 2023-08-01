'use client';

import {styled, useTheme} from "@mui/material/styles";
import {Grow, IconButton, ListItem, ListItemText, Paper} from "@mui/material";
import {memo, useMemo, useState} from "react";
import clsx from "clsx";
import MasraffSvgIcon from "@masraff/core/MasraffSvgIcon";
import MasraffNavItem from "@masraff/core/MasraffNavigation/MasraffNavItem";
import {useDebounce} from "@masraff/hooks";
import {Manager, Popper, Reference} from 'react-popper';
import NavLinkAdapter from "@masraff/core/NavLinkAdapter";
import MasraffNavBadge from "@masraff/core/MasraffNavigation/MasraffNavBadge";
import * as ReactDOM from 'react-dom';
import {withRouter} from "next/router";

const StyledListItem = styled(ListItem)(({theme}) => ({
    color: theme.palette.text.primary,
    minHeight: 48,
    '&.active, &.active:hover, &.active:focus': {
        backgroundColor: `${theme.palette.secondary.main}!important`,
        color: `${theme.palette.secondary.contrastText}!important`,

        '&.open': {
            backgroundColor: 'rgba(0,0,0,.08)',
        },

        '& > .masraff-list-item-text': {
            padding: '0 0 0 16px',
        },

        '& .masraff-list-item-icon': {
            color: 'inherit',
        },
    },
}));

const isUrlInChildren = (parent: any, url: any) => {
    if (!parent.children) {
        return false;
    }

    for (let i = 0; i < parent.children.length; i += 1) {
        if (parent.children[i].children) {
            if (isUrlInChildren(parent.children[i], url)) {
                return true;
            }
        }

        if (parent.children[i].url === url || url.includes(parent.children[i].url)) {
            return true;
        }
    }

    return false;
};

const MasraffNavHorizontalCollapse = (props: any) => {
    const [opened, setOpened] = useState(false);
    const {item, nestedLevel, dense} = props;
    const theme = useTheme();

    const handleToggle = useDebounce((open: any) => {
        setOpened(open);
    }, 150);

    const stripeLoad = (): Element | DocumentFragment => {
        if (typeof document !== 'undefined') {
            // @ts-ignore
            return document.querySelector('#root') || <div></div>;
        }

        // @ts-ignore
        return null;
    };

    return useMemo(
        () => (
            <ul className="relative px-0">
                <Manager>
                    <Reference>
                        {({ref}: any) => (
                            <div ref={ref}>
                                <StyledListItem
                                    button
                                    className={clsx(
                                        'masraff-list-item',
                                        opened && 'open',
                                        isUrlInChildren(item, props.location.pathname) && 'active'
                                    )}
                                    onMouseEnter={() => handleToggle(true)}
                                    onMouseLeave={() => handleToggle(false)}
                                    aria-owns={opened ? 'menu-masraff-list-grow' : null}
                                    aria-haspopup="true"
                                    component={item.url ? NavLinkAdapter : 'li'}
                                    to={item.url}
                                    end={item.end}
                                    role="button"
                                    sx={item.sx}
                                    disabled={item.disabled}
                                >
                                    {item.icon && (
                                        <MasraffSvgIcon
                                            color="action"
                                            className={clsx('masraff-list-item-icon shrink-0', item.iconClass)}
                                        >
                                            {item.icon}
                                        </MasraffSvgIcon>
                                    )}

                                    <ListItemText
                                        className="masraff-list-item-text"
                                        primary={item.title}
                                        classes={{primary: 'text-13 truncate'}}
                                    />

                                    {item.badge && <MasraffNavBadge className="mx-4" badge={item.badge}/>}
                                    <IconButton
                                        disableRipple
                                        className="w-16 h-16 ltr:ml-4 rtl:mr-4 p-0"
                                        color="inherit"
                                        size="large"
                                    >
                                        <MasraffSvgIcon size={16} className="arrow-icon">
                                            {theme.direction === 'ltr'
                                                ? 'heroicons-outline:arrow-sm-right'
                                                : 'heroicons-outline:arrow-sm-left'}
                                        </MasraffSvgIcon>
                                    </IconButton>
                                </StyledListItem>
                            </div>
                        )}
                    </Reference>
                    {ReactDOM.createPortal(
                        <Popper
                            placement={theme.direction === 'ltr' ? 'right' : 'left'}
                            eventsEnabled={opened}
                            positionFixed
                        >
                            {({ref, style, placement, arrowProps}: any) =>
                                opened && (
                                    <div
                                        ref={ref}
                                        style={{
                                            ...style,
                                            zIndex: 999 + nestedLevel + 1,
                                        }}
                                        data-placement={placement}
                                        className={clsx('z-999', !opened && 'pointer-events-none')}
                                    >
                                        <Grow in={opened} id="menu-masraff-list-grow" style={{transformOrigin: '0 0 0'}}>
                                            <Paper
                                                className="rounded-8"
                                                onMouseEnter={() => handleToggle(true)}
                                                onMouseLeave={() => handleToggle(false)}
                                            >
                                                {item.children && (
                                                    <ul className={clsx('popper-navigation-list', dense && 'dense', 'px-0')}>
                                                        {item.children.map((_item: any) => (
                                                            <MasraffNavItem
                                                                key={_item.id}
                                                                type={`horizontal-${_item.type}`}
                                                                item={_item}
                                                                nestedLevel={nestedLevel + 1}
                                                                dense={dense}
                                                            />
                                                        ))}
                                                    </ul>
                                                )}
                                            </Paper>
                                        </Grow>
                                    </div>
                                )
                            }
                        </Popper>,
                        stripeLoad()
                    )}
                </Manager>
            </ul>
        ),
        [dense, handleToggle, item, nestedLevel, opened, props.location.pathname, theme.direction]
    );
};

// const NavHorizontalCollapse = withRouter(memo(MasraffNavHorizontalCollapse));
const NavHorizontalCollapse = withRouter(memo(MasraffNavHorizontalCollapse));

export default NavHorizontalCollapse;