export function createBucket(capacity, refillPerSecond){
  return {
    capacity,
    tokens: capacity,
    refillPerSecond,
    lastRefill: Date.now()
  }
}

export function refillBucket(bucket){
  const now = Date.now();
  const intvervalInSec = (now - bucket.lastRefill) / 1000;
  if(intvervalInSec > 0){
    const addTokens = intvervalInSec * bucket.refillPerSecond;
    bucket.tokens = Math.min(addTokens + bucket.tokens, bucket.capacity)
    bucket.lastRefill = now;
  }
}

export function tryAndRemove(bucket){
  refillBucket(bucket);

  if(bucket.tokens >= 1){
    bucket.tokens = bucket.tokens - 1;
    return true;
  }

  return false;
}