"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const addition = (p) => {
    return 6 * p;
};
const packageMethods = {
    startLoop() {
        return "Loop is started";
    },
    stopLoop() {
        console.log("Stop the loop here");
        return 1;
    }
};
const Values = {
    context: "Hey there"
};
const Response = {
    status: 500,
    data: {
        name: "Utkarsh",
        age: 21
    }
};
console.log(Response);
//# sourceMappingURL=interfaces.js.map