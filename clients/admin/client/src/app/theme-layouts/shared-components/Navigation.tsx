import {memo, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import clsx from "clsx";
import {useThemeMediaQuery} from "@masraff/hooks";
import {navbarCloseMobile} from "app/store/masraff/navbarSlice";
import {selectNavigation} from "app/store/masraff/navigationSlice";
import MasraffNavigation from "@masraff/core/MasraffNavigation";

const defaultProps = {
    layout: 'vertical'
}

const Navigation = (props: any) => {
    props = {...defaultProps, ...props};
    const navigation = useSelector(selectNavigation);
    const isMobile = useThemeMediaQuery((theme: any) => theme.breakpoints.down('lg'));

    const dispatch = useDispatch();

    return useMemo(() => {
        const handleItemClick = (item: any) => {
            if (isMobile) {
                dispatch(navbarCloseMobile(item));
            }
        };

        return (
            <MasraffNavigation
                className={clsx('navigation', props.className)}
                navigation={navigation}
                layout={props.layout}
                dense={props.dense}
                active={props.active}
                onItemClick={handleItemClick}
            />
        );
    }, [dispatch, isMobile, navigation, props.active, props.className, props.dense, props.layout]);
};

export default memo(Navigation);