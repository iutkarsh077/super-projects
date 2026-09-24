import express from "express";
import rateLimiter from "./tokenbucket.js";
const app = express();

const totalFloors = 10;
const slotsPerFloor = 20;

const totalParkingSlots = Array.from({ length: totalFloors }, () => Array(slotsPerFloor).fill({}));

console.log(totalParkingSlots);

const VehicleType = ["CAR", "BIKE", "TRUCK"];

const VehicleParkingCostPerHour = [
    { type: "CAR", cost: 20 },
    { type: "BIKE", cost: 10 },
    { type: "TRUCK", cost: 30 }
];


app.use(express.json());
app.use(rateLimiter);
const port = process.env.PORT || 3000;

app.get("/health", (req, res) => {
    res.send("Hello, World!");
});

app.post("/park", async (req, res) => {
    try {
        const { vehicleType, vehicleNumber } = req.body;

        console.log(vehicleType, vehicleNumber);

        if (!VehicleType.includes(vehicleType.toUpperCase())) {
            return res.status(400).json({ error: "Invalid vehicle type", status: 400 });
        }

        if (vehicleNumber.length < 4 || vehicleNumber.length > 10) {
            return res.status(400).json({ error: "Invalid vehicle number", status: 400 });
        }

        const perHourCost = VehicleParkingCostPerHour.find((item) => item.type === vehicleType.toUpperCase()).cost;

        for (let i = 0; i < totalParkingSlots.length; i++) {
            for (let j = 0; j < totalParkingSlots[i].length; j++) {
                if (Object.keys(totalParkingSlots[i][j]).length === 0) {
                    const vehicleParkedData = {
                        vehicleType: vehicleType.toUpperCase(),
                        vehicleNumber: vehicleNumber,
                        floor: i,
                        slot: j,
                        id: `${i}-${j}`,
                        parkingTime: new Date().toISOString(),
                        parkingCOstPerHour: perHourCost,
                        systemParkingTime: Date.now()
                    }
                    totalParkingSlots[i][j] = vehicleParkedData;
                    return res.status(200).json({ message: "Vehicle parked successfully", status: 200, ticketId: vehicleParkedData.id, floor: i, slot: j, parkingTime: vehicleParkedData.parkingTime, perHourCost: perHourCost });
                }
            }
        }

        throw new Error("Parking lot is full");
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", status: 500 });
    }
})


app.post("/unpark", async (req, res) => {
    try {
        const { ticketId } = req.body;

        for (let i = 0; i < totalParkingSlots.length; i++) {
            for (let j = 0; j < totalParkingSlots[i].length; j++) {
                if (totalParkingSlots[i][j].id === ticketId) {
                    const parkedVehicle = totalParkingSlots[i][j];
                    const systemParkingTime = parkedVehicle.systemParkingTime;
                    const currentTime = Date.now() + (2 * 60 * 60 * 1000);
                    const hoursParked = Math.ceil((currentTime - systemParkingTime) / (60 * 60 * 1000));
                    console.log("Hours parked: ", hoursParked)
                    const totalCost = hoursParked * parkedVehicle.parkingCOstPerHour;
                    totalParkingSlots[i][j] = {};
                    return res.status(200).json({ message: "Vehicle unparked successfully", status: 200, ticketId: ticketId, floor: i, slot: j, parkingTime: parkedVehicle.parkingTime, perHourCost: parkedVehicle.parkingCOstPerHour, hoursParked: hoursParked, totalCost: totalCost });
                }
            }
        }
        return res.status(404).json({ error: "Ticket not found", status: 404 });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", status: 500 });
    }
})


app.get("/get-free-slots", (req, res) => {
    try {
        let availableSlots = [];
        for (let i = 0; i < totalParkingSlots.length; i++) {
            for (let j = 0; j < totalParkingSlots[i].length; j++) {
                if (Object.keys(totalParkingSlots[i][j]).length === 0) {
                    availableSlots.push({
                        Floor: i,
                        slot: j
                    })
                }
            }
        }


        return res.status(200).json({ error: "Successfully got the available slots", status: 200, data: availableSlots });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", status: 500 });
    }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})