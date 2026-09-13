import Sidebar from "./Sidebar";
import ChatSection from "./ChatSection";

const Home = () =>{
    return (
        <div className="h-screen w-screen overflow-hidden">
            <div className="flex h-full">
                <Sidebar/>
                <ChatSection/>
            </div>
        </div>
    )
}

export default Home;
