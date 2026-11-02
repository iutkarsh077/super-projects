
# Building Reliable Systems: Caching, Redundancy, Health Checks, Retries, and Replication

## Introduction

A system does not run in perfect conditions all the time.

Servers crash. Networks fail. Databases become unavailable. Requests time out. Traffic increases beyond what a server can handle.

These failures are normal in distributed systems.

The real challenge is not to prevent every failure. It is to design a system that can continue to work when failures happen.

To understand this, we need to look at five important concepts:

1. Health Checks
2. Caching
3. Redundancy and Failover
4. Retry Mechanisms
5. Data Replication

Each concept solves a different problem. Together, they help build reliable and scalable systems.

---

## 1. Health Checks

### The problem

Imagine an application running on three backend servers.

One server crashes, but the load balancer continues to send requests to it.

Users start receiving errors.

How can the load balancer know that a server is no longer healthy?

This is the problem that health checks solve.

### What is a health check?

A health check is an endpoint that reports the health of an application.

For example:

\`\`\`javascript
app.get("/health-check", (req, res) => {
    return res.status(200).json({
        status: true,
        message: "Server is healthy"
    });
});
\`\`\`

An infrastructure component can call this endpoint at regular intervals.

If the server responds correctly, it can continue to receive traffic.

If it fails, the infrastructure can mark it as unhealthy.

### Types of health checks

**1. Liveness Check**

It answers one question:

Is the application process alive?

If the application stops responding, the infrastructure may restart it.

**2. Readiness Check**

It answers a different question:

Is the application ready to handle requests?

For example, the application process may be running, but the database connection may not be ready.

In that case, the application should not receive normal traffic.

### When should we use it?

- When running multiple backend instances.
- When using container orchestration.
- When deploying applications with Kubernetes.
- When configuring load balancers.

**Key takeaway:** A running server is not always a healthy server. Health checks help infrastructure make better routing decisions.

---

## 2. Caching

### The problem

Imagine 1,000 users request the same user list.

Without caching, the application may send 1,000 requests to the database or an external API.

This creates unnecessary work.

It increases response time and puts more pressure on the data source.

Can we avoid doing the same work repeatedly?

Yes. We can use caching.

### What is caching?

Caching means storing frequently accessed data temporarily so that future requests can access it faster.

The basic architecture looks like this:

\`\`\`text
             Client
                |
                v
          Application
                |
                v
              Cache
             /     \\
          HIT       MISS
           |          |
           v          v
       Return      Database
        Data           |
                       v
                 Store in Cache
                       |
                       v
                  Return Data
\`\`\`

### How does it work?

1. A client requests data.
2. The application checks the cache.
3. If the data exists, the application returns it.
4. If the data does not exist, the application queries the database.
5. The application stores the result in the cache.
6. The application returns the result.

This approach is called **Cache-Aside**.

### In-memory caching with Node.js

We can implement a basic cache using a JavaScript variable.

\`\`\`javascript
let cachedData = null;
let cacheExpiry = null;

const CACHE_TTL = 60 * 1000;

const getUsers = async () => {
    // Check whether cached data exists and is valid
    if (cachedData && Date.now() < cacheExpiry) {
        console.log("Cache HIT");
        return cachedData;
    }

    console.log("Cache MISS");

    const response = await fetch(
        "https://jsonplaceholder.typicode.com/users"
    );

    if (!response.ok) {
        throw new Error("Failed to fetch users");
    }

    const data = await response.json();

    cachedData = data;
    cacheExpiry = Date.now() + CACHE_TTL;

    return data;
};
\`\`\`

### What is TTL?

TTL stands for Time To Live.

It defines how long cached data remains valid.

For example:

- Cache TTL = 60 seconds.
- First request fetches data from the database.
- Requests during the next 60 seconds use cached data.
- After expiration, the application fetches fresh data.

### Problems with in-memory caching

In-memory caching has limitations:

- Cache data disappears when the server restarts.
- Every server instance has its own cache.
- Data can become stale.
- Memory is limited.

For distributed applications, we can use Redis.

Redis provides a shared cache that multiple application instances can access.

**Key takeaway:** Caching reduces repeated work. It improves response time and reduces database load.

---

## 3. Redundancy and Failover

### The problem

Imagine an application running on a single backend server.

Suddenly, that server crashes.

What happens to the application?

All requests fail because there is no other server to handle them.

This is called a **Single Point of Failure (SPOF)**.

A single point of failure is a component whose failure can make the entire system unavailable.

How can we reduce this risk?

We can introduce redundancy.

### What is redundancy?

Redundancy means having additional components that can perform the same task.

Instead of running one backend server, we run multiple independent instances.

\`\`\`text
                 Client
                    |
                    v
              Load Balancer
                    |
             +------+------+
             |             |
             v             v
          Server A      Server B
          Instance 1    Instance 2
\`\`\`

Now, if Server A fails, Server B can continue to handle requests.

### What is failover?

Failover is the process of switching from a failed component to a healthy component.

For example:

\`\`\`text
          Normal Operation

          Load Balancer
                |
          +-----+-----+
          |           |
          v           v
       Server A    Server B
        Active      Active


          After Server A Fails

          Load Balancer
                |
          +-----+-----+
          |           |
          v           v
       Server A    Server B
        Failed      Active
\`\`\`

The load balancer detects that Server A is unhealthy and stops routing traffic to it.

Server B continues to serve requests.

### Redundancy vs. Failover

These concepts are related but different.

- **Redundancy:** Provides additional components.
- **Failover:** Switches traffic or operations to another component after a failure.

Having two servers does not automatically provide failover. We also need a mechanism to detect failures and switch traffic.

**Key takeaway:** Redundancy reduces dependence on a single component. Failover helps maintain availability when a component fails.

---

## 4. Retry Mechanisms

### The problem

Imagine a client sends a request to a server.

The server is temporarily unavailable because of network congestion.

The request fails.

Should the application immediately show an error to the user?

Not always.

Some failures are temporary. A retry mechanism can help recover from them.

### What is a retry mechanism?

A retry mechanism attempts a failed operation again.

For example:

\`\`\`text
Client
   |
   | Request 1
   v
Server
   |
   | Failure
   v
Client waits
   |
   | Request 2
   v
Server
   |
   | Success
   v
Client receives response
\`\`\`

### Implementing retries

We can implement a retry mechanism in JavaScript.

\`\`\`javascript
const fetchUserList = async () => {
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const response = await fetch(
                "http://localhost:4000/users"
            );

            if (!response.ok) {
                throw new Error("Request failed");
            }

            const data = await response.json();

            return data;

        } catch (error) {
            if (attempt === 3) {
                throw error;
            }

            await new Promise(resolve =>
                setTimeout(resolve, attempt * 1000)
            );
        }
    }
};
\`\`\`

Here, the client makes a maximum of three attempts.

But there is another problem.

What happens if thousands of clients retry at the same time?

They may increase the load on an already overloaded server.

We need a better strategy.

### Exponential Backoff

Exponential backoff increases the waiting time between retries.

For example:

| Attempt | Waiting time |
|---|---:|
| 1 | 1 second |
| 2 | 2 seconds |
| 3 | 4 seconds |
| 4 | 8 seconds |

Instead of retrying immediately, the client waits longer after each failure.

### What is jitter?

Imagine 10,000 clients receive an error at the same time.

If all clients retry after exactly two seconds, the server may receive another sudden traffic spike.

Jitter adds a random delay to retry intervals.

This helps spread requests over time.

### Important considerations

Retries are not suitable for every operation.

For example, consider a payment request.

The payment may succeed on the server, but the response may fail to reach the client.

If the client retries without protection, the user may be charged twice.

To prevent this, systems use idempotency keys and other safeguards.

**Key takeaway:** Retries help recover from temporary failures. Exponential backoff and jitter help prevent retries from creating more failures.

---

## 5. Data Replication

### The problem

Imagine an application with millions of users.

Most users read data, but only a small percentage modify it.

If every read and write operation goes to a single database server, that server can become a bottleneck.

What happens if the database server fails?

The application may also become unavailable.

We need a way to distribute read operations and maintain additional copies of data.

This is where replication helps.

### What is replication?

Replication means maintaining copies of data across multiple database servers.

A common architecture uses a primary database and one or more replica databases.

\`\`\`text
              Application
                   |
                   v
            Primary Database
                   |
            Data Replication
                   |
             +-----+-----+
             |           |
             v           v
          Replica 1   Replica 2
\`\`\`

### How does it work?

**Primary Database**

- Handles write operations.
- Maintains the main copy of the data.
- Sends data changes to replicas.

**Replica Database**

- Receives replicated data.
- Can serve read operations.
- Provides an additional copy of the data.

For example:

\`\`\`text
Write Request  ---> Primary Database

Read Request   ---> Replica Database
\`\`\`

This can reduce the read load on the primary database.

### Types of replication

**1. Synchronous Replication**

The primary waits for confirmation from the required replicas before confirming a write.

This provides stronger consistency but can increase write latency.

**2. Asynchronous Replication**

The primary confirms a write before all replicas receive the change.

This can improve write performance, but replicas may temporarily contain older data.

This delay is called replication lag.

### Why do we need replication?

- Improve read scalability.
- Maintain additional copies of data.
- Support database failover.
- Improve availability.
- Support disaster recovery.

**Key takeaway:** Replication distributes data across multiple servers. It can improve read scalability and provide additional copies of data, but it also introduces consistency and replication-lag considerations.

---

## 6. How These Concepts Work Together

Each concept solves a different problem.

But a reliable system needs these concepts to work together.

Consider the following architecture:

\`\`\`text
                    Client
                       |
                       v
                 Load Balancer
                       |
                 Health Checks
                       |
                +------+------+
                |             |
                v             v
             Server A      Server B
                |             |
                +------+------+
                       |
                       v
                  Shared Cache
                    (Redis)
                       |
                       v
                Primary Database
                       |
                 Replication
                       |
                       v
                Replica Database
\`\`\`

Now consider what happens during normal operation and failures.

1. The client sends a request.
2. The load balancer routes it to a healthy backend server.
3. The application checks the cache.
4. If the cache contains the data, it returns the result.
5. If the cache misses, the application queries the database.
6. The database replicas receive changes from the primary database.
7. If a temporary network failure occurs, retry logic may attempt the request again.
8. If a backend server fails, the load balancer can route traffic to another healthy instance.

Each component has a clear responsibility.

- Health checks detect unhealthy services.
- Caching reduces repeated work.
- Redundancy provides additional components.
- Failover helps maintain service availability.
- Retries handle temporary failures.
- Replication maintains additional copies of data.

The goal is not to eliminate every failure. The goal is to limit the impact of failures.

---

## 7. Important Design Considerations

Implementing these concepts is only the first step. Each one introduces trade-offs.

| Concept | Main benefit | Main trade-off |
|---|---|---|
| Health Checks | Detect unhealthy services | Incorrect checks can remove healthy instances |
| Caching | Lower latency and database load | Stale data and invalidation |
| Redundancy | Reduce single points of failure | Higher infrastructure cost |
| Failover | Improve availability | Detection and switching delays |
| Retries | Recover from temporary failures | Additional server load |
| Replication | Read scalability and extra data copies | Replication lag and consistency |

Good system design is about understanding these trade-offs and choosing the right approach for the problem.

---

## Conclusion

Reliable systems are not built by assuming that everything will work correctly.

They are built by planning for failures.

Health checks help detect unhealthy services. Caching reduces repeated work. Redundancy provides additional components. Failover switches operations to healthy components. Retries help recover from temporary failures. Replication maintains additional copies of data.

These concepts form an important foundation for understanding distributed systems.

The next step is to explore how these ideas work in real-world environments using tools and technologies such as:

- Redis for distributed caching.
- Nginx for load balancing.
- Docker for containerization.
- PostgreSQL or MongoDB replication.
- Rate limiting for traffic control.
- Monitoring and observability tools.

**Final thought:** A reliable system is not one that never fails. It is one that is designed to handle failures without bringing down the entire application.
