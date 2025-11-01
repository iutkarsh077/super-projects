import { useState } from "react"
import { useDispatch } from "react-redux";
import { addTodo, updateTodo } from "../features/todoSlice";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const AddTodo = () => {
    const [inputTodo, setInputTodo] = useState("");
    const editingTodo = useSelector((state) =>state.editingTodo);
    const dispatch = useDispatch();

    useEffect(()=>{
        if(editingTodo != null){
            setInputTodo(editingTodo.text);
        }
    }, [editingTodo])

    const addTodoHandler = () =>{
        dispatch(addTodo(inputTodo));
        setInputTodo("")
    }

    const updateTodoHandler = () =>{
        dispatch(updateTodo(inputTodo))
        setInputTodo("")
    }
  return (
    <div className="flex  gap-x-4 ">
      <input type="text" value={inputTodo} onChange={(e)=>setInputTodo(e.target.value)} placeholder="Enter your todo here..." className="text-white border-white border-2 h-10 rounded-md pl-2 py-3" />
      <button onClick={editingTodo != null ? updateTodoHandler : addTodoHandler} className="bg-blue-500 hover:bg-blue-700 ease-in-out transition-colors duration-300 px-7 py-2 rounded-md text-white">{editingTodo != null ? "Update": "Add"}</button>
    </div>
  )
}

export default AddTodo
