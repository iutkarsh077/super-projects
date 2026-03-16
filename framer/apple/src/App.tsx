import Mac from "./components/Mac"
import Navbar from "./components/Navbar"

const App = () => {
  return (
    <div className="font-apple">
      <Navbar/>
      <main>
        <Mac/>
      </main>
    </div>
  )
}

export default App
