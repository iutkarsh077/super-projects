import { ChevronsDownUp, BadgeCheck } from "lucide-react";
import { useState } from "react";
import { dropDownOptions } from "../utils/constant";
const Dropdown = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");

  const handleSelectOption = (item) => {
    setSelectedOption(item);
    setShowDropdown(false);
  };
  return (
    <div className="h-screen w-full bg-zinc-300 flex items-center justify-center">
      <div
        onClick={() => setShowDropdown(!showDropdown)}
        className={`border-2 border-black rounded-lg w-[20%] h-12`}
      >
        <div className="w-full flex justify-between px-3 relative items-center h-full">
          <p>{selectedOption ? selectedOption : "Select your option"}</p>
          <ChevronsDownUp className="hover:rotate-180 ease-in-out transition-all duration-300 hover:cursor-pointer" />
        </div>
        {showDropdown && (
          <div
            className={` absolute mt-4 w-[20%] h-40 overflow-y-scroll border-2 border-black rounded-lg ease-in-out duration-300 transition-all`}
          >
            {dropDownOptions.map((item, index)=>(
                <div onClick={()=>handleSelectOption(item)} key={index} className="border-b-2 border-gray-700 h-6 flex items-center justify-between px-3 py-6 hover:cursor-pointer">
                    <span>{item}</span>
                    {selectedOption === item && <BadgeCheck/>}
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropdown;
