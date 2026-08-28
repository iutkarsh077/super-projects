let tokens = 10;
const maxTokens = 10;
const tokenRate = 1;

let lastRefillTime = Date.now();
const TokenBucketRateLimit = async (req, res, next) => {
    const now = Date.now();

    const elapsedTime = ( now - lastRefillTime ) / 1000;

    tokens = Math.min(maxTokens, tokens + elapsedTime * tokenRate);

    console.log("Tokens is: ", tokens)

    lastRefillTime = now;

    if(tokens < 1){
        return res.status(429).json({message: "Too much requests", status: false})
    }

    tokens--;

    next();
}

export default TokenBucketRateLimit;