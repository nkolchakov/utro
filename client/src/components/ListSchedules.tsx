import { Contract, ethers, utils } from "ethers";
import { useEffect, useState } from "react";
import { UTRO_CONTRACT_ADDRESS } from '../contract-address';
import compiledUtro from '../artifacts/Utro.json'
import moment from "moment";
import { ScheduleObj, ScheduleStatus } from "../interfaces"
import { getContract } from "../schedule-service"
import { Avatar, Badge, Button, Divider, List } from "antd";

const ListSchedules = () => {

    const [scheduleList, setScheduleList] = useState<any>([]);
    useEffect(() => {
        const contract = getContract()

        contract.getSchedules().then((rawList: any) => {
            console.log('raw ', rawList)
            const parsedList = rawList.map((rawSchedule: any) => {
                let parsedSchedule = ScheduleObj.parse(rawSchedule);
                return parsedSchedule;
            })
            setScheduleList(parsedList)
            console.log(parsedList)
        })
    }, [UTRO_CONTRACT_ADDRESS])

    return (
        <div>
            <List
                itemLayout="horizontal"
                grid={{ gutter: 12, column: 3 }}
                dataSource={scheduleList}
                renderItem={(schedule: ScheduleObj) => (
                    <List.Item extra={
                        <div>
                            <Button>Join</Button>
                        </div>
                    }>
                        <Badge status='processing' color={schedule.statusColor} style={{ fontStyle: 'italic', color: 'gray' }} text={'/  ' + ScheduleStatus[schedule.status]} />
                        <List.Item.Meta
                            avatar={<Avatar size='large'
                                src="coffee.jpg" />}
                            title={<h3>{schedule.name}</h3>}
                            description={
                                <ul>
                                    <li>Ξ {schedule.stakeRequired}</li>
                                    <li>every day at {schedule.hourFormatted}</li>
                                    <li>till {schedule.endDateFormatted}</li>
                                </ul>
                            }
                        />
                        {schedule.description}
                    </List.Item>
                )}
            />
        </div >
    )
}

export default ListSchedules;