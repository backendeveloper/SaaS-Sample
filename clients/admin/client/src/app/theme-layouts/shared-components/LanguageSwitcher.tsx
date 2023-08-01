import {useDispatch, useSelector} from "react-redux";
import {useState} from "react";
import {changeLanguage, selectCurrentLanguage, selectLanguages} from "app/store/i18nSlice";
import {Button, ListItemIcon, ListItemText, MenuItem, Popover, Typography} from "@mui/material";
import {Link} from "react-router-dom";

const LanguageSwitcher = (props: any) => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    const languages = useSelector(selectLanguages);
    const [menu, setMenu] = useState(null);
    const dispatch = useDispatch();

    const langMenuClick = (event: any) => {
        setMenu(event.currentTarget);
    };

    const langMenuClose = () => {
        setMenu(null);
    };

    function handleLanguageChange(lng: any) {
        // @ts-ignore
        dispatch(changeLanguage(lng.id));

        langMenuClose();
    }

    return (
        <>
            <Button className="h-40 w-64" onClick={langMenuClick}>
                <img
                    className="mx-4 min-w-20"
                    src={`assets/images/flags/${currentLanguage.flag}.svg`}
                    alt={currentLanguage.title}
                />

                <Typography className="mx-4 font-semibold uppercase" color="text.secondary">
                    {currentLanguage.id}
                </Typography>
            </Button>

            <Popover
                open={Boolean(menu)}
                anchorEl={menu}
                onClose={langMenuClose}
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
                {languages.map((lng: any) => (
                    <MenuItem key={lng.id} onClick={() => handleLanguageChange(lng)}>
                        <ListItemIcon className="min-w-40">
                            <img
                                className="min-w-20"
                                src={`assets/images/flags/${lng.flag}.svg`}
                                alt={lng.title}
                            />
                        </ListItemIcon>
                        <ListItemText primary={lng.title} />
                    </MenuItem>
                ))}

                <MenuItem
                    component={Link}
                    to="/documentation/configuration/multi-language"
                    onClick={langMenuClose}
                    role="button"
                >
                    <ListItemText primary="Learn More" />
                </MenuItem>
            </Popover>
        </>
    );
};

export default LanguageSwitcher;