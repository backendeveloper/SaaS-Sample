import {useLayoutEffect, useState} from "react";
import history from '@history';
import {Router} from "react-router-dom";

const BrowserRouter = ({ basename, children, window }: any) => {
    const [state, setState]: any = useState({
        action: history.action,
        location: history.location,
    });

    useLayoutEffect(() => history.listen(setState), [history]);

    return (
        <Router
            basename={basename}
            location={state.location}
            navigationType={state.action}
            navigator={history}
        >
            {children}
        </Router>
    );
};

export default BrowserRouter;
