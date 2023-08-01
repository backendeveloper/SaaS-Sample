import MasraffUtils from "@masraff/utils";
import { Navigate } from 'react-router-dom';
// import settingsConfig from "app/configs/settingsConfig";
import MasraffLoading from "@masraff/core/MasraffLoading";
import dashboardsConfigs from "../main/dashboards/dashboardsConfigs";
import settingsConfig from "./settingsConfig";
import SignInConfig from "../main/sign-in/SignInConfig";

const routeConfigs = [
    // ...appsConfigs,
    ...dashboardsConfigs,
    // ...pagesConfigs,
    // ...authRoleExamplesConfigs,
    // ...userInterfaceConfigs,
    // DocumentationConfig,
    // SignOutConfig,
    SignInConfig,
    // SignUpConfig,
];

const routes = [
    ...MasraffUtils.generateRoutesFromConfigs(routeConfigs, settingsConfig.defaultAuth),
    {
        path: '/',
        element: <Navigate to="dashboards/analytics" />,
        auth: settingsConfig.defaultAuth,
    },
    {
        path: 'loading',
        element: <MasraffLoading />,
    },
    {
        path: '*',
        element: <Navigate to="pages/error/404" />,
    },
];

export default routes;