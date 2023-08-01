import {Component} from "react";
import {matchRoutes} from "react-router-dom";
import history from '@history';
import AppContext from "app/AppContext";
import MasraffUtils from "@masraff/utils";
import {
    getSessionRedirectUrl,
    resetSessionRedirectUrl,
    setSessionRedirectUrl
} from "@masraff/core/MasraffAuthorization/sessionRedirectUrl";
import withRouter from "@masraff/core/withRouter";

class MasraffAuthorization extends Component {
    constructor(props: any, context: any) {
        super(props);
        const { routes } = context;
        this.state = {
            accessGranted: true,
            routes
        };
    }

    componentDidMount() {
        // @ts-ignore
        if (!this.state.accessGranted) {
            this.redirectRoute();
        }
    }

    shouldComponentUpdate(nextProps: any, nextState: any) {
        // @ts-ignore
        return nextState.accessGranted !== this.state.accessGranted;
    }

    componentDidUpdate() {
        // @ts-ignore
        if (!this.state.accessGranted) {
            this.redirectRoute();
        }
    }

    static getDerivedStateFromProps(props: any, state: any) {
        const { location, userRole } = props;
        const { pathname } = location;

        const matchedRoutes = matchRoutes(state.routes, pathname);

        const matched = matchedRoutes ? matchedRoutes[0] : false;

        // @ts-ignore
        const userHasPermission = MasraffUtils.hasPermission(matched.route.auth, userRole);

        const ignoredPaths = ['/', '/callback', '/sign-in', '/sign-out', '/logout', '/404'];

        if (matched && !userHasPermission && !ignoredPaths.includes(pathname))
            setSessionRedirectUrl(pathname);

        return {
            accessGranted: matched ? userHasPermission : true,
        };
    }

    redirectRoute() {
        // @ts-ignore
        const { userRole } = this.props;
        // @ts-ignore
        const redirectUrl = getSessionRedirectUrl() || this.props.loginRedirectUrl;

        /*
            User is guest
            Redirect to Login Page
            */
        if (!userRole || userRole.length === 0) {
            setTimeout(() => history.push('/sign-in'), 0);
        } else {
            /*
              User is member
              User must be on unAuthorized page or just logged in
              Redirect to dashboard or loginRedirectUrl
              */
            setTimeout(() => history.push(redirectUrl), 0);

            resetSessionRedirectUrl();
        }
    }

    render() {
        // console.info('Masraff Authorization rendered', this.state.accessGranted);
        // @ts-ignore
        return this.state.accessGranted ? this.props.children : null;
    }
}

MasraffAuthorization.contextType = AppContext;

export default withRouter(MasraffAuthorization);