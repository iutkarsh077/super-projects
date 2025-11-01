import AddTodo from "./components/AddTodo"
import ShowTodos from "./components/ShowTodos"

const App = () => {
  return (
    <div className='min-h-screen flex flex-col gap-y-7 items-center justify-center'>
    <AddTodo/>
    <ShowTodos/>
    </div>
  )
}

export default App
