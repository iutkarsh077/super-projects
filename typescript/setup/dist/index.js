"use strict";
// function greet(name: string): string{
//     return `Hello ${name}`
// }
Object.defineProperty(exports, "__esModule", { value: true });
// console.log(greet("John wick"))
// let myWorkStatus: 'success' | 'error' | 'half-done'  = "half-done";
// console.log(myWorkStatus)
// myWorkStatus = "success"
// console.log(myWorkStatus)
function greet(msg) {
    if (typeof (msg) === "string") {
        return `Hey ${msg}`;
    }
    return `This is a number ${msg}`;
}
function MyCar(car) {
    console.log(car);
}
const obj = {
    name: "TATA",
    model: "Safari",
    type: "Diesel"
};
class OrderCoffee {
    item = "Capacino";
}
const firstOrder = new OrderCoffee();
console.log(firstOrder);
//# sourceMappingURL=index.js.map