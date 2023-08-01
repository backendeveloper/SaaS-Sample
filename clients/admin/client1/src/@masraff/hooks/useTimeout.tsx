'use client';

import {useEffect, useRef} from "react";

const useTimeout = (callback: any, delay: any) => {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        let timer = {};

        if (delay && callback && typeof callback === 'function') {
            timer = setTimeout(callbackRef.current, delay || 0);
        }

        return () => {
            if (timer) {
                clearTimeout(timer as any);
            }
        };
    }, [callback, delay]);
};

export default useTimeout;