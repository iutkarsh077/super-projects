import express from "express";
import { notificationQueue } from "./queue.js";

const app = express();

app.use(express.json());

const queues = [];

app.post("/email", async (req, res) => {
    try {
        const data = req.body;

        console.log(data);

        queues.push(data);
        return res.status(200).json({ message: "Got it man", status: false });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server error", status: false });
    }
})

app.post("/send-notifications", async (req, res) => {
    try {
        const {email, channel, message, key} = req.body;

        // console.log(data);

        notificationQueue.add('send', { email, channel, message, key }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: true,
            removeOnFail: false,
            jobId: `notifications-${key}`
        })

        return res.status(200).json({ message: "Got it man", status: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server error", status: false });
    }
})


app.listen(4000, () => {
    console.log(`Server is listening at port 4000`)
})

