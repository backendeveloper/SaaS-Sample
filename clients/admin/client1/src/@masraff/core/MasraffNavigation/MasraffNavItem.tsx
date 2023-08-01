const components = {};

export const registerComponent = (name: any, Component: any) => {
    // @ts-ignore
    components[name] = Component;
};

const MasraffNavItem = (props: any) => {
    // @ts-ignore
    const C = components[props.type];
    return C ? <C {...props} /> : null;
};

export default MasraffNavItem;