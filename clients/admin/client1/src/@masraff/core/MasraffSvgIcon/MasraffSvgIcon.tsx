'use client';

import {forwardRef, useMemo} from "react";
import {Box, Icon} from "@mui/material";
import clsx from "clsx";
import {styled} from "@mui/material/styles";

const Root = styled(Box)(({ theme, ...props }: any): any => {
    return ({
        width: props.size,
        height: props.size,
        minWidth: props.size,
        minHeight: props.size,
        fontSize: props.size,
        lineHeight: props.size,
        color: {
            primary: theme.palette.primary.main,
            secondary: theme.palette.secondary.main,
            info: theme.palette.info.main,
            success: theme.palette.success.main,
            warning: theme.palette.warning.main,
            action: theme.palette.action.active,
            error: theme.palette.error.main,
            disabled: theme.palette.action.disabled,
            inherit: undefined,
        },
    });
});

const defaultProps = {
    children: '',
    size: 24,
    sx: {},
    color: 'inherit',
}

const MasraffSvgIcon = forwardRef((props: any, ref: any) => {
    props = { ...defaultProps, ...props };
    const { children, size, sx, className, color }: any = props;
    const iconPath = props.children.replace(':', '.svg#');

    return useMemo(
        () => (
            <>
                {!props.children.includes(':') ? (
                    <Icon ref={ref} {...props} />
                ) : (
                    <Root
                        {...props}
                        component="svg"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 100 100"
                        className={clsx('shrink-0 fill-current ', className)}
                        ref={ref}
                        size={size}
                        sx={sx}
                        color={color}
                    >
                        <use xlinkHref={`assets/icons/${iconPath}`} />
                    </Root>
                )}
            </>
        ),
        [children, ref, className, size, sx, color, iconPath]
    );
});

export default MasraffSvgIcon;