import { readdirSync } from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";

const currentfilePath = fileURLToPath(import.meta.url);
const directoryPath = dirname(currentfilePath);
const WORKERFILEPATH = path.join(directoryPath, "workers.js");

const filePath = fileURLToPath(import.meta.url);
const _dirname = dirname(filePath);

function callWorker(fileName) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(WORKERFILEPATH, {
      workerData: {
        fileName,
      },
    });

    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}

async function main() {
  const input_image_path = path.join(_dirname, "public");
  const startTime = Date.now();
  const fileNames = readdirSync(input_image_path);
  console.log(fileNames);
  const result = fileNames.map(async (fileName) => {
    const data = await callWorker(fileName);
    return data;
  });

  await Promise.all(result);

  const endTime = Date.now();
  const totalTimeInSec = (endTime - startTime) / 1000;
  console.log(`Total Time taken to process image by using multithreading is:  ${totalTimeInSec} seconds`);
}

main();
