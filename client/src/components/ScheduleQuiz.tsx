import { useEthers } from "@usedapp/core";
import { Button, Divider, Input, message, Slider } from "antd";
import axios from "axios";
import { BigNumber, BigNumberish, ethers } from "ethers";
import { arrayify, solidityKeccak256 } from "ethers/lib/utils";
import { useEffect } from "react";
import { useState } from "react";
import { BASE_URL } from "../constants";
import { getContract } from "../schedule-service";

const ScheduleQuiz = () => {
    const [first, setFirst] = useState<any>({});
    const [second, setSecond] = useState(100);
    const [gameKey, setGameKey] = useState(0);
    const [scheduleId, setScheduleId] = useState<number | null>(null);

    const [sliderBelowGoal, setSliderBelowGoal] = useState(0);
    const [arithemic, setArithmetic] = useState<any>({});

    const { account } = useEthers();

    useEffect(() => {
        getContract()
            .participantToScheduleId(account)
            .then((id: BigNumber) => {
                setScheduleId(id.toNumber())
            })
    }, [account])

    useEffect(() => {
        axios.get(`${BASE_URL}/quiz/generate/${scheduleId}/${account}`)
            .then((res: any) => {
                const { algebricTask, sliderTask, gameKey } = res.data;
                setSliderBelowGoal(sliderTask)
                setArithmetic(algebricTask)
                setGameKey(gameKey)
            })

    }, [scheduleId])

    const onSign = async () => {
        // @ts-ignore
        let provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner();

        const msg = first + second + gameKey;
        const hashedMsg = solidityKeccak256(['string'], [msg]);

        const signature = await signer.signMessage(arrayify(hashedMsg));
        const data = {
            scheduleId,
            account,
            signature,
            firstAnswer: first,
            secondAnswer: second
        };

        await axios.post(`${BASE_URL}/quiz`, data);
        message.success('submitted !');
    }

    const onTrigger = () => {
        // testing mechanism to simulate when quiz time elapses
        axios.get(`${BASE_URL}/quiz/test-trigger`);
    }

    return (
        (scheduleId === undefined || scheduleId === null) ?
            <span> 'countdown ...'</span> :
            <div>
                <Input
                    onChange={(e: any) => setFirst(parseInt(e.target.value))}
                    style={{ width: '200px' }}
                    size="large"
                    type={"number"}
                    addonBefore={`${arithemic.a} + ${arithemic.b} =`}
                />
                <Divider />
                <div>
                    <h3>
                        Slide below <strong>{sliderBelowGoal}</strong>
                        {' > '} {second}
                    </h3>
                    <Slider
                        tooltipPlacement={"bottom"}
                        onChange={(value) => setSecond(value)}
                        style={{ maxWidth: '500px' }}
                        defaultValue={second} />
                </div>
                <Divider />
                <Button
                    onClick={onSign}
                    shape={"round"}
                    size='large'
                    style={{ background: "orange" }}>
                    Sign
                </Button>
                <Button

                    onClick={onTrigger}
                    style={{
                        display: 'block',
                        float: 'right',
                        position: 'fixed',
                        right: 0,
                        bottom: 0
                    }}>
                    [test] trigger
                </Button>
            </div>
    )
}

export default ScheduleQuiz;