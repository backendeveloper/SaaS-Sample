'use client';

import {styled, useTheme} from "@mui/material/styles";
import {List} from "@mui/material";
import clsx from "clsx";
import MasraffNavVerticalTab from "@masraff/core/MasraffNavigation/vertical/types/MasraffNavVerticalTab";

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
    '& .masraff-list-item-text-primary': {
        lineHeight: '1',
    },
    '&.active-square-list': {
        '& .masraff-list-item, & .active.masraff-list-item': {
            width: '100%',
            borderRadius: '0',
        },
    },
    '&.dense': {},
}));

const MasraffNavVerticalLayout2 = (props: any) => {
    const { navigation, layout, active, dense, className, onItemClick, firstLevel, selectedId } =
        props;
    const theme = useTheme();

    const handleItemClick = (item: any) => {
        onItemClick?.(item);
    };

    return (
        <StyledList
            className={clsx(
                'navigation whitespace-nowrap items-center flex flex-col',
                `active-${active}-list`,
                dense && 'dense',
                className
            )}
        >
            {navigation.map((_item: any) => (
                <MasraffNavVerticalTab
                    key={_item.id}
                    type={`vertical-${_item.type}`}
                    item={_item}
                    nestedLevel={0}
                    onItemClick={handleItemClick}
                    firstLevel={firstLevel}
                    dense={dense}
                    selectedId={selectedId}
                />
            ))}
        </StyledList>
    );
};

export default MasraffNavVerticalLayout2;