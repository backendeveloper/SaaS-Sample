import React, {Component, memo, useMemo, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import {
    Divider,
    IconButton,
    Input,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
    Typography
} from "@mui/material";
import {amber} from "@mui/material/colors";
import clsx from "clsx";
import MasraffSvgIcon from "@masraff/core/MasraffSvgIcon";

const MasraffShortcuts = (props: any) => {
    const {navigation, shortcuts, onChange} = props;

    const searchInputRef = useRef(null);
    const [addMenu, setAddMenu] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([])
    const shortcutItems = shortcuts
        ? shortcuts.map((id: any) => navigation.find((item: any) => item.id === id))
        : [];

    const addMenuClick = (event: any) => {
        setAddMenu(event.currentTarget);
    };

    const addMenuClose = () => {
        setAddMenu(null);
    };

    const search = (ev: any) => {
        const newSearchText = ev.target.value;

        setSearchText(newSearchText);

        if (newSearchText.length !== 0 && navigation) {
            setSearchResults(
                navigation.filter((item: any) => item.title.toLowerCase().includes(newSearchText.toLowerCase()))
            );
            return;
        }
        setSearchResults([]);
    };

    const toggleInShortcuts = (id: any) => {
        let newShortcuts = [...shortcuts];
        newShortcuts = newShortcuts.includes(id)
            ? newShortcuts.filter((_id) => id !== _id)
            : [...newShortcuts, id];
        onChange(newShortcuts);
    };

    class ShortcutMenuItem extends Component<any> {
        render() {
            let {item, onToggle} = this.props;
            if (!item || !item.id) {
                return null;
            }

            return (
                <Link to={item.url || ''} role="button">
                    <MenuItem key={item.id}>
                        <ListItemIcon className="min-w-40">
                            {item.icon ? (
                                <MasraffSvgIcon>{item.icon}</MasraffSvgIcon>
                            ) : (
                                <span className="text-20 font-semibold uppercase text-center">{item.title[0]}</span>
                            )}
                        </ListItemIcon>
                        <ListItemText primary={item.title}/>
                        <IconButton
                            onClick={(ev) => {
                                ev.preventDefault();
                                ev.stopPropagation();
                                onToggle(item.id);
                            }}
                            size="large"
                        >
                            <MasraffSvgIcon color="action">
                                {shortcuts.includes(item.id) ? 'heroicons-solid:star' : 'heroicons-outline:star'}
                            </MasraffSvgIcon>
                        </IconButton>
                    </MenuItem>
                </Link>
            );
        }
    }

    return (
        <div
            className={clsx(
                'flex flex-1',
                props.variant === 'vertical' && 'flex-col grow-0 shrink',
                props.className
            )}
        >
            {useMemo(() => {
                const container = {
                    show: {
                        transition: {
                            staggerChildren: 0.1,
                        },
                    },
                };
                const item = {
                    hidden: {opacity: 0, scale: 0.6},
                    show: {opacity: 1, scale: 1},
                };
                return (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className={clsx('flex flex-1', props.variant === 'vertical' && 'flex-col')}
                    >
                        {shortcutItems.map(
                            (_item: any) =>
                                _item && (
                                    <Link to={_item.url} key={_item.id} role="button">
                                        <Tooltip
                                            title={_item.title}
                                            placement={props.variant === 'horizontal' ? 'bottom' : 'left'}
                                        >
                                            <IconButton
                                                className="w-40 h-40 p-0"
                                                component={motion.div}
                                                variants={item}
                                                size="large"
                                            >
                                                {_item.icon ? (
                                                    <MasraffSvgIcon>{_item.icon}</MasraffSvgIcon>
                                                ) : (
                                                    <span
                                                        className="text-20 font-semibold uppercase">{_item.title[0]}</span>
                                                )}
                                            </IconButton>
                                        </Tooltip>
                                    </Link>
                                )
                        )}

                        <Tooltip
                            title="Click to add/remove shortcut"
                            placement={props.variant === 'horizontal' ? 'bottom' : 'left'}
                        >
                            <IconButton
                                component={motion.div}
                                variants={item}
                                aria-haspopup="true"
                                className="w-40 h-40 p-0"
                                onClick={addMenuClick}
                                size='large'>
                                <MasraffSvgIcon sx={{color: amber[600]}}>heroicons-solid:star</MasraffSvgIcon>
                            </IconButton>
                        </Tooltip>
                    </motion.div>
                );
            }, [props.variant, shortcutItems])}

            <Menu
                id="add-menu"
                anchorEl={addMenu}
                open={Boolean(addMenu)}
                onClose={addMenuClose}
                classes={{
                    paper: 'min-w-256',
                }}
                TransitionProps={{
                    onEntered: () => {
                        // @ts-ignore
                        searchInputRef.current.focus();
                    },
                    onExited: () => {
                        setSearchText('');
                    },
                }}
            >
                <div className="p-16 pt-8">
                    <Input
                        inputRef={searchInputRef}
                        value={searchText}
                        onChange={search}
                        placeholder="Search for an app or page"
                        className=""
                        fullWidth
                        inputProps={{
                            'aria-label': 'Search',
                        }}
                        disableUnderline
                    />
                </div>

                <Divider/>

                {searchText.length !== 0 &&
                    searchResults && searchResults.map((_item: any) => (
                        <ShortcutMenuItem
                            key={_item.id}
                            item={_item}
                            onToggle={() => toggleInShortcuts(_item.id)}
                        />
                    ))}

                {searchText.length !== 0 && searchResults?.length === 0 && (
                    <Typography color="text.secondary" className="p-16 pb-8">
                        No results..
                    </Typography>
                )}

                {searchText.length === 0 &&
                    shortcutItems.map(
                        (_item: any) =>
                            _item && (
                                <ShortcutMenuItem
                                    key={_item.id}
                                    item={_item}
                                    onToggle={() => toggleInShortcuts(_item.id)}
                                />
                            )
                    )}
            </Menu>
        </div>
    );
};

export default memo(MasraffShortcuts);