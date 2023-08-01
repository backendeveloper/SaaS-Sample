import {useLocation, useNavigate} from "react-router-dom";

const withRouter = (Child: any) => (props: any) => {
    const location = useLocation();
    const navigate = useNavigate();
    return <Child {...props} navigate={navigate} location={location}/>;
};

export default withRouter;