import express from "express";
import { createBucket, tryAndRemove } from "./utils/tokenbucket.js";

const app = express();

const buckets = {};

export function RateLimiter(req, res, next){
  const ip = req.ip;

  if(!buckets[ip]){
   buckets[ip] = createBucket(10, 0.01);
  }

  const userBucket = buckets[ip];
  console.log("User bucket status is: ", userBucket)
  if(!tryAndRemove(userBucket)){
    return res.status(429).json({message: "Pajji limited exceeded, Please try again after some time"});
  }
  next();
}

app.use(RateLimiter)

app.get("/health", (req, res) => {
  console.log(req.ip);
  res.status(200).json(
    { message: "Everythhing is working fine", status: true }
  );
});

app.listen(7222, () => {
  console.log(`Server is listening at port 7222`);
});
