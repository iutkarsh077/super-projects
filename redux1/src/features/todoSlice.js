import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  todos: [{ id: 1, text: "Hello World" }],
  editingTodo: null,
};

const todoSlice = createSlice({
  name: "todo",
  initialState,
  reducers: {
    addTodo: (state, action) => {
      const todo = {
        id: nanoid(),
        text: action.payload,
      };

      state.todos.push(todo);
    },

    setEditingTodo: (state, action) => {
      console.log("edit the todo is: ", action);
      state.editingTodo = action.payload;
    },

    removeTodo: (state, action) => {
      const filteredTodo = state.todos.filter(
        (todo) => todo.id !== action.payload
      );
      state.todos = filteredTodo;
    },

    updateTodo: (state, action) =>{
        const updatedTodo = state.todos.filter((todo) =>{
            if(todo.id !== state.editingTodo.id) return todo;
            todo.text = action.payload;
            return todo;
        })
        state.todos = updatedTodo
        state.editingTodo = null;
    }
  },
});

export const { addTodo, removeTodo, setEditingTodo, updateTodo } = todoSlice.actions;
export default todoSlice.reducer;
