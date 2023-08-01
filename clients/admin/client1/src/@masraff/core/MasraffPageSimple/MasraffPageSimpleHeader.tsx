import clsx from 'clsx';

const MasraffPageSimpleHeader = (props: any) => (
    <div className={clsx('MasraffPageSimple-header', props.className)}>
        <div className="container">{props.header && props.header}</div>
    </div>
);

export default MasraffPageSimpleHeader;
