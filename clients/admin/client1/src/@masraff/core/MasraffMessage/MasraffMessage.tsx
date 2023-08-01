'use client';

import {memo} from "react";
import {styled} from "@mui/material/styles";
import {IconButton, Snackbar, SnackbarContent, Typography} from "@mui/material";
import {amber, blue, green} from "@mui/material/colors";
import {useDispatch, useSelector} from "react-redux";
import {hideMessage, selectMasraffMessageOptions, selectMasraffMessageState} from "app/store/masraff/messageSlice";
import MasraffSvgIcon from "@masraff/core/MasraffSvgIcon";

const StyledSnackbar = styled(Snackbar)(({ theme, variant }: any) => ({
    '& .MasraffMessage-content': {
        ...(variant === 'success' && {
            backgroundColor: green[600],
            color: '#FFFFFF',
        }),

        ...(variant === 'error' && {
            backgroundColor: theme.palette.error.dark,
            color: theme.palette.getContrastText(theme.palette.error.dark),
        }),

        ...(variant === 'info' && {
            backgroundColor: blue[600],
            color: '#FFFFFF',
        }),

        ...(variant === 'warning' && {
            backgroundColor: amber[600],
            color: '#FFFFFF',
        }),
    },
}));

const variantIcon = {
    success: 'check_circle',
    warning: 'warning',
    error: 'error_outline',
    info: 'info',
};

function MasraffMessage(props: any) {
    const dispatch = useDispatch();
    const state = useSelector(selectMasraffMessageState);
    const options = useSelector(selectMasraffMessageOptions);

    return (
        <StyledSnackbar
            {...options}
            open={state}
            onClose={() => dispatch(hideMessage())}
            ContentProps={{
                variant: 'body2',
                headlineMapping: {
                    body1: 'div',
                    body2: 'div',
                },
            }}
        >
            <SnackbarContent
                className="MasraffMessage-content"
                message={
                    <div className="flex items-center">
                        {variantIcon[options.variant] && (
                            <MasraffSvgIcon color="inherit">{variantIcon[options.variant]}</MasraffSvgIcon>
                        )}
                        <Typography className="mx-8">{options.message}</Typography>
                    </div>
                }
                action={[
                    <IconButton
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        onClick={() => dispatch(hideMessage())}
                        size="large"
                    >
                        <MasraffSvgIcon>heroicons-outline:x</MasraffSvgIcon>
                    </IconButton>,
                ]}
            />
        </StyledSnackbar>
    );
}

export default memo(MasraffMessage);