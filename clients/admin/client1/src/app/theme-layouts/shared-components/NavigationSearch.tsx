'use client';

import {selectFlatNavigation} from "app/store/masraff/navigationSlice";
import {useSelector} from "react-redux";
import MasraffSearch from "@masraff/core/MasraffSearch";

function NavigationSearch(props: any) {
    const { variant, className } = props;
    const navigation = useSelector(selectFlatNavigation);

    return <MasraffSearch className={className} variant={variant} navigation={navigation} />;
}

export default NavigationSearch;