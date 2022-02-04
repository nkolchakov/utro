import { useState } from 'react';
import { Steps, Button, message } from 'antd';
import ScheduleConfig from './ScheduleConfig';
import StakeEthForm from './StakeEthForm';

const { Step } = Steps;

const steps = [
    {
        title: 'Configure',
        component: <ScheduleConfig />
    },
    {
        title: 'Stake',
        component: <StakeEthForm />
    }
];

const CreateSchedule = () => {

    const [current, setCurrent] = useState(0);

    const next = () => {
        setCurrent(current + 1);
    };

    const prev = () => {
        setCurrent(current - 1);
    };



    return (
        <div style={{ width: '50%' }}>
            <Steps size='small' current={current}>
                {steps.map(item => (
                    <Step key={item.title} title={item.title} />
                ))}
            </Steps>
            <div className="steps-content">{steps[current].component}</div>
            <div className="steps-action">
                {current < steps.length - 1 && (
                    <Button type="primary" onClick={() => next()}>
                        Next
                    </Button>
                )}
                {current === steps.length - 1 && (
                    <Button type="primary" onClick={() => message.success('Processing complete!')}>
                        Done
                    </Button>
                )}
                {current > 0 && (
                    <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
                        Previous
                    </Button>
                )}
            </div>
        </div>
    )
}

export default CreateSchedule;