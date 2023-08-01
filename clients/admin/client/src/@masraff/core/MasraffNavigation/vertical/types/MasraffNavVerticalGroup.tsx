import {useMemo} from "react";
import {alpha, styled} from "@mui/material/styles";
import {ListItemButton, ListItemText} from "@mui/material";
import clsx from "clsx";
import NavLinkAdapter from "@masraff/core/NavLinkAdapter";
import MasraffNavItem from "@masraff/core/MasraffNavigation/MasraffNavItem";

const Root = styled(ListItemButton as any)(({theme, itemPadding, ...props}: any) => ({
    minHeight: 44,
    width: '100%',
    borderRadius: '6px',
    margin: '28px 0 0 0',
    paddingRight: 16,
    paddingLeft: props.itempadding > 80 ? 80 : props.itempadding,
    paddingTop: 10,
    paddingBottom: 10,
    color: alpha(theme.palette.text.primary, 0.7),
    fontWeight: 600,
    letterSpacing: '0.025em',
}));

const MasraffNavVerticalGroup = (props: any) => {
    const {item, nestedLevel, onItemClick} = props;

    const itempadding = nestedLevel > 0 ? 38 + nestedLevel * 16 : 16;

    return useMemo(
        () => (
            <>
                <Root
                    component={item.url ? NavLinkAdapter : 'li'}
                    itempadding={itempadding}
                    className={clsx(
                        'masraff-list-subheader flex items-center  py-10',
                        !item.url && 'cursor-default'
                    )}
                    onClick={() => onItemClick && onItemClick(item)}
                    to={item.url}
                    end={item.end}
                    role="button"
                    sx={item.sx}
                    disabled={item.disabled}
                >
                    <ListItemText
                        className="masraff-list-subheader-text"
                        sx={{
                            margin: 0,
                            '& > .MuiListItemText-primary': {
                                fontSize: 12,
                                color: 'secondary.light',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '.05em',
                                lineHeight: '20px',
                            },

                            '& > .MuiListItemText-secondary': {
                                fontSize: 11,
                                color: 'text.disabled',
                                letterSpacing: '.06px',
                                fontWeight: 500,
                                lineHeight: '1.5',
                            },
                        }}
                        primary={item.title}
                        secondary={item.subtitle}
                    />
                </Root>
                {item.children && (
                    <>
                        {item.children.map((_item: any) => (
                            <MasraffNavItem
                                key={_item.id}
                                type={`vertical-${_item.type}`}
                                item={_item}
                                nestedLevel={nestedLevel}
                                onItemClick={onItemClick}
                            />
                        ))}
                    </>
                )}
            </>
        ),
        [item, itempadding, nestedLevel, onItemClick]
    );
};

const NavVerticalGroup = MasraffNavVerticalGroup;

export default NavVerticalGroup;