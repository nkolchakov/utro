import moment from "moment";
import { Moment } from "moment";

export class ScheduleObj {
    constructor(
        public id: number,
        public name: string,
        public status: ScheduleStatus,
        public stakeRequired: number,
        public endDate: Date,
        public hour: Date
    ) {
    }

    get description() {
        return `Stake Ξ${this.stakeRequired} to participate in this schedule.
        It will be triggered everyday at ${this.hourFormatted}.
        The schedule will be active till ${this.endDateFormatted} .`
    }

    static parse(raw: any) {
        return new ScheduleObj(
            raw.id.toNumber(),
            raw.name,
            raw.status,
            raw.stakeRequired.toNumber(),
            moment(raw.endDate.toNumber()).toDate(),
            moment(raw.hour.toNumber()).toDate()
        )
    }

    get endDateFormatted() {
        return moment(this.endDate).format('DD/MM/YYYY');
    }

    get hourFormatted() {
        return moment(this.hour).format('HH:mm:ss');
    }

    get statusColor() {
        let color = 'white';
        if (this.status === ScheduleStatus.pending) {
            color = 'orange'
        } else if (this.status === ScheduleStatus.active) {
            color = 'green'
        } else {
            color = 'gray';
        }
        return color;
    }
}

export enum ScheduleStatus {
    pending,
    active,
    closed
}