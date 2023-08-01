'use client';

import {forwardRef} from "react";
import { NavLink as BaseNavLink } from 'react-router-dom';

const NavLinkAdapter = forwardRef(({ activeClassName, activeStyle, ...props }: any, ref) => {
    return (
        <BaseNavLink
            ref={ref as any}
            {...props}
            className={({ isActive }) =>
                [props.className, isActive ? activeClassName : null].filter(Boolean).join(' ')
            }
            style={({ isActive }) => ({
                ...props.style,
                ...(isActive ? activeStyle : null),
            })}
        />
    );
});

export default NavLinkAdapter;