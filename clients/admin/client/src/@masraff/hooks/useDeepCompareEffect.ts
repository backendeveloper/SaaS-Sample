import {useEffect, useRef} from "react";
import deepEqual from 'lodash/isEqual';

const checkDeps = (deps: any) => {
    if (!deps || !deps.length) {
        throw new Error(
            'useDeepCompareEffect should not be used with no dependencies. Use React.useEffect instead.'
        );
    }
    if (deps.every(isPrimitive)) {
        throw new Error(
            'useDeepCompareEffect should not be used with dependencies that are all primitive values. Use React.useEffect instead.'
        );
    }
};

const isPrimitive = (val: any) => {
    return val == null || /^[sbn]/.test(typeof val);
};

const useDeepCompareMemoize = (value: any) => {
    const ref = useRef();

    if (!deepEqual(value, ref.current)) {
        ref.current = value;
    }

    return ref.current;
};

const useDeepCompareEffect = (callback: any, dependencies: any) => {
    if (process.env.NODE_ENV !== 'production') {
        checkDeps(dependencies);
    }
    useEffect(callback, useDeepCompareMemoize(dependencies));
};

export const useDeepCompareEffectNoCheck = (callback: any, dependencies: any) => {
    useEffect(callback, useDeepCompareMemoize(dependencies));
};

export default useDeepCompareEffect;