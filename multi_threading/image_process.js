import { Jimp } from "jimp";
import fs, { readdir, readdirSync } from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const fileName = fileURLToPath(import.meta.url);
const _dirname = dirname(fileName);
const inputFileDir = path.join(_dirname, "public");

const output_Directory = path.join(_dirname, "output_images");

async function processImage(imagePath, imageName) {
  const subOutputDirectory = path.join(
    output_Directory,
    imageName.split(".")[0]
  );
  const image = await Jimp.read(imagePath);
  fs.mkdirSync(subOutputDirectory, { recursive: true });
  const tasks = [
    {
      name: "thumbnail",
      operation: async () => {
        const cloned = image.clone();
        cloned.resize({ w: 1400, h: 900 });
        const outputFilePath = path.join(
          subOutputDirectory,
          `thumbnail.png`
        );
        await cloned.write(outputFilePath);
      },
    },
    {
      name: "small",
      operation: async () => {
        const cloned = image.clone();
        cloned.resize({ w: 300, h: 300 });
        const outputFilePath = path.join(
          subOutputDirectory,
          `small.png`
        );
        await cloned.write(outputFilePath);
      },
    },
    {
      name: "medium",
      operation: async () => {
        const cloned = image.clone();
        cloned.resize({ w: 600, h: 600 });
        const outputFilePath = path.join(
          subOutputDirectory,
          `medium.png`
        );
        await cloned.write(outputFilePath);
      },
    },
    {
      name: "large",
      operation: async () => {
        const cloned = image.clone();
         cloned.resize({ w: 1000, h: 1000 });
        const outputFilePath = path.join(
          subOutputDirectory,
          `large.png`
        );
        await cloned.write(outputFilePath);
      },
    },
    {
      name: "grayscale",
      operation: async () => {
        const cloned = image.clone();
        cloned.greyscale();
        const outputFilePath = path.join(
          subOutputDirectory,
          `grayscale.png`
        );
        await cloned.write(outputFilePath);
      },
    },
    {
      name: "blur",
      operation: async () => {
        const cloned = image.clone();
        cloned.blur(6);
        const outputFilePath = path.join(
          subOutputDirectory,
          `blur.png`
        );
        await cloned.write(outputFilePath);
      },
    },
  ];

  for(let task of tasks){
    await task.operation()
  }

}

async function main() {
  const readDir = readdirSync(inputFileDir);
  const totalStartTime = Date.now();
  for (let i = 0; i < readDir.length; i++) {
    const start = Date.now();
    const imageName = readDir[i];
    const imagePath = path.join(inputFileDir, imageName);
    await processImage(imagePath, imageName);
    const end = Date.now();
    const intervalInSec = (end - start) / 1000;
    console.log(`Time taken by image ${imageName}: `, intervalInSec);
  }
  const totalEndTime = Date.now();
  const intervalInsec = (totalEndTime - totalStartTime) / 1000;
  console.log("Total time taken on main thread: ", intervalInsec)
}

main();
