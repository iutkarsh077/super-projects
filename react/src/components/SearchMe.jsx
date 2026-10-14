import { useState } from "react";
import { users } from "../constant";

const SearchMe = () => {
    const [results, setResults] = useState([]);
    const handleSearch = (text) => {
        const searchName = users.filter((item) => item.name.toLowerCase() === text.toLowerCase())
        const searchEmail = users.filter((item) => item.email.toLowerCase() === text.toLowerCase())
        const searchCompany = users.filter((item) => item.company.toLowerCase() === text.toLowerCase())
        const searchWork = users.filter((item) => item.work.toLowerCase() === text.toLowerCase())

        setResults([...searchName, ...searchEmail, ...searchCompany, ...searchWork]);
    }

    function debouncingSearch(func, delay){
        let timer;

        return function(...args){
            clearTimeout(timer);
            timer = setTimeout(()=>{
                console.log("running");
                func.apply(this, args);
            }, delay);
        }
    }

    const handleDebouncingSearch = debouncingSearch(handleSearch, 2000)

    return (
        <div>
            <div className="w-full flex items-center justify-center mt-2">
                <input type="text" className="border rounded-md border-black text-black  p-1" placeholder="Enter your search here..." onChange={(e)=> handleDebouncingSearch(e.target.value)}   />
            </div>

            <ul className="w-full flex flex-col items-center justify-center mt-2">
                {
                    (results && results.length > 0) && (
                        results.map((item)=> (
                            <li key={item.email}>
                                {item.name} - {item.company}
                            </li>
                        ))
                    )
                }
            </ul>
        </div>
    )
}

export default SearchMe