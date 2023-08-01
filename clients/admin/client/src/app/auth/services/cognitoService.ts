import MasraffUtils from "@masraff/utils";
import axios from "axios";
import {Auth} from "aws-amplify";

class CognitoService extends MasraffUtils.EventEmitter {

    public init = () => {
        this.setInterceptors();
        this.handleAuthentication();
    }

    private setInterceptors = () => {
        axios.interceptors.response.use(
            (response: any) => {
                return response;
            },
            (err: any) => {
                return new Promise((resolve, reject) => {
                    if (err.response.status === 401 && err.config && !err.config.__isRetryRequest) {
                        // if you ever get an unauthorized response, logout the user
                        this.emit('onAutoLogout', 'Invalid access_token');
                        this.setSession(null);
                    }
                    throw err;
                });
            }
        );
    };

    private handleAuthentication = () => {
        debugger;
        const access_token = this.getAccessToken();

        if (!access_token) {
            this.emit('onNoAccessToken');
            return;
        }

        // if (this.isAuthTokenValid(access_token)) {
        //     this.setSession(access_token);
        //     this.emit('onAutoLogin', true);
        // } else {
        //     this.setSession(null);
        //     this.emit('onAutoLogout', 'access_token expired');
        // }
    };

    // createUser = (data: any) => {
    //     return new Promise((resolve, reject) => {
    //         axios.post(jwtServiceConfig.signUp, data).then((response) => {
    //             if (response.data.user) {
    //                 this.setSession(response.data.access_token);
    //                 resolve(response.data.user);
    //                 this.emit('onLogin', response.data.user);
    //             } else {
    //                 reject(response.data.error);
    //             }
    //         });
    //     });
    // };

    public signInWithEmailAndPassword = async (email: string, password: string) => {
        debugger;
        const response = await Auth.signIn(email, password);

        if (response.data.user) {
            this.setSession(response.data.access_token);
            this.emit('onLogin', response.data.user);

            return response.data.user;
            // resolve(response.data.user);
        } else {
            return response.data.user;
            // reject(response.data.error);
        }
    }

    // signInWithEmailAndPassword = (email: any, password: any) => {
    //     return new Promise((resolve, reject) => {
    //         axios
    //             .get(jwtServiceConfig.signIn, {
    //                 data: {
    //                     email,
    //                     password,
    //                 },
    //             })
    //             .then((response) => {
    //                 if (response.data.user) {
    //                     this.setSession(response.data.access_token);
    //                     resolve(response.data.user);
    //                     this.emit('onLogin', response.data.user);
    //                 } else {
    //                     reject(response.data.error);
    //                 }
    //             });
    //     });
    // };

    signInWithToken = () => {
        return new Promise((resolve, reject) => {
            axios
                .get(jwtServiceConfig.accessToken, {
                    data: {
                        access_token: this.getAccessToken(),
                    },
                })
                .then((response) => {
                    if (response.data.user) {
                        this.setSession(response.data.access_token);
                        resolve(response.data.user);
                    } else {
                        this.logout();
                        reject(new Error('Failed to login with token.'));
                    }
                })
                .catch((error) => {
                    this.logout();
                    reject(new Error('Failed to login with token.'));
                });
        });
    };

    // updateUserData = (user: any) => {
    //     return axios.post(jwtServiceConfig.updateUser, {
    //         user,
    //     });
    // };

    setSession = (access_token: any) => {
        if (access_token) {
            localStorage.setItem('jwt_access_token', access_token);
            axios.defaults.headers.common.Authorization = `Bearer ${access_token}`;
        } else {
            localStorage.removeItem('jwt_access_token');
            delete axios.defaults.headers.common.Authorization;
        }
    };

    logout = () => {
        this.setSession(null);
        this.emit('onLogout', 'Logged out');
    };

    // isAuthTokenValid = (access_token: any) => {
    //     if (!access_token) {
    //         return false;
    //     }
    //     const decoded = jwtDecode(access_token);
    //     const currentTime = Date.now() / 1000;
    //     if (decoded.exp < currentTime) {
    //         console.warn('access token expired');
    //         return false;
    //     }
    //
    //     return true;
    // };

    private getAccessToken = (): any => {
        return window.localStorage.getItem('jwt_access_token');
    };
}

// export default CognitoService;
const instance = new CognitoService();

export default instance;