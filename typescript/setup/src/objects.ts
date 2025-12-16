// type hey = {
//     name: "Utkarsh" | "Here"
// }

// function greet(words: hey){
//     console.log(words)
// }

// greet({name: "Utkarsh"})


type ingredients = {
    milk: number;
    tea: string
}

let chai = {
    milk: 200,
    tea: "Taaza",
    cups: 10
}

const chaiTwo: ingredients = chai
// console.log(chaiTwo)

type User = {
    name: string;
    age: number;
    gender: "Male" | "Female"
}
const firstUser: Partial<User> = {
    name: "Utkarsh",
    age: 12
}
type Employee = {
    name?: string;
    age?: number;
    gender?: "Male" | "Female"
}
const secondUser: Required<Employee> = {
    name: "John",
    age: 12,
    gender: "Male"
}
const thirdUser: Pick<Employee, "name" | "gender"> = {
    name: "John Elia",
    gender: "Male"
}
console.log(firstUser)
console.log(secondUser)
console.log(thirdUser)