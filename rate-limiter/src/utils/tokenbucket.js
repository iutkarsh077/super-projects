export function CreateBucket(capacity, refillPerSecond){
    return {
        capacity,
        tokens: capacity,
        refillPerSecond,
        lastRefill: Date.now()
    }
}


export function RefillToken(bucket){
    const interval = (Date.now() - bucket.lastRefill) / 1000; //in seconds
    console.log("Interval is: ", interval)
    const tokenToRefill = interval * bucket.refillPerSecond;
    bucket.tokens = Math.min(tokenToRefill + bucket.tokens, bucket.capacity);
    bucket.lastRefill = Date.now();
}

export function tryAndRemove(bucket){
    RefillToken(bucket);

    
    if(bucket.tokens >= 1){
        bucket.tokens = bucket.tokens - 1;
        return true;
    }

    return false;
}