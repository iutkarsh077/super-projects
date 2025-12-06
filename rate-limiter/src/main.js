import express from "express";
import { CreateBucket, tryAndRemove } from "./utils/tokenbucket.js";

const app = express();

const buckets = {};

function RateLimit(req, res, next) {
  const ip = req.ip;

  if (!buckets[ip]) {
    buckets[ip] = CreateBucket(10, 0.01);
  }

  const myBucket = buckets[ip];

  console.log("Currently my bucket status is: ", myBucket)

  if (tryAndRemove(myBucket)) {
    next();
  } else {
    res.status(429).json({
      success: false,
      message: "Too many requests, slow down!",
    });
  }
}
app.use(RateLimit)

app.get("/health", (req, res) => {
  console.log(req.ip);
  res.status(200).json(
    { message: "Everythhing is working fine", status: true }
  );
});

app.listen(7222, () => {
  console.log(`Server is listening at port 7222`);
});
