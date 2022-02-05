import express, { Request, Response } from "express";
import { userInfo } from "os";
import { Participant } from "../models/Participant";
import { Schedule, ScheduleStatus } from "../models/Schedule";
import { body } from 'express-validator';
import moment from "moment";

const scheduleRouter = express.Router();

scheduleRouter.post('/', async (req: Request, res: Response) => {
    const newSchedule = req.body;
    console.log(newSchedule);
    const creatorAddress = newSchedule.participants[0];
    if (!creatorAddress) {
        return res.status(400).send('creator address not set !');
    }
    let creator = await Participant
        .findById(creatorAddress);

    if (!creator) {
        creator = await Participant.create({
            _id: creatorAddress
        });
    }

    const schedule = await Schedule.create(newSchedule);
    await schedule.save();

    creator.schedule = schedule;
    await creator.save();

    return res.status(200).send(schedule);
})

scheduleRouter.post('/activate', [
    body('scheduleId').not().isEmpty().withMessage('Schedule id not provided !'),
], async (req: Request, res: Response) => {
    const { scheduleId, activationTimestamp } = req.body;
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
        res.status(400).send('schedule with that id not found !');
    }

    schedule.status = ScheduleStatus.ACTIVE;
    schedule.activationDate = moment(activationTimestamp * 1000).toDate();
    await schedule.save();

    return res.status(200);
})

scheduleRouter.post('/join', [
    body('scheduleId').not().isEmpty().withMessage('Schedule id not provided !'),
    body('participant').not().isEmpty().withMessage('Participant address not provided !'),
], async (req: Request, res: Response) => {
    const { scheduleId, participant } = req.body;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
        res.status(400).send('schedule with that id not found !');
    }

    let p = await Participant.findById(participant);
    if (!p) {
        p = await Participant.create({
            _id: participant,
            schedule: schedule._id
        });
    }
    schedule.participants.push(p);
    await schedule.save();

    return res.status(200).send(schedule.participants);
})

export default scheduleRouter;