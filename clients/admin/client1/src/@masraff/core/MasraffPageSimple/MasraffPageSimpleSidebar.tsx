import clsx from 'clsx';
import {forwardRef, useCallback, useEffect, useImperativeHandle, useState} from 'react';
import {Drawer, SwipeableDrawer} from "@mui/material";
import MasraffPageSimpleSidebarContent from "./MasraffPageSimpleSidebarContent";

const defaultProps = {
    open: true
}

const MasraffPageSimpleSidebar = forwardRef((props: any, ref) => {
    props = {...defaultProps, ...props};
    const {open, position, variant, rootRef, sidebarWidth}: any = props;
    const [isOpen, setIsOpen] = useState(open);

    useImperativeHandle(ref, () => ({
        toggleSidebar: handleToggleDrawer,
    }));

    const handleToggleDrawer = useCallback((val: any) => {
        setIsOpen(val);
    }, []);

    useEffect(() => {
        handleToggleDrawer(open);
    }, [handleToggleDrawer, open]);

    let defaultSx = null;
    if (variant === 'permanent')
        defaultSx = {display: {lg: 'none', xs: 'block'}};

    return (
        <>
            <SwipeableDrawer
                variant="temporary"
                anchor={position}
                open={isOpen}
                onOpen={(ev) => {
                }}
                onClose={() => props?.onClose()}
                disableSwipeToOpen
                classes={{
                    root: clsx('MasraffPageSimple-sidebarWrapper', variant),
                    paper: clsx(
                        'MasraffPageSimple-sidebar',
                        variant,
                        position === 'left' ? 'MasraffPageSimple-leftSidebar' : 'MasraffPageSimple-rightSidebar'
                    ),
                }}
                sx={{
                    ...defaultSx,
                    '& .MuiPaper-root': {
                        width: sidebarWidth,
                        maxWidth: '100%',
                    },
                }}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                // container={rootRef.current}
                BackdropProps={{
                    classes: {
                        root: 'MasraffPageSimple-backdrop',
                    },
                }}
                style={{position: 'absolute'}}
            >
                <MasraffPageSimpleSidebarContent {...props} />
            </SwipeableDrawer>

            {variant === 'permanent' && (
                <Drawer
                    sx={{display: {xs: 'none', lg: 'block'}}}
                    variant="permanent"
                    anchor={position}
                    className={clsx(
                        'MasraffPageSimple-sidebarWrapper',
                        variant,
                        isOpen ? 'opened' : 'closed',
                        position === 'left' ? 'MasraffPageSimple-leftSidebar' : 'MasraffPageSimple-rightSidebar'
                    )}
                    open={isOpen}
                    onClose={props?.onClose}
                    classes={{
                        paper: clsx('MasraffPageSimple-sidebar border-0', variant),
                    }}
                >
                    <MasraffPageSimpleSidebarContent {...props} />
                </Drawer>
            )}
        </>
    );
});

export default MasraffPageSimpleSidebar;