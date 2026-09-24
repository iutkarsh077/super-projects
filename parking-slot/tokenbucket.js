

const buckets = new Map();

const MAX_TOKENS = 10;      
const REFILL_RATE = 2;      
function rateLimiter(req, res, next) {
    const ip = req.ip;

    const now = Date.now();

    let bucket = buckets.get(ip);

    if (!bucket) {
        bucket = {
            tokens: MAX_TOKENS,
            lastRefill: now,
        };

        buckets.set(ip, bucket);
    }

    const elapsedSeconds = (now - bucket.lastRefill) / 1000;

    const tokensToAdd = elapsedSeconds * REFILL_RATE;

    bucket.tokens = Math.min(
        MAX_TOKENS,
        bucket.tokens + tokensToAdd
    );

    bucket.lastRefill = now;

    if (bucket.tokens < 1) {
        return res.status(429).json({
            error: "Too many requests",
        });
    }

    // Consume one token
    bucket.tokens -= 1;

    next();
}

export default rateLimiter