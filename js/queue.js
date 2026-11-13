import { Queue } from "bullmq";

const connection = { host: '127.0.0.1', port: 6379 };
const notificationQueue = new Queue('notifications', { connection });

export { connection, notificationQueue };