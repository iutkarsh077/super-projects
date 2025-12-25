import { Jimp } from "jimp";
import { mkdirSync } from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parentPort, Worker, workerData } from "node:worker_threads";

const filePath = fileURLToPath(import.meta.url);
const _dirname = dirname(filePath);
const outputDirectory = path.join(_dirname, "output_images");
const inputDirectory = path.join(_dirname, "public");

async function processImage() {
  const { fileName } = workerData;
  console.log("The image name is: ", fileName);

  const imageFullPath = path.join(inputDirectory, fileName);
  const cloned = await Jimp.read(imageFullPath);
  const outputPath = path.join(outputDirectory, fileName.split(".")[0]);
  mkdirSync(outputPath, { recursive: true });

  const tasks = [
    {
      name: "thumbnail",
      operation: async () => {
        cloned.resize({ w: 1400, h: 900 });
        const filepath = path.join(outputPath, "thumbnail.jpg");
        await cloned.write(filepath);
      },
    },
    {
      name: "small",
      operation: async () => {
        cloned.resize({ w: 100, h: 100 });
        const filepath = path.join(outputPath, "small.jpg");
        await cloned.write(filepath);
      },
    },
    {
      name: "medium",
      operation: async () => {
        cloned.resize({ w: 400, h: 400 });
        const filepath = path.join(outputPath, "medium.jpg");
        await cloned.write(filepath);
      },
    },
    {
      name: "large",
      operation: async () => {
        cloned.resize({ w: 1000, h: 1000 });
        const filepath = path.join(outputPath, "large.jpg");
        await cloned.write(filepath);
      },
    },
    {
      name: "grayscale",
      operation: async () => {
        cloned.greyscale();
        const filepath = path.join(outputPath, "grayscale.jpg");
        await cloned.write(filepath);
      },
    },

    {
      name: "blur",
      operation: async () => {
        cloned.blur(5);
        const filepath = path.join(outputPath, "blur.jpg");
        await cloned.write(filepath);
      },
    },
  ];

  for (let task of tasks) {
    await task.operation();
  }

  parentPort.postMessage({
    success: true,
    fileName
  })
}

processImage();
