import {Component, forwardRef} from "react";
import withRouter from "@masraff/core/withRouter";

const withRouterAndRef = (WrappedComponent: any) => {
    class InnerComponentWithRef extends Component {
        render() {
            const {forwardRef, ...rest}: any = this.props;
            return <WrappedComponent {...rest} ref={forwardRef}/>;
        }
    }

    // @ts-ignore
    const ComponentWithRouter = withRouter(InnerComponentWithRef, { withRef: true });
    return forwardRef((props, ref) => <ComponentWithRouter {...props} forwardRef={ref} />);
};

export default withRouterAndRef;