import {useEffect, useMemo, useState} from "react";
import {Collapse, IconButton, List, ListItemButton, ListItemText} from "@mui/material";
import {alpha, styled} from "@mui/material/styles";
import clsx from "clsx";
import {useLocation} from 'react-router-dom';
import NavLinkAdapter from "@masraff/core/NavLinkAdapter";
import MasraffNavItem from "@masraff/core/MasraffNavigation/MasraffNavItem";
import MasraffNavBadge from "@masraff/core/MasraffNavigation/MasraffNavBadge";
import MasraffSvgIcon from "@masraff/core/MasraffSvgIcon";

const Root = styled(List as any)(({theme, ...props}: any) => ({
    padding: 0,
    '&.open': {},
    '& > .masraff-list-item': {
        minHeight: 44,
        width: '100%',
        borderRadius: '6px',
        margin: '0 0 4px 0',
        paddingRight: 16,
        paddingLeft: props.itempadding > 80 ? 80 : props.itempadding,
        paddingTop: 10,
        paddingBottom: 10,
        color: alpha(theme.palette.text.primary, 0.7),
        '&:hover': {
            color: theme.palette.text.primary,
        },
        '& > .masraff-list-item-icon': {
            marginRight: 16,
            color: 'inherit',
        },
    }
}));

const needsToBeOpened = (location: any, item: any) =>
    location && isUrlInChildren(item, location.pathname);

const isUrlInChildren = (parent: any, url: any): boolean => {
    if (!parent.children)
        return false;

    for (let i = 0; i < parent.children.length; i += 1) {
        if (parent.children[i].children) {
            if (isUrlInChildren(parent.children[i], url))
                return true;
        }

        if (parent.children[i].url === url || url.includes(parent.children[i].url))
            return true;
    }

    return false;
}

const MasraffNavVerticalCollapse = (props: any) => {
    // console.log('props: ', props);
    const [open, setOpen] = useState(() => needsToBeOpened(props.location, props.item));
    const {item, nestedLevel, onItemClick} = props;
    const itempadding = nestedLevel > 0 ? 38 + nestedLevel * 16 : 16;

    const location = useLocation();

    useEffect(() => {
        if (needsToBeOpened(location, props.item)) {
            if (!open) {
                setOpen(true);
            }
        }
    }, [location, props.item, open]);

    return useMemo(
        () => (
            <Root className={clsx(open && 'open')} itempadding={itempadding} sx={item.sx}>
                <ListItemButton
                    component={item.url ? NavLinkAdapter : 'li'}
                    // button
                    className="masraff-list-item"
                    onClick={() => setOpen(!open)}
                    to={item.url}
                    end={item.end}
                    // role="button"
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
                            secondary:
                                'text-11 font-medium masraff-list-item-text-secondary leading-normal truncate',
                        }}
                    />

                    {item.badge && <MasraffNavBadge className="mx-4" badge={item.badge}/>}

                    <IconButton
                        disableRipple
                        className="w-20 h-20 -mx-12 p-0 focus:bg-transparent hover:bg-transparent"
                        onClick={(ev) => ev.preventDefault()}
                        size="large"
                    >
                        <MasraffSvgIcon size={16} className="arrow-icon" color="inherit">
                            {open ? 'heroicons-solid:chevron-down' : 'heroicons-solid:chevron-right'}
                        </MasraffSvgIcon>
                    </IconButton>
                </ListItemButton>

                {item.children && (
                    <Collapse in={open} className="collapse-children">
                        {item.children.map((_item: any) => (
                            <MasraffNavItem
                                key={_item.id}
                                type={`vertical-${_item.type}`}
                                item={_item}
                                nestedLevel={nestedLevel + 1}
                                onItemClick={onItemClick}
                            />
                        ))}
                    </Collapse>
                )}
            </Root>
        ),
        [
            item.badge,
            item.children,
            item.icon,
            item.iconClass,
            item.title,
            item.url,
            itempadding,
            nestedLevel,
            onItemClick,
            open,
            item.disabled,
            item.end,
            item.subtitle,
            item.sx
        ]
    );
};

const NavVerticalCollapse = MasraffNavVerticalCollapse;

export default NavVerticalCollapse;