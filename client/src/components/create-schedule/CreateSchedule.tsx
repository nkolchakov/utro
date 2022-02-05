import { Button, message, Steps } from 'antd';
import axios from 'axios';
import { ethers, Transaction, utils } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../constants';
import { ScheduleStatus } from '../../interfaces';
import { getContract } from '../../schedule-service';
import ReviewForm from './ReviewForm';
import ScheduleConfig from './ScheduleConfig';

const { Step } = Steps;

const CreateSchedule = () => {

    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);
    const [formData, setFormData] = useState<any>(null);
    const [validate, setValidate] = useState<'wait' | 'process' | 'finish' | 'error'>('error');



    const steps = [
        {
            title: 'Configure',
            component: <ScheduleConfig
                formData={formData}
                validateStep={(res: 'wait' | 'process' | 'finish' | 'error') => setValidate(res)}
                setFormData={setFormData} />
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

    const onScheduleCreate = () => {
        getContract()
            .createSchedule(
                formData.name,
                formData.stake,
                formData.daysNumber,
                formData.hour.valueOf(),
                { value: parseEther(formData.stake.toString()) }
            ).then((tx: any) => {
                message.loading('waiting for 1 confirmation')
                console.log(typeof tx);
                return tx.wait(1);
            })
            .then((confirmedTx: any) => {
                console.log('tx confirmed ', confirmedTx)
                const creationEventArgs = confirmedTx.events[0].args;
                message.success('Room created');

                // the recurring scheduling logic will be performed back-end
                return axios.post(`${BASE_URL}/schedule`, {
                    _id: creationEventArgs.scheduleId.toNumber(),
                    participants: [
                        creationEventArgs.creator
                    ],
                    status: ScheduleStatus.pending,
                    hour: formData.hour,
                    daysNumber: formData.daysNumber
                })
            }).then(() => { navigate('/list') });
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
                        onClick={onScheduleCreate}
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