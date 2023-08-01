'use client';

import {alpha, styled} from "@mui/material/styles";
import {Box, ListItem, ListItemText, Tooltip} from "@mui/material";
import {useDispatch} from "react-redux";
import {usePathname} from "next/navigation";
import {useMemo} from "react";
import NavLinkAdapter from "@masraff/core/NavLinkAdapter";
import clsx from "clsx";
import MasraffSvgIcon from "@masraff/core/MasraffSvgIcon";
import MasraffNavBadge from "@masraff/core/MasraffNavigation/MasraffNavBadge";

const Root = styled(Box)(({ theme }) => ({
    '& > .masraff-list-item': {
        minHeight: 100,
        height: 100,
        width: 100,
        borderRadius: 12,
        margin: '0 0 4px 0',
        color: alpha(theme.palette.text.primary, 0.7),
        cursor: 'pointer',
        textDecoration: 'none!important',
        padding: 0,
        '&.dense': {
            minHeight: 52,
            height: 52,
            width: 52,
        },
        '&.type-divider': {
            padding: 0,
            height: 2,
            minHeight: 2,
            margin: '12px 0',
            backgroundColor:
                theme.palette.mode === 'light'
                    ? 'rgba(0, 0, 0, .05)!important'
                    : 'rgba(255, 255, 255, .1)!important',
            pointerEvents: 'none',
        },
        '&:hover': {
            color: theme.palette.text.primary,
        },
        '&.active': {
            color: theme.palette.text.primary,
            backgroundColor:
                theme.palette.mode === 'light'
                    ? 'rgba(0, 0, 0, .05)!important'
                    : 'rgba(255, 255, 255, .1)!important',
            // pointerEvents: 'none',
            transition: 'border-radius .15s cubic-bezier(0.4,0.0,0.2,1)',
            '& .masraff-list-item-text-primary': {
                color: 'inherit',
            },
            '& .masraff-list-item-icon': {
                color: 'inherit',
            },
        },
        '& .masraff-list-item-icon': {
            color: 'inherit',
        },
        '& .masraff-list-item-text': {},
    },
}));

const MasraffNavVerticalTab = (props: any) => {
    const dispatch = useDispatch();
    const location = usePathname();

    const { item, onItemClick, firstLevel, dense, selectedId } = props;

    return useMemo(
        () => (
            <Root sx={item.sx}>
                <ListItem
                    button
                    component={item.url && NavLinkAdapter}
                    to={item.url}
                    end={item.end}
                    className={clsx(
                        `type-${item.type}`,
                        dense && 'dense',
                        selectedId === item.id && 'active',
                        'masraff-list-item flex flex-col items-center justify-center p-12'
                    )}
                    onClick={() => onItemClick && onItemClick(item)}
                    role="button"
                    disabled={item.disabled}
                >
                    {dense ? (
                        <Tooltip title={item.title || ''} placement="right">
                            <div className="w-32 h-32 min-h-32 flex items-center justify-center relative">
                                {item.icon ? (
                                    <MasraffSvgIcon
                                        className={clsx('masraff-list-item-icon', item.iconClass)}
                                        color="action"
                                    >
                                        {item.icon}
                                    </MasraffSvgIcon>
                                ) : (
                                    item.title && <div className="font-bold text-16">{item.title[0]}</div>
                                )}
                                {item.badge && (
                                    <MasraffNavBadge
                                        badge={item.badge}
                                        className="absolute top-0 ltr:right-0 rtl:left-0 min-w-16 h-16 p-4 justify-center"
                                    />
                                )}
                            </div>
                        </Tooltip>
                    ) : (
                        <>
                            <div className="w-32 h-32 min-h-32 flex items-center justify-center relative mb-8">
                                {item.icon ? (
                                    <MasraffSvgIcon
                                        size={32}
                                        className={clsx('masraff-list-item-icon', item.iconClass)}
                                        color="action"
                                    >
                                        {item.icon}
                                    </MasraffSvgIcon>
                                ) : (
                                    item.title && <div className="font-bold text-20">{item.title[0]}</div>
                                )}
                                {item.badge && (
                                    <MasraffNavBadge
                                        badge={item.badge}
                                        className="absolute top-0 ltr:right-0 rtl:left-0 min-w-16 h-16 p-4 justify-center"
                                    />
                                )}
                            </div>

                            <ListItemText
                                className="masraff-list-item-text grow-0 w-full"
                                primary={item.title}
                                classes={{
                                    primary:
                                        'text-12 font-medium masraff-list-item-text-primary truncate text-center truncate',
                                }}
                            />
                        </>
                    )}
                </ListItem>
                {!firstLevel &&
                    item.children &&
                    item.children.map((_item: any) => (
                        <NavVerticalTab
                            key={_item.id}
                            type={`vertical-${_item.type}`}
                            item={_item}
                            nestedLevel={0}
                            onItemClick={onItemClick}
                            dense={dense}
                            selectedId={selectedId}
                        />
                    ))}
            </Root>
        ),
        [firstLevel, item, onItemClick, dense, selectedId]
    );
};

const NavVerticalTab = MasraffNavVerticalTab;

export default NavVerticalTab;