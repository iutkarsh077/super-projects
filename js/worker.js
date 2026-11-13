import { Worker } from "bullmq";
import { connection } from "./queue.js";

const sender = {
    email: async (message, email) => {
        try {
            setTimeout(() => {
                console.log("sent an email ", message, email);
            }, 3000);
        } catch (error) {
            throw new Error(error);
        }
    },
    sms: async (message) => {
        try {
            console.log("sent an otp on sms ", message)
        } catch (error) {
            throw new Error(error);
        }
    }
}

const worker = new Worker('notifications', async (job) => {
    console.log("The job is: ", job.data);
    await sender[job.data.channel](job.data.message, job.data.email);
}, { connection, concurrency: 5 });

worker.on("completed", (job) => console.log(`Completed the job with ${job.id}`))
worker.on("failed", (job) => console.log(`failed the job with ${job.id}`))