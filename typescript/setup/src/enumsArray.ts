const nums: number[] = [1, 2, 3, 4, 5, 6, 67, 7, 8];

const twoDArray: string[][] = [
    ["Utkarsh", "John"],
    ["Elia", "Virat"]
]

type user = {
    name: string;
    age: number
}

const myUsers: user[] = [
    {name: "Windows", age: 121},
    {name: "Utkarsh", age: 676}
]

// console.log(myUsers)

const tuple1: [number, boolean, string] = [12.1, true, "utkarsh"]

enum Wages {
    LOW,
    MID,
    HIGH
}

console.log(Wages[2])