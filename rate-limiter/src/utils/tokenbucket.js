export function createBucket(capacity, refillPerSecond) {
  return {
    capacity,
    tokens: capacity,
    refillPerSecond,
    lastRefill: Date.now(),
  };
}

export function Refill(bucket) {
  const intervalInSec = (Date.now() - bucket.lastRefill) / 1000;
  if (intervalInSec > 0) {
    const addToken = intervalInSec * bucket.refillPerSecond;
    bucket.tokens = Math.min(addToken + bucket.tokens, bucket.capacity);
    bucket.lastRefill = Date.now();
  }
}

export function tryAndRemove(bucket) {
  Refill(bucket);

  const tokenLeft = bucket.tokens;
  if (tokenLeft >= 1) {
    bucket.tokens = bucket.tokens - 1;
    return true;
  }

  return false;
}
