import express from "express";

const app = express();

app.use(express.json());

const queues = []

app.post("/email", (req, res)=>{
    try {
        const data = req.body;
        
        console.log(data);

        queues.push(data);
        return res.status(200).json({message: "Got it man", status: false});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal Server error", status: false});
    }
})

setInterval(()=>{
    if(queues.length === 0) return;
    const latestData = queues[queues.length - 1];
    console.log("email sent") // mock
    queues.shift();
    console.log("Length: ", queues.length)
}, 1000)

app.listen(4000, ()=>{
    console.log(`Server is listening at port 4000`)
})

