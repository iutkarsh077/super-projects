import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { removeTodo, setEditingTodo } from "../features/todoSlice";

const ShowTodos = () => {
  const selector = useSelector((state) => state.todos);
  const dispatch = useDispatch();
  return (
    <div>
      {selector.map((item) => (
        <div key={item.id} className="flex items-center gap-x-3">
          <span>{item.text}</span>
          <span
            className="bg-red-600 px-4 py-1"
            onClick={() => dispatch(removeTodo(item.id))}
          >
            X
          </span>
          <span
            className="bg-yellow-600 px-4 py-1"
            onClick={() => dispatch(setEditingTodo(item))}
          >
            U
          </span>
        </div>
      ))}
    </div>
  );
};

export default ShowTodos;
