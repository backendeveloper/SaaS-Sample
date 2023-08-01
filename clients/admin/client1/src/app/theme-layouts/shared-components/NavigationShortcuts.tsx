'use client';

import {useDispatch, useSelector} from "react-redux";
import {selectUserShortcuts, updateUserShortcuts} from "app/store/userSlice";
import {selectFlatNavigation} from "app/store/masraff/navigationSlice";
import MasraffShortcuts from "@masraff/core/MasraffShortcuts/MasraffShortcuts";

const NavigationShortcuts = (props: any) => {
    const { variant, className } = props;
    const dispatch = useDispatch();
    const shortcuts = useSelector(selectUserShortcuts) || [];
    const navigation = useSelector(selectFlatNavigation);

    const handleShortcutsChange = (newShortcuts: any) => {
        // @ts-ignore
        dispatch(updateUserShortcuts(newShortcuts));
    };

    return (
        <MasraffShortcuts
            className={className}
            variant={variant}
            navigation={navigation}
            shortcuts={shortcuts}
            onChange={handleShortcutsChange}
        />
    );
};

export default NavigationShortcuts;