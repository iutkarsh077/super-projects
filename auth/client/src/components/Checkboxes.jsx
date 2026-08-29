import { useEffect, useState } from "react"
import Child from "./Child";

const Checkboxes = () => {
    const [checkboxes, setCheckboxes] = useState([
        { id: 1, name: "First", checked: false },
        { id: 2, name: "Second", checked: false },
        { id: 3, name: "Third", checked: false },
        { id: 4, name: "Fourth", checked: false },

    ]);

    const [isSelectedAll, setIsSelectedAll] = useState(false);

    useEffect(()=>{
        checkboxes.forEach((item)=> {
            if(item.checked === false){
                setIsSelectedAll(false);
            }
        })
    }, [checkboxes])

    const handleSelectAll = (isSelectedAll) => {
        if (isSelectedAll) {
            setCheckboxes((prev) => prev.map((item) => ({ ...item, checked: true })))
        }

        setIsSelectedAll(isSelectedAll);
    }


    const individualSelect = (id) => {
        setCheckboxes((prev) => prev.map((item) => {
            if (id === item.id) {
                return { ...item, checked: !item.checked };
            }

            return item;
        }))
    }
    return (
        <>
            <div className="ml-5 mt-5">
                <div>
                    <input type="checkbox" checked={isSelectedAll} disabled={isSelectedAll} onChange={() => handleSelectAll(!isSelectedAll)} />
                    <span>Select All</span>
                </div>
                {checkboxes.map((item) => (
                    <div className="flex items-center gap-3" key={item.id}>
                        <input type="checkbox" checked={item.checked} onChange={() => individualSelect(item.id)} />
                        <span>{item.name}</span>

                    </div>
                ))}

                <Child isSelectedAll={isSelectedAll}/>
            </div>
        </>
    )
}

export default Checkboxes