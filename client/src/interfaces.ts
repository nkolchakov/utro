import moment from "moment";
import { Moment } from "moment";

export class ScheduleObj {
    constructor(
        public id: number,
        public name: string,
        public status: ScheduleStatus,
        public stakeRequired: number,
        public daysNumber: number,
        public hour: Date,
        public activationDate?: Date

    ) {
    }

    get description() {
        return `Stake Ξ${this.stakeRequired} to participate in this schedule.
        It will be triggered everyday at ${this.hourFormatted}.
        The schedule will be active for ${this.daysNumber} days.`
    }

    static parse(raw: any) {
        return new ScheduleObj(
            raw.id.toNumber(),
            raw.name,
            raw.status,
            raw.stakeRequired.toNumber(),
            raw.daysNumber.toNumber(),
            moment(raw.hour.toNumber()).toDate(),
            raw.activationTimestamp.toNumber() !== 0 ? moment(raw.activationTimestamp).toDate() : undefined
        )
    }

    get activationDateFormatted() {
        return this.activationDate ? moment(this.activationDate).format('DD/MM/YY') : undefined;
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