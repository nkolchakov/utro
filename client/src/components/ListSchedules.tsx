import { useEthers } from "@usedapp/core";
import { List } from "antd";
import React, { useEffect, useState } from "react";
import { UTRO_CONTRACT_ADDRESS } from '../contract-address';
import { ScheduleObj } from "../interfaces";
import { getContract, getProvider } from "../schedule-service";
import SingleSchedule from "./create-schedule/SingleSchedule";

const ListSchedules = () => {

    const [scheduleList, setScheduleList] = useState<any>([]);
    const { account } = useEthers();

    useEffect(() => {

        const contract = getContract()
        if (!contract) throw new Error('contract is undefined')
        contract.getSchedules()
            .then((rawList: any) => {
                console.log('raw ', rawList)
                const parsedList = rawList
                    .map((rawSchedule: any) => {
                        let parsedSchedule = ScheduleObj.parse(rawSchedule);
                        return parsedSchedule;
                    }).filter((s: ScheduleObj) => s.id > 0)
                setScheduleList(parsedList)
            });
        // const provider = getProvider();

        // let handler: any = provider.on('block', () => {
        //     contract.getSchedules()
        //         .then((rawList: any) => {
        //             console.log('raw ', rawList)
        //             const parsedList = rawList
        //                 .map((rawSchedule: any) => {
        //                     let parsedSchedule = ScheduleObj.parse(rawSchedule);
        //                     return parsedSchedule;
        //                 }).filter((s: ScheduleObj) => s.id > 0)
        //             setScheduleList(parsedList)
        //             console.log(parsedList)
        //         })
        // })
    }, [UTRO_CONTRACT_ADDRESS])



    return (
        <div>
            <List
                itemLayout="horizontal"
                grid={{ gutter: 12, column: 2 }}
                dataSource={scheduleList}
                renderItem={(schedule: ScheduleObj) => (
                    <SingleSchedule schedule={schedule} />
                )}
            />
        </div >
    )
}

export default ListSchedules;