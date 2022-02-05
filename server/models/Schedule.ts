import mongoose from 'mongoose'

export enum ScheduleStatus {
    PENDING,
    ACTIVE,
    CLOSED
}

// for lack of time, omit more complex checks
const scheduleSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.Number,
        required: true,
    },
    participants: [{
        type: mongoose.Schema.Types.String,
    }],
    hour: {
        type: mongoose.Schema.Types.Date,
        required: true
    },
    activationDate: {
        type: mongoose.Schema.Types.Date
    },
    daysNumber: {
        type: mongoose.Schema.Types.Number

    },
    status: {
        type: String,
        enum: ScheduleStatus,
        default: ScheduleStatus.PENDING,
        required: true
    }
})

const Schedule = mongoose.model('Schedule', scheduleSchema)
export { Schedule }