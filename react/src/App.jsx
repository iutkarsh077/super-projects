import { Link } from "react-router-dom";
import { routerConstant } from "./utils/constant";

function App() {
  return (
    <div className="bg-gray-300 h-screen w-full grid grid-cols-4 p-10 gap-x-8">
      {routerConstant.map((item, index)=>(
        <Link key={index} to={item.path}>
        <div
          className=" h-40 bg-white rounded-xl shadow-lg border border-gray-200 p-4 
                      hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
        >
          <h2 className="text-xl font-semibold text-gray-800">{item.title}</h2>
          <p className="mt-2 text-gray-500 text-sm">
            {item.description}
          </p>

          <div className="mt-4 bg-blue-500 text-white px-4 py-2 text-sm rounded-lg w-fit">
            Start
          </div>
        </div>
      </Link>
      ))}
    </div>
  );
}

export default App;
