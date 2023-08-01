'use client';

// import MobileDetect from 'mobile-detect';
// import history from '@history';
import {connect} from 'react-redux';
import {createRef, forwardRef, useCallback, useEffect, useRef} from "react";
import {styled} from "@mui/material/styles";
import withRouterAndRef from "@masraff/core/withRouterAndRef";
import PerfectScrollbar from "perfect-scrollbar";

const Root = styled('div')(({theme}) => ({
    overscrollBehavior: 'contain',
    minHeight: '100%',
}));

// const md = new MobileDetect(window.navigator.userAgent);
// const isMobile = md.mobile();
const isMobile = false;

const handlerNameByEvent = {
    'ps-scroll-y': 'onScrollY',
    'ps-scroll-x': 'onScrollX',
    'ps-scroll-up': 'onScrollUp',
    'ps-scroll-down': 'onScrollDown',
    'ps-scroll-left': 'onScrollLeft',
    'ps-scroll-right': 'onScrollRight',
    'ps-y-reach-start': 'onYReachStart',
    'ps-y-reach-end': 'onYReachEnd',
    'ps-x-reach-start': 'onXReachStart',
    'ps-x-reach-end': 'onXReachEnd',
};
Object.freeze(handlerNameByEvent);

const defaultProps = {
    className: '',
    enable: true,
    scrollToTopOnChildChange: false,
    scrollToTopOnRouteChange: false,
    option: {
        wheelPropagation: true,
    },
    ref: undefined,
    onScrollY: undefined,
    onScrollX: undefined,
    onScrollUp: undefined,
    onScrollDown: undefined,
    onScrollLeft: undefined,
    onScrollRight: undefined,
    onYReachStart: undefined,
    onYReachEnd: undefined,
    onXReachStart: undefined,
    onXReachEnd: undefined
}

const MasraffScrollbars = forwardRef((props: any, ref) => {
    props = {...defaultProps, ...props};
    ref = ref || createRef();
    const ps = useRef(null);
    const handlerByEvent = useRef(new Map());

    const {customScrollbars} = props;

    const hookUpEvents = useCallback(() => {
        Object.keys(handlerNameByEvent).forEach((key) => {
            // @ts-ignore
            const callback = props[handlerNameByEvent[key]];
            if (callback) {
                // @ts-ignore
                const handler = () => callback(ref.current);
                handlerByEvent.current.set(key, handler);
                // @ts-ignore
                ref.current.addEventListener(key, handler, false);
            }
        });
    }, [ref]);

    const unHookUpEvents = useCallback(() => {
        handlerByEvent.current.forEach((value, key) => {
            // @ts-ignore
            if (ref.current) {
                // @ts-ignore
                ref.current.removeEventListener(key, value, false);
            }
        });
        handlerByEvent.current.clear();
    }, [ref]);

    const destroyPs = useCallback(() => {
        // console.info("destroy::ps");

        unHookUpEvents();

        if (!ps.current) {
            return;
        }
        // @ts-ignore
        ps.current.destroy();
        ps.current = null;
    }, [unHookUpEvents]);

    const createPs = useCallback(() => {
        // console.info("create::ps");

        if (isMobile || !ref || ps.current) {
            return;
        }

        // @ts-ignore
        ps.current = new PerfectScrollbar(ref.current, props.option);

        hookUpEvents();
    }, [hookUpEvents, props.option, ref]);

    useEffect(() => {
        function updatePs() {
            if (!ps.current) {
                return;
            }
            // @ts-ignore
            ps.current.update();
        }

        updatePs();
    });

    useEffect(() => {
        if (customScrollbars) {
            createPs();
        } else {
            destroyPs();
        }
    }, [createPs, customScrollbars, destroyPs]);

    const scrollToTop = useCallback(() => {
        // @ts-ignore
        if (ref && ref.current) {
            // @ts-ignore
            ref.current.scrollTop = 0;
        }
    }, [ref]);

    useEffect(() => {
        // @ts-ignore
        if (props.scrollToTopOnChildChange) {
            scrollToTop();
        }
        // @ts-ignore
    }, [scrollToTop, props.children, props.scrollToTopOnChildChange]);

    // useEffect(
    //     () =>
    //         // @ts-ignore
    //         history.listen(() => {
    //             // @ts-ignore
    //             if (props.scrollToTopOnRouteChange) {
    //                 scrollToTop();
    //             }
    //         }),
    //     // @ts-ignore
    //     [scrollToTop, props.scrollToTopOnRouteChange]
    // );

    useEffect(
        () => () => {
            destroyPs();
        },
        [destroyPs]
    );

    // console.info('render::ps');
    return (
        <Root
            id={props.id}
            className={props.className}
            style={
                props.customScrollbars && (props.enable || true) && !isMobile
                    ? {
                        position: 'relative',
                        overflow: 'hidden!important',
                    }
                    : {}
            }
            ref={ref as any}
        >
            {props.children}
        </Root>
    );
});

const mapStateToProps = ({masraff}: any) => ({
    customScrollbars: masraff.settings.current.customScrollbars,
});

export default connect(mapStateToProps, null, null, {forwardRef: true})(MasraffScrollbars);