import { Jimp } from "jimp";
import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url"

const fileName = fileURLToPath(import.meta.url);
const _dirname = dirname(fileName);

const output_Directory = path.join(_dirname, "output_images");

async function processImage(imagePath, imageName){
    const subOutputDirectory = path.join(output_Directory, imageName.split('.')[0]);
    const image = await Jimp.read(imagePath);
    image.resize({ w: 10000 });
     fs.mkdirSync(subOutputDirectory, { recursive: true });
     const outputFilePath = path.join(subOutputDirectory, "resize.png")
    await image.write(outputFilePath);
}

async function main(){
    const imageName = "sample1.png";
    const imagePath = path.join(_dirname, "public", imageName);
    await processImage(imagePath, imageName)
}

main();