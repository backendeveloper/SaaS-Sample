import {useState} from "react";
import {useSelector} from "react-redux";
import {Link, NavLink} from 'react-router-dom';
import {Avatar, Button, ListItemIcon, ListItemText, MenuItem, Popover, Typography} from "@mui/material";
import MasraffSvgIcon from "@masraff/core/MasraffSvgIcon";
import {selectUser} from "app/store/userSlice";

const UserMenu = (props: any) => {
    const user = useSelector(selectUser);
    const [userMenu, setUserMenu] = useState(null);

    const userMenuClick = (event: any) => {
        setUserMenu(event.currentTarget);
    };

    const userMenuClose = () => {
        setUserMenu(null);
    };

    return (
        <>
            <Button
                className="min-h-40 min-w-40 px-0 md:px-16 py-0 md:py-6"
                onClick={userMenuClick}
                color="inherit"
            >
                <div className="hidden md:flex flex-col mx-4 items-end">
                    <Typography component="span" className="font-semibold flex">
                        {user.data.displayName}
                    </Typography>
                    <Typography className="text-11 font-medium capitalize" color="text.secondary">
                        {user.role.toString()}
                        {(!user.role || (Array.isArray(user.role) && user.role.length === 0)) && 'Guest'}
                    </Typography>
                </div>

                {user.data.photoURL ? (
                    <Avatar className="md:mx-4" alt="user photo" src={user.data.photoURL}/>
                ) : (
                    <Avatar className="md:mx-4">{user.data.displayName[0]}</Avatar>
                )}
            </Button>

            <Popover
                open={Boolean(userMenu)}
                anchorEl={userMenu}
                onClose={userMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                classes={{
                    paper: 'py-8',
                }}
            >
                {!user.role || user.role.length === 0 ? (
                    <>
                        <MenuItem component={Link} to="/sign-in" role="button">
                            <ListItemIcon className="min-w-40">
                                <MasraffSvgIcon>heroicons-outline:lock-closed</MasraffSvgIcon>
                            </ListItemIcon>
                            <ListItemText primary="Sign In"/>
                        </MenuItem>
                        <MenuItem component={Link} to="/sign-up" role="button">
                            <ListItemIcon className="min-w-40">
                                <MasraffSvgIcon>heroicons-outline:user-add </MasraffSvgIcon>
                            </ListItemIcon>
                            <ListItemText primary="Sign up"/>
                        </MenuItem>
                    </>
                ) : (
                    <>
                        <MenuItem component={Link} to="/apps/profile" onClick={userMenuClose} role="button">
                            <ListItemIcon className="min-w-40">
                                <MasraffSvgIcon>heroicons-outline:user-circle</MasraffSvgIcon>
                            </ListItemIcon>
                            <ListItemText primary="My Profile"/>
                        </MenuItem>
                        <MenuItem component={Link} to="/apps/mailbox" onClick={userMenuClose} role="button">
                            <ListItemIcon className="min-w-40">
                                <MasraffSvgIcon>heroicons-outline:mail-open</MasraffSvgIcon>
                            </ListItemIcon>
                            <ListItemText primary="Inbox"/>
                        </MenuItem>
                        <MenuItem
                            component={NavLink}
                            to="/sign-out"
                            onClick={() => {
                                userMenuClose();
                            }}
                        >
                            <ListItemIcon className="min-w-40">
                                <MasraffSvgIcon>heroicons-outline:logout</MasraffSvgIcon>
                            </ListItemIcon>
                            <ListItemText primary="Sign out"/>
                        </MenuItem>
                    </>
                )}
            </Popover>
        </>
    );
};

export default UserMenu;