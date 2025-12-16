"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Wages;
(function (Wages) {
    Wages[Wages["LOW"] = 0] = "LOW";
    Wages[Wages["MID"] = 1] = "MID";
    Wages[Wages["HIGH"] = 2] = "HIGH";
})(Wages || (Wages = {}));
class Jobs {
    onCampus() { }
}
class User {
    job;
    name;
    age;
    salary;
    constructor(name, age, salary, job) {
        this.job = job;
        this.name = name;
        this.age = age;
        this.salary = salary;
    }
    firstMethod() {
        console.log(this);
        this.job.onCampus();
    }
    getSalary() {
        return `${this.salary.toLocaleString("en-US", {
            style: "currency",
            currency: 'USD',
        })}`;
    }
}
// const firstUser = new User("Utkarsh", 21, 10000);
// console.log(firstUser.getSalary());
//# sourceMappingURL=oop.js.map