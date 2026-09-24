# Parking Lot System in a Machine Coding Round

This problem is a classic in-memory design question. The goal is to build a parking lot with multiple floors, support for different vehicle types, and operations like park, unpark, and free-slot lookup. In a coding round, the expected approach is to keep the solution simple, fast, and easy to reason about.

## Design

A parking lot can be modeled as a 2D matrix:

- rows = floors
- columns = slots in each floor

For example:

- 10 floors
- 20 slots per floor

This makes slot scanning straightforward. Each slot is either empty or contains a parked vehicle record with details like:

- `vehicleType`
- `vehicleNumber`
- `floor`
- `slot`
- `ticketId`
- `parkingTime`
- `costPerHour`

## Parking logic

When a vehicle arrives:

1. Validate the vehicle type.
2. Validate the vehicle number format.
3. Scan all floors and slots from top to bottom.
4. Park the vehicle in the first empty slot.
5. Generate a ticket ID and return the slot details.

This is a first-fit strategy and is easy to implement in O(F × S) time.

## Unpark logic

When a vehicle exits:

1. Find the ticket in the parking grid.
2. Compute the elapsed time since parking.
3. Calculate billing as:
   `hoursParked = ceil((currentTime - parkingTime) / 1 hour)`
4. Multiply the hours by the per-hour price for that vehicle type.
5. Free the slot and return the bill.

This matches the requirement that the fee is rounded up to the next hour.

## Pricing

Each vehicle type has a separate hourly price:

- bike: 10
- car: 20
- truck: 30

The pricing is stored in a map, and the system uses the vehicle type to fetch the correct rate during unpark.

## Free slot query

A simple `getFreeSlots` function scans all slots and returns the empty ones. 

## Complexity

For `F` floors and `S` slots per floor:

- `park`: O(F × S)
- `unpark`: O(F × S)
- `getFreeSlots`: O(F × S)
- Space: O(F × S)

This is efficient enough for the constraints in the problem and is the most common approach in machine coding interviews.

## Why this implementation works well

This design is easy to explain, simple to code, and matches real-world expectations:

- multiple floors
- vehicle-type-based pricing
- first available slot selection
- ticket-based exit
- rounded-up parking charges

In short, the key idea is to treat the parking lot as a 2D slot matrix and keep all state in memory, which makes the system fast, deterministic, and interview-friendly.
