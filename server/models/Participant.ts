import mongoose from 'mongoose'

const participantSchema = new mongoose.Schema(
    {
        // overwrite w/ custom _id (use the player's wallet address, which will be unique)
        _id: {
            type: mongoose.Schema.Types.String,
            required: true,
        },
        schedule: {
            type: mongoose.Schema.Types.Number,
            ref: 'Schedule'
        },
    }
)

const Participant = mongoose.model('Participant', participantSchema)
export { Participant }