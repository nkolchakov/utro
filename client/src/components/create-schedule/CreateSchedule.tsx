import { useContractFunction } from '@usedapp/core';
import { Button, Steps } from 'antd';
import { Contract, ethers, utils } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { useState } from 'react';
import compiledUtro from '../../artifacts/Utro.json';
import { UTRO_CONTRACT_ADDRESS } from "../../constants";
import { useUtro } from '../../useUtro';
import ReviewForm from './ReviewForm';
import ScheduleConfig from './ScheduleConfig';

const { Step } = Steps;

const CreateSchedule = () => {
    // const utroAddress = UTRO_CONTRACT_ADDRESS;
    // const utroAbi = compiledUtro.abi;

    // const utroInterface = new utils.Interface(utroAbi);
    // const contract = new Contract(utroAddress, utroInterface);
    // // @ts-ignore
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = provider.getSigner()

    // const { state, send } = useContractFunction(
    //     contract, 'createSchedule', { signer: signer });

    const { stateCreate, sendCreate } = useUtro().useCreateSchedule


    const [current, setCurrent] = useState(0);
    const [formData, setFormData] = useState<any>(null);
    const [validate, setValidate] = useState<'wait' | 'process' | 'finish' | 'error'>('error');

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
        sendCreate(formData.name, formData.stake, formData.endDate.valueOf(), { value: parseEther(formData.stake.toString()) })
            .then((s) => {
                console.log(s)

            })
    }

    return (
        <div>
            <Steps size='small'
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