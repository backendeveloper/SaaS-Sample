import {createRef, forwardRef, useCallback, useEffect, useRef} from "react";
import {connect} from "react-redux";
import {styled} from "@mui/material/styles";
import PerfectScrollbar from "perfect-scrollbar";
import MobileDetect from "mobile-detect";
import withRouterAndRef from "@masraff/core/withRouterAndRef";
import history from '@history';

const Root = styled('div')(({ theme }: any) => ({
    overscrollBehavior: 'contain',
    minHeight: '100%',
}));

const md = new MobileDetect(window.navigator.userAgent);
const isMobile = md.mobile();

interface HandlerByName {
    [key: string]: keyof MasraffScrollbarsProps;
}

const handlerNameByEvent: HandlerByName = {
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

interface MasraffScrollbarsProps {
    id?: string;
    className?: string;
    enable?: boolean;
    scrollToTopOnRouteChange?: boolean;
    scrollToTopOnChildChange?: boolean;
    option?: PerfectScrollbar.Options;
    onScrollY?: (ref: HTMLElement | null) => void;
    onScrollX?: (ref: HTMLElement | null) => void;
    onScrollUp?: (ref: HTMLElement | null) => void;
    onScrollDown?: (ref: HTMLElement | null) => void;
    onScrollLeft?: (ref: HTMLElement | null) => void;
    onScrollRight?: (ref: HTMLElement | null) => void;
    onYReachStart?: (ref: HTMLElement | null) => void;
    onYReachEnd?: (ref: HTMLElement | null) => void;
    onXReachStart?: (ref: HTMLElement | null) => void;
    onXReachEnd?: (ref: HTMLElement | null) => void;
    customScrollbars?: boolean;
}

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

const MasraffScrollbars = forwardRef<HTMLElement, MasraffScrollbarsProps>((props: any, ref: any): any => {
    props = { ...defaultProps, ...props };
    ref = ref || createRef<HTMLElement>();
    const ps = useRef<PerfectScrollbar | null>(null);
    const handlerByEvent = useRef<Map<string, () => void>>(new Map());

    const { customScrollbars } = props;

    const hookUpEvents = useCallback(() => {
        Object.keys(handlerNameByEvent).forEach((key) => {
            const callback = props[handlerNameByEvent[key]];
            if (callback) {
                // @ts-ignore
                const handler = () => callback(ref.current);
                handlerByEvent.current.set(key, handler);
                // @ts-ignore
                ref.current?.addEventListener(key, handler, false);
            }
        });
    }, [props, ref]);

    const unHookUpEvents = useCallback(() => {
        handlerByEvent.current.forEach((value, key) => {
            // @ts-ignore
            ref.current?.removeEventListener(key, value, false);
        });
        handlerByEvent.current.clear();
    }, [ref]);

    const destroyPs = useCallback(() => {
        // console.info("destroy::ps");

        unHookUpEvents();

        if (!ps.current) {
            return;
        }
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
        const updatePs = () => {
            if (!ps.current)
                return;

            ps.current.update();
        };
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
        if (props.scrollToTopOnChildChange)
            scrollToTop();
        // @ts-ignore
    }, [scrollToTop, props.children, props.scrollToTopOnChildChange]);

    useEffect(
        () =>
            history.listen(() => {
                if (props.scrollToTopOnRouteChange) {
                    scrollToTop();
                }
            }),
        [scrollToTop, props.scrollToTopOnRouteChange]
    );

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
            ref={ref}
        >
            {props.children}
        </Root>
    );
});

const mapStateToProps = ({ masraff }: any) => ({
    customScrollbars: masraff.settings.current.customScrollbars,
});

export default connect(mapStateToProps, null, null, { forwardRef: true })(
    withRouterAndRef(MasraffScrollbars)
);