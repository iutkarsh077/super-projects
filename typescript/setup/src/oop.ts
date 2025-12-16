enum Wages {
    LOW,
    MID,
    HIGH
}
class Jobs{
    onCampus(){}
}
class User{
    name: string;
    readonly age: number;
    private salary: number;
    constructor(name: string, age: number, salary: number, private job: Jobs){
        this.name = name;
        this.age = age;
        this.salary = salary;
    }
    firstMethod(){
        console.log(this)
        this.job.onCampus()
    }
    getSalary(){
        return  `${this.salary.toLocaleString("en-US", {
            style: "currency",
            currency: 'USD',
        })}`;
    }
}
// const firstUser = new User("Utkarsh", 21, 10000);
// console.log(firstUser.getSalary());