import {styled} from "@mui/material/styles";
import {List} from "@mui/material";
import clsx from "clsx";
import MasraffNavItem from "@masraff/core/MasraffNavigation/MasraffNavItem";

const StyledList = styled(List)(({ theme }) => ({
    '& .masraff-list-item': {
        '&:hover': {
            backgroundColor:
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,.04)',
        },
        '&:focus:not(.active)': {
            backgroundColor:
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0,0,0,.05)',
        },
    },
    '& .masraff-list-item-text': {
        margin: 0,
    },
    '& .masraff-list-item-text-primary': {
        lineHeight: '20px',
    },
    '&.active-square-list': {
        '& .masraff-list-item, & .active.masraff-list-item': {
            width: '100%',
            borderRadius: '0',
        },
    },
    '&.dense': {
        '& .masraff-list-item': {
            paddingTop: 0,
            paddingBottom: 0,
            height: 32,
        },
    },
}));

const MasraffNavVerticalLayout1 = (props: any) => {
    const { navigation, active, dense, className, onItemClick } = props;
    const handleItemClick = (item: any) => onItemClick?.(item);

    return (
        <StyledList
            className={clsx(
                'navigation whitespace-nowrap px-12 py-0',
                `active-${active}-list`,
                dense && 'dense',
                className
            )}
        >
            {navigation.map((navigationItem: any) => (
                <MasraffNavItem
                    key={navigationItem.id}
                    type={`vertical-${navigationItem.type}`}
                    item={navigationItem}
                    nestedLevel={0}
                    onItemClick={handleItemClick}
                />
            ))}
        </StyledList>
    );
};

export default MasraffNavVerticalLayout1;