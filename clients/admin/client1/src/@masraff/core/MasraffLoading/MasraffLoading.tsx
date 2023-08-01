'use client';

import {useState} from "react";
import {Box, Typography} from "@mui/material";
import clsx from "clsx";
import {useTimeout} from "@masraff/hooks";

const defaultProps = {
    delay: false
}

const MasraffLoading = (props: any) => {
    props = { ...defaultProps, ...props };
    const [showLoading, setShowLoading] = useState(!props.delay);

    useTimeout(() => {
        setShowLoading(true);
    }, props.delay);

    return (
        <div
            className={clsx(
                'flex flex-1 flex-col items-center justify-center p-24',
                !showLoading && 'hidden'
            )}
        >
            <Typography className="text-13 sm:text-20 font-medium -mb-16" color="text.secondary">
                Loading
            </Typography>
            <Box
                id="spinner"
                sx={{
                    '& > div': {
                        backgroundColor: 'palette.secondary.main',
                    },
                }}
            >
                <div className="bounce1" />
                <div className="bounce2" />
                <div className="bounce3" />
            </Box>
        </div>
    );
};

export default MasraffLoading;