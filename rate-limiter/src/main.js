import express from "express";
import { createBucket, tryAndRemove } from "./utils/tokenbucket.js";

const app = express();

let globalBucket = createBucket(10, 0.1);
function RateLimiter(req, res, next){
  console.log("Global Bucket status is: ", globalBucket)

  if(!tryAndRemove(globalBucket)){
    return res.status(429).json({message: "Request Limit Exceeded", status: false})
  }

  return next();

}

app.use(RateLimiter);


app.get("/health", (req, res) => {
  console.log(req.ip);
  res.status(200).json(
    { message: "Everythhing is working fine", status: true }
  );
});

app.listen(7222, () => {
  console.log(`Server is listening at port 7222`);
});
