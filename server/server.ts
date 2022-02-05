import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
import quizRouter from './routers/quiz';
import scheduleRouter from './routers/schedule';

const PORT = 8000;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/schedule', scheduleRouter);
app.use('/quiz', quizRouter);

app.listen(PORT, async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/utrodb');
        console.log('connected to mongodb');

        console.log(`server is running on ${PORT} started: ${(new Date()).toLocaleTimeString()}`);
    } catch (error) {
        console.log('error on server startup ', error)
    }
});