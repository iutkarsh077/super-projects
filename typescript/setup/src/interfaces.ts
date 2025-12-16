interface StarterPack {
    (price: number): number
}
const addition: StarterPack = (p)=>{
    return 6 * p
}
interface MoreMethods{
    startLoop(): void;
    stopLoop(): void;
}
const packageMethods: MoreMethods = {
    startLoop(){
        return "Loop is started"
    },
    stopLoop(){
        console.log("Stop the loop here")
        return 1
    }
}
interface First {}
interface Second {}
interface Third extends First, Second{}

interface Gen<T>{
    context: T
}
const Values: Gen<string> = {
     context: "Hey there"
}

interface ApiPromise<T>{
    status: number;
    data: T
}

const Response: ApiPromise<{name: string, age: number}> = {
    status: 500,
    data: {
        name: "Utkarsh",
        age: 21
    }
}

console.log(Response)