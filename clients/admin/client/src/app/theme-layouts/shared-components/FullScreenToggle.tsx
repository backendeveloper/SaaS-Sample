import {useEffect, useLayoutEffect, useState} from "react";
import {IconButton, Tooltip} from "@mui/material";
import clsx from "clsx";
import MasraffSvgIcon from "@masraff/core/MasraffSvgIcon";

const useEnhancedEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const HeaderFullScreenToggle = (props: any) => {
    const [isFullScreen, setIsFullScreen] = useState(false);

    const getBrowserFullscreenElementProp = () => {
        if (typeof document.fullscreenElement !== 'undefined') {
            return 'fullscreenElement';
        }
        // @ts-ignore
        if (typeof document.mozFullScreenElement !== 'undefined') {
            return 'mozFullScreenElement';
        }
        // @ts-ignore
        if (typeof document.msFullscreenElement !== 'undefined') {
            return 'msFullscreenElement';
        }
        // @ts-ignore
        if (typeof document.webkitFullscreenElement !== 'undefined') {
            return 'webkitFullscreenElement';
        }
        throw new Error('fullscreenElement is not supported by this browser');
    };

    useEnhancedEffect(() => {
        // @ts-ignore
        document.onfullscreenchange = () => setIsFullScreen(document[getBrowserFullscreenElementProp()] != null);

        return () => {
            // @ts-ignore
            document.onfullscreenchange = undefined;
        };
    });


    /* View in fullscreen */
    const openFullscreen = () => {
        const elem = document.documentElement;

        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else { // @ts-ignore
            if (elem.mozRequestFullScreen) {
                /* Firefox */
                // @ts-ignore
                elem.mozRequestFullScreen();
                // @ts-ignore
            } else if (elem.webkitRequestFullscreen) {
                /* Chrome, Safari and Opera */
                // @ts-ignore
                elem.webkitRequestFullscreen();
                // @ts-ignore
            } else if (elem.msRequestFullscreen) {
                /* IE/Edge */
                // @ts-ignore
                elem.msRequestFullscreen();
            }
        }
    };

    /* Close fullscreen */
    const closeFullscreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            // @ts-ignore
        } else if (document.mozCancelFullScreen) {
            /* Firefox */
            // @ts-ignore
            document.mozCancelFullScreen();
            // @ts-ignore
        } else if (document.webkitExitFullscreen) {
            /* Chrome, Safari and Opera */
            // @ts-ignore
            document.webkitExitFullscreen();
            // @ts-ignore
        } else if (document.msExitFullscreen) {
            /* IE/Edge */
            // @ts-ignore
            document.msExitFullscreen();
        }
    };

    const toggleFullScreen = () => {
        // @ts-ignore
        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
            closeFullscreen();
        } else {
            openFullscreen();
        }
    };

    return (
        <Tooltip title="Fullscreen toggle" placement="bottom">
            <IconButton
                onClick={toggleFullScreen}
                className={clsx('w-40 h-40', props.className)}
                size="large"
            >
                <MasraffSvgIcon>heroicons-outline:arrows-expand</MasraffSvgIcon>
            </IconButton>
        </Tooltip>
    );
};

export default HeaderFullScreenToggle;