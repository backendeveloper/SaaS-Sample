'use client';

import {memo} from "react";
import clsx from "clsx";
import {styled} from "@mui/material/styles";

const Root = styled('div')(({ theme }) => ({
    padding: '0 7px',
    fontSize: 11,
    fontWeight: 600,
    height: 20,
    minWidth: 20,
    borderRadius: 20,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
}));

const MasraffNavBadge = (props: any) => {
    const { className, badge } = props;

    return (
        <Root
            className={clsx('item-badge', className, badge?.classes)}
            style={{
                backgroundColor: badge.bg,
                color: badge.fg,
            }}
        >
            {badge.title}
        </Root>
    );
};

export default memo(MasraffNavBadge);