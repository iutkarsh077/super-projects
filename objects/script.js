class Person{
    constructor(fname, lname, age){
        this.fname = fname;
        this.lname = lname;
        this.age = age;
    }

    getAge = () =>{
        console.log(this.age)
    }
}

const p1 = new Person("Utkarsh", "Singh", 56);
console.log(p1)