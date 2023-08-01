'use client';

import {Suspense} from "react";
import MasraffLoading from "@masraff/core/MasraffLoading";

const defaultProps = {
    loadingProps: {
        delay: 0,
    }
}

const MasraffSuspense = (props: any) => {
    props = { ...defaultProps, ...props };

    return (
        <Suspense
            fallback={<MasraffLoading {...props.loadingProps} />}>{props.children}</Suspense>
    )
}

export default MasraffSuspense;