import {useEffect, useRef} from "react";

const useTimeout = (callback: any, delay: number | undefined): void => {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        let timer: null | ReturnType<typeof setTimeout> = null

        if (delay && callback && typeof callback === 'function') {
            timer = setTimeout(callbackRef.current, delay || 0);
        }

        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [callback, delay]);
};

export default useTimeout;