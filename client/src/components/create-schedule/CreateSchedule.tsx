import { Button, Steps } from 'antd';
import { parseEther } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { getContract } from '../../schedule-service';
import ReviewForm from './ReviewForm';
import ScheduleConfig from './ScheduleConfig';

const { Step } = Steps;

const CreateSchedule = () => {


    const [current, setCurrent] = useState(0);
    const [formData, setFormData] = useState<any>(null);
    const [validate, setValidate] = useState<'wait' | 'process' | 'finish' | 'error'>('error');

    const contract = getContract();

    const steps = [
        {
            title: 'Configure',
            component: <ScheduleConfig
                formData={formData}
                validateStep={(res: 'wait' | 'process' | 'finish' | 'error') => setValidate(res)} setFormData={setFormData} />
        },
        {
            title: 'Stake',
            component: <ReviewForm
                formData={formData} />
        }
    ];

    const next = () => {
        setCurrent(current + 1);
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const deployContract = () => {
        // sendCreate(formData.name, formData.stake, formData.endDate.valueOf(), { value: parseEther(formData.stake.toString()) })
        //     .then((s: any) => {
        //         console.log(s)

        //     })

        contract
            .createSchedule(formData.name,
                formData.stake,
                formData.endDate.valueOf(),
                formData.hour.valueOf(),
                { value: parseEther(formData.stake.toString()) }
            )


    }

    return (
        <div>
            <Steps size='small'
                style={{ width: '25%' }}
                current={current}
                status={validate}>
                {steps.map(item => (
                    <Step key={item.title} title={item.title} />
                ))}
            </Steps>
            <div className="steps-content">{steps[current].component}</div>
            <div className="steps-action">
                {current < steps.length - 1 && (
                    <Button disabled={validate === 'error'} type="primary" onClick={() => next()}>
                        Next
                    </Button>
                )}
                {current === steps.length - 1 && (
                    <Button type="primary" style={{ background: '#cf5f14', borderColor: '#cf5f14', color: 'whitesmoke' }}
                        // onClick={() => message.success('Processing complete!')}
                        onClick={deployContract}
                    >
                        Sign
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