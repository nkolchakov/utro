import { CrownOutlined, ExperimentOutlined } from '@ant-design/icons';
import { useEthers } from "@usedapp/core";
import { Avatar, Badge, Button, List, Space } from "antd";
import { parseEther } from 'ethers/lib/utils';
import React, { useEffect, useState } from "react";
import { ScheduleObj, ScheduleStatus } from "../../interfaces";
import { compareAddresses, getContract } from "../../schedule-service";


const SingleSchedule = ({ schedule }: { schedule: ScheduleObj }) => {

    const { account, activateBrowserWallet } = useEthers();
    const [revealed, setRevealed] = useState(false);
    const [participants, setParticipants] = useState<any>([]);
    const [extraControl, setExtraControl] = useState<React.ReactNode | null>(null);

    useEffect(() => {
        setExtraControl(getExtraControl(schedule))
    }, [account, participants, revealed])

    const isCreator = (account?: string | null) => {
        if (!account) return false;
        return compareAddresses(account, participants[0])
    }

    const alreadyParticipant = (account: string) => {
        return participants.some((p: string) => compareAddresses(account, p));
    }

    const onReveal = (scheduleId: number) => {
        const contract = getContract()
        contract!.getParticipants(scheduleId)
            .then((pList: any[]) => {
                console.log(pList)
                setParticipants(pList)
                setRevealed(true);
            })
    }



    const onJoin = (schedule: ScheduleObj) => {
        const contract = getContract();
        contract!.joinSchedule(schedule.id,
            { value: parseEther(schedule.stakeRequired.toString()) });
    }


    function getIcon(account: string): React.ReactNode {
        return isCreator(account) ?
            <IconText icon={CrownOutlined} text={`creator`} key="creator" /> :
            <IconText icon={ExperimentOutlined} text={`joined`} key="joined" />
    }

    const getExtraControl = (schedule: ScheduleObj) => {
        let control: React.ReactNode;
        if (alreadyParticipant(account!)) {
            control = getIcon(account!)
        } else {
            control = <Button
                onClick={() => onJoin(schedule)}
                style={{ background: 'green' }}
                type='primary'>
                Join
            </Button>;;
        }
        return control;
    }

    const onActivate = (scheduleId: number) => {
        const contract = getContract();
        contract.activateSchedule(scheduleId)
    }

    const isActiveEnabled = (schedule: ScheduleObj) => {
        return schedule.status !== ScheduleStatus.active &&
            isCreator(account) &&
            revealed &&
            participants?.length > 1;
    }


    return (
        <List.Item
            extra={<div>{
                revealed ?
                    extraControl :
                    <Button
                        onClick={() => onReveal(schedule.id)}
                        size='small'
                        type='dashed'>
                        Reveal
                    </Button>
            }
                {
                    (isActiveEnabled(schedule)) && < Button type='primary'
                        size='small'
                        onClick={() => onActivate(schedule.id)}
                        style={{ marginLeft: '10px', background: 'seagreen' }}>
                        Activate
                    </Button>
                }
            </ div >}
            style={{ marginRight: '30px' }}>
            <Badge
                status='processing'
                color={schedule.statusColor}
                style={{ fontStyle: 'italic', color: 'gray' }}
                text={'/  ' + ScheduleStatus[schedule.status]} />
            <List.Item.Meta
                avatar={<Avatar size='large'
                    src="coffee.jpg" />}
                title={<h3>{schedule.name}</h3>}
                description={
                    <ul>
                        {revealed && <li>👤{participants.length}</li>}
                        <li>⧫ {schedule.stakeRequired}</li>
                        <li>every day at {schedule.hourFormatted}</li>
                        <li>for {schedule.daysNumber.toString()} days</li>
                    </ul>
                }
            />
            {schedule.description}
        </List.Item >
    )
};
const IconText = ({ icon, text }: any) => (
    <Space>
        {React.createElement(icon)}
        {text}
    </Space>
);


export default SingleSchedule;