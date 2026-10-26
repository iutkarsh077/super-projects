"use client";
import { useState } from "react";
import { mockdata } from "../../../MOCK_DATA";

interface IData {
    id: number,
    first_name: string,
    last_name: string,
    gender: string,
    email: string,
    animal: string
}
const DebouncedPage = () => {
    const [data, setData] = useState<IData[] | null>(null);
    const search = (text: string) =>{
        const findById = mockdata.filter((item)=> item.id.toString() === text);
        const findByFirstName = mockdata.filter((item)=> item.first_name.toLowerCase() === text.toLowerCase());
        const findByLastName = mockdata.filter((item)=> item.last_name.toLowerCase() === text.toLowerCase());
        const findByEmail = mockdata.filter((item) => item.email.toLowerCase() === text.toLowerCase());
        const findBygender = mockdata.filter((item) => item.gender.toLowerCase() === text.toLowerCase());
        const findByAnimal = mockdata.filter((item) => item.animal.toLowerCase() === text.toLowerCase());
        const attachInOne = [...findById, ...findByFirstName, ...findByLastName, ...findByEmail, ...findBygender, ...findByAnimal];

        console.log("Result: ", attachInOne)
    }
    return (
        <div>
            This is debounced page
            <input type="text" onChange={(e)=>search(e.target.value)} placeholder="Write your search..." />
        </div>
    )
}

export default DebouncedPage;