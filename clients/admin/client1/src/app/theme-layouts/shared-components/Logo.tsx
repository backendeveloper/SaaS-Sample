'use client';

import {styled} from "@mui/material/styles";
import Image from "next/image";
import logoPath from '@assets/images/logo/logo.svg'

const Root = styled('div')(({theme}) => ({
    '& > .logo-icon': {
        transition: theme.transitions.create(['width', 'height'], {
            duration: theme.transitions.duration.shortest,
            easing: theme.transitions.easing.easeInOut,
        }),
    },
    '& > .badge': {
        transition: theme.transitions.create('opacity', {
            duration: theme.transitions.duration.shortest,
            easing: theme.transitions.easing.easeInOut,
        }),
    },
}));

const Logo = () => (
    <Root className="flex items-center">
        <Image
            className="logo-icon w-32 h-32"
            alt="logo"
            src={logoPath}
        />

        <div
            className="badge flex items-center py-4 px-8 mx-8 rounded"
            style={{backgroundColor: '#121212', color: '#61DAFB'}}
        >
            <img
                className="react-badge"
                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K"
                alt="react"
                width="16"
            />
            <span className="react-text text-12 mx-4">React</span>
        </div>
    </Root>
);

export default Logo;