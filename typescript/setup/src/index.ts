// function greet(name: string): string{
//     return `Hello ${name}`
// }

// console.log(greet("John wick"))

// let myWorkStatus: 'success' | 'error' | 'half-done'  = "half-done";
// console.log(myWorkStatus)
// myWorkStatus = "success"
// console.log(myWorkStatus)

function greet(msg: string | number){
    if(typeof(msg) === "string"){
        return `Hey ${msg}`
    }

    return `This is a number ${msg}`
}

// console.log(greet("Utkarsh"))


// type vegetarian = { type: "Paneer", quantity: number}
// type nonVegetarian = { type: "Chicken", quantity: number }

// function Order(items: vegetarian | nonVegetarian){
//     switch (items.type) {
//         case "Paneer":
//             return "Customer ordered Butter Paneer"
        
//         case "Chicken":
//             return "Customer Order Chicken Tikka masala"
//     }
// }


// const value: unknown = 43

// if(typeof value === "number"){
//     console.log(value)
// }


// let value: any = "32"

// let cheese = (value as string).length;
// console.log(cheese)

// type book = {
//     name: string
// }
// const books = '{"name": "Flying car"}'
// const duplicate = JSON.parse(books) as book;
// console.log(duplicate.name)

// type Role = "admin" | "user";

// function RedirectToAnotherPage(role: Role): void{
//     if(role === "admin"){
//         console.log("Return to Admin dashboard")
//     }

//     if(role === "user"){
//         console.log("Redirect to Home Page");
//     }
// }


type Brand = {
    readonly name: string;
    model: string
}
type Engine = {
    type: string
}
function MyCar(car: Brand & Engine): void{
    console.log(car)
}
const obj:Brand & Engine = {
    name: "TATA",
    model: "Safari",
    type: "Diesel"
}

interface Coffee {
  item: "Capacino" | "Latte" | "Espresso" | "Mocha" | "Americano";
}
class OrderCoffee implements Coffee {
    item: "Capacino" | "Latte" | "Espresso" | "Mocha" | "Americano"  = "Capacino";
}

const firstOrder = new OrderCoffee()
console.log(firstOrder);

interface hey{
    name: string
}

interface hey{
    name: string
}