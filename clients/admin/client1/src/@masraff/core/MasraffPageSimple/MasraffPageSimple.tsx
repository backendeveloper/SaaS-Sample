import {styled} from "@mui/material/styles";
import {forwardRef, memo, useImperativeHandle, useRef} from "react";
import GlobalStyles from "@mui/material/GlobalStyles";
import clsx from "clsx";

const Root = styled('div')(({ theme, ...props }: any) => ({
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: '100%',
    position: 'relative',
    flex: '1 1 auto',
    width: '100%',
    height: 'auto',
    backgroundColor: theme.palette.background.default,

    '&.MasraffPageSimple-scroll-content': {
        height: '100%',
    },

    '& .MasraffPageSimple-wrapper': {
        display: 'flex',
        flexDirection: 'row',
        flex: '1 1 auto',
        zIndex: 2,
        minWidth: 0,
        height: '100%',
        backgroundColor: theme.palette.background.default,

        ...(props.scroll === 'content' && {
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            overflow: 'hidden',
        }),
    },

    '& .MasraffPageSimple-header': {
        display: 'flex',
        flex: '0 0 auto',
        backgroundSize: 'cover',
    },

    '& .MasraffPageSimple-topBg': {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: headerHeight,
        pointerEvents: 'none',
    },

    '& .MasraffPageSimple-contentWrapper': {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        flex: '1 1 auto',
        overflow: 'hidden',
        //    WebkitOverflowScrolling: 'touch',
        zIndex: 9999,
    },

    '& .MasraffPageSimple-toolbar': {
        height: toolbarHeight,
        minHeight: toolbarHeight,
        display: 'flex',
        alignItems: 'center',
    },

    '& .MasraffPageSimple-content': {
        display: 'flex',
        flex: '1 1 auto',
        alignItems: 'start',
        minHeight: 0,
        overflowY: 'auto',
    },

    '& .MasraffPageSimple-sidebarWrapper': {
        overflow: 'hidden',
        backgroundColor: 'transparent',
        position: 'absolute',
        '&.permanent': {
            [theme.breakpoints.up('lg')]: {
                position: 'relative',
                marginLeft: 0,
                marginRight: 0,
                transition: theme.transitions.create('margin', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                '&.closed': {
                    transition: theme.transitions.create('margin', {
                        easing: theme.transitions.easing.easeOut,
                        duration: theme.transitions.duration.enteringScreen,
                    }),

                    '&.MasraffPageSimple-leftSidebar': {
                        marginLeft: -props.leftsidebarwidth,
                    },
                    '&.MasraffPageSimple-rightSidebar': {
                        marginRight: -props.rightsidebarwidth,
                    },
                },
            },
        },
    },

    '& .MasraffPageSimple-sidebar': {
        position: 'absolute',
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,

        '&.permanent': {
            [theme.breakpoints.up('lg')]: {
                position: 'relative',
            },
        },
        maxWidth: '100%',
        height: '100%',
    },

    '& .MasraffPageSimple-leftSidebar': {
        width: props.leftsidebarwidth,

        [theme.breakpoints.up('lg')]: {
            borderRight: `1px solid ${theme.palette.divider}`,
            borderLeft: 0,
        },
    },

    '& .MasraffPageSimple-rightSidebar': {
        width: props.rightsidebarwidth,

        [theme.breakpoints.up('lg')]: {
            borderLeft: `1px solid ${theme.palette.divider}`,
            borderRight: 0,
        },
    },

    '& .MasraffPageSimple-sidebarHeader': {
        height: headerHeight,
        minHeight: headerHeight,
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
    },

    '& .MasraffPageSimple-sidebarHeaderInnerSidebar': {
        backgroundColor: 'transparent',
        color: 'inherit',
        height: 'auto',
        minHeight: 'auto',
    },

    '& .MasraffPageSimple-sidebarContent': {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
    },

    '& .MasraffPageSimple-backdrop': {
        position: 'absolute',
    },
}));

const headerHeight = 120;
const toolbarHeight = 64;

const defaultProps = {
    classes: {},
    scroll: 'page',
    leftSidebarOpen: false,
    rightSidebarOpen: false,
    rightSidebarWidth: 240,
    leftSidebarWidth: 240
}

const MasraffPageSimple = forwardRef((props: any, ref: any) => {
    // console.info("render::MasraffPageSimple");
    props = { ...defaultProps, ...props };
    const leftSidebarRef = useRef(null);
    const rightSidebarRef = useRef(null);
    const rootRef = useRef(null);

    useImperativeHandle(ref, () => ({
        rootRef,
        toggleLeftSidebar: (val: any) => {
            // @ts-ignore
            leftSidebarRef.current.toggleSidebar(val);
        },
        toggleRightSidebar: (val: any) => {
            // @ts-ignore
            rightSidebarRef.current.toggleSidebar(val);
        },
    }));

    return (
        <>
            <GlobalStyles
                styles={(theme) => ({
                    ...(props.scroll !== 'page' && {
                        '#masraff-toolbar': {
                            position: 'static',
                        },
                        '#masraff-footer': {
                            position: 'static',
                        },
                    }),
                    ...(props.scroll === 'page' && {
                        '#masraff-toolbar': {
                            position: 'sticky',
                            top: 0,
                        },
                        '#masraff-footer': {
                            position: 'sticky',
                            bottom: 0,
                        },
                    }),
                })}
            />
            <Root
                className={clsx(
                    'MasraffPageSimple-root',
                    `MasraffPageSimple-scroll-${props.scroll}`,
                    props.className
                )}
                ref={rootRef}
                scroll={props.scroll}
                leftsidebarwidth={props.leftSidebarWidth}
                rightsidebarwidth={props.rightSidebarWidth}
            >
                <div className="flex flex-auto flex-col z-10 h-full">
                    <div className="MasraffPageSimple-wrapper">
                        {props.leftSidebarContent}
                        <div
                            className="MasraffPageSimple-contentWrapper"
                            // enable={props.scroll === 'page'}
                        >
                            {/*{props.header && <MasraffPageSimpleHeader header={props.header} />}*/}
                            {props.content}
                        </div>

                        {props.rightSidebarContent}
                    </div>
                </div>
            </Root>
        </>
    );
});

export default memo(styled(MasraffPageSimple)``);