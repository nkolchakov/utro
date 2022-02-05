import express, { Request, Response } from "express";
import { generateAlgebra, getContract, getRandomInt } from "../services/quiz-service";

const quizRouter = express.Router();

let cache: any = {}
let currentQuizCache: any = {};

quizRouter.get('/generate/:scheduleId/:address',
    async (req: Request, res: Response) => {
        const { scheduleId, address } = req.params;

        const algebricTask = generateAlgebra();
        const sliderTask = getRandomInt(1, 100);
        const gameKey = Math.floor(Math.random() * 900000);

        const quiz = {
            algebricTask,
            sliderTask,
            gameKey
        };

        if (!cache[scheduleId]) {
            cache[scheduleId] = {}
        }

        cache[scheduleId][address] = quiz;

        return res.status(200).send(quiz);
    })


quizRouter.post('/', async (req: Request, res: Response) => {
    const { scheduleId, account,
        signature, firstAnswer, secondAnswer } = req.body;

    const quizInfo = {
        signature,
        firstAnswer,
        secondAnswer,
        gameKey: cache[scheduleId][account].gameKey
    }

    if (!currentQuizCache[scheduleId]) {
        currentQuizCache[scheduleId] = {}
    }

    if (!currentQuizCache[scheduleId][account]) {
        currentQuizCache[scheduleId][account] = {}
    }
    currentQuizCache[scheduleId][account] = quizInfo


    res.status(200).send(currentQuizCache);
});

quizRouter.get('/test-trigger', async (req: Request, res: Response) => {
    console.log('triggered');

    // collect and send signatures + asnwers + game keys to the contract
    // contract will hash the same message and verify they are signed from the right accounts
    // if valid the person survives the day
    // otherwhise his take is slashed and 90% shared to others, 10% to treasury


    res.status(200).send(currentQuizCache);
})

export default quizRouter;