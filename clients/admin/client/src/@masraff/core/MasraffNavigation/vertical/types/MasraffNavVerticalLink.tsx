import {useMemo} from "react";
import {styled} from "@mui/material/styles";
import {ListItemButton, ListItemText} from "@mui/material";
import clsx from "clsx";
import MasraffSvgIcon from "@masraff/core/MasraffSvgIcon";
import MasraffNavBadge from "@masraff/core/MasraffNavigation/MasraffNavBadge";

const Root = styled(ListItemButton as any)(({theme, ...props}: any) => ({
    minHeight: 44,
    width: '100%',
    borderRadius: '6px',
    margin: '0 0 4px 0',
    paddingRight: 16,
    paddingLeft: props.itempadding > 80 ? 80 : props.itempadding,
    paddingTop: 10,
    paddingBottom: 10,
    '&.active': {
        backgroundColor: `${theme.palette.secondary.main}!important`,
        color: `${theme.palette.secondary.contrastText}!important`,
        pointerEvents: 'none',
        transition: 'border-radius .15s cubic-bezier(0.4,0.0,0.2,1)',
        '& > .masraff-list-item-text-primary': {
            color: 'inherit',
        },
        '& > .masraff-list-item-icon': {
            color: 'inherit',
        },
    },
    '& > .masraff-list-item-icon': {
        marginRight: 16,
    },
    '& > .masraff-list-item-text': {},
    color: theme.palette.text.primary,
    textDecoration: 'none!important',
}));

interface Props {
    location: string;
    item: any;
    nestedLevel: number;
    onItemClick: (item: any) => void;
}

const MasraffNavVerticalLink = (props: Props) => {
    const {item, nestedLevel, onItemClick} = props;

    const itempadding = nestedLevel > 0 ? 38 + nestedLevel * 16 : 16;

    return useMemo(
        () => (
            <Root
                button
                component="a"
                href={item.url}
                target={item.target ? item.target : '_blank'}
                className="masraff-list-item"
                onClick={() => onItemClick && onItemClick(item)}
                role="button"
                itempadding={itempadding}
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

                {item.badge && <MasraffNavBadge badge={item.badge}/>}
            </Root>
        ),
        [item, itempadding, onItemClick]
    );
};

const NavVerticalLink = MasraffNavVerticalLink;

export default NavVerticalLink;