import {createContext, useContext, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import { Auth } from "aws-amplify";
import {showMessage} from "app/store/masraff/messageSlice";
import {logoutUser, setUser} from "app/store/userSlice";
import MasraffSplashScreen from "@masraff/core/MasraffSplashScreen";
import cognitoService from "./services/cognitoService";

const AuthContext = createContext({});

const AuthProvider = ({children}: any) => {
    const [isAuthenticated, setIsAuthenticated] = useState(undefined);
    const [waitAuthCheck, setWaitAuthCheck] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        cognitoService.on('onAutoLogin', () => {
            dispatch(showMessage({message: 'Signing in with JWT'}));

            cognitoService
                .signInWithToken()
                .then((user: any) => {
                    success(user, 'Signed in with JWT');
                })
                .catch((error: any) => {
                    pass(error.message);
                });
        });

        cognitoService.on('onLogin', (user: any) => {
            success(user, 'Signed in');
        });

        cognitoService.on('onLogout', () => {
            pass('Signed out');

            // @ts-ignore
            dispatch(logoutUser());
        });

        cognitoService.on('onAutoLogout', (message: any) => {
            pass(message);

            // @ts-ignore
            dispatch(logoutUser());
        });

        cognitoService.on('onNoAccessToken', () => {
            pass(null);
        });

        cognitoService.init();

        const success = (user: any, message: any) => {
            if (message) {
                dispatch(showMessage({message}));
            }

            // @ts-ignore
            Promise.all([dispatch(setUser(user)),
                // You can receive data in here before app initialization
            ]).then((values) => {
                setWaitAuthCheck(false);
                // @ts-ignore
                setIsAuthenticated(true);
            });
        };

        const pass = (message: any): void => {
            if (message) {
                dispatch(showMessage({message}));
            }

            setWaitAuthCheck(false);
            // @ts-ignore
            setIsAuthenticated(false);
        };
    }, [dispatch]);

    return waitAuthCheck ? (
        <MasraffSplashScreen/>
    ) : (
        <AuthContext.Provider value={{isAuthenticated}}>{children}</AuthContext.Provider>
    );
};

const useAuth = () => {
    const context = useContext(AuthContext);

    if (context === undefined)
        throw new Error('useAuth must be used within a AuthProvider');

    return context;
};

export { AuthProvider, useAuth };