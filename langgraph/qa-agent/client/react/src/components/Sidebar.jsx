import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../helpers/api";
import { setChatSessions } from "../features/ChatSessionSlice";
import { addCurrentChatSession } from "../features/UserSlices";
import { useNavigate, useSearchParams } from "react-router-dom";

const Sidebar = () => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.user.user);
    const chatSessions = useSelector((state) => state.chatSessions.sessions);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (!data?.id) return;

        const loadChatSessions = async () => {
            try {
                const response = await api.get(`/chat-sessions/${data.id}`);
                dispatch(setChatSessions(response.data.data));
            } catch (error) {
                console.error("Could not load chat sessions", error);
            }
        };

        loadChatSessions();
    }, [data?.id, dispatch]);

    const handleNewChatSession = () => {
        dispatch(addCurrentChatSession({ id: null }));
        setSearchParams({});
        // window.location.replace("/");
    };

    const handleChatSession = (id) => {
        dispatch(addCurrentChatSession({ id }));
        setSearchParams({
            session: id
        });
    }

    return (
        <aside className="flex w-72 shrink-0 flex-col border-r border-gray-200 bg-white">
            <div className="border-b border-gray-200 p-4">
                <button onClick={handleNewChatSession} type="button" className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800">+ New chat</button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3" aria-label="Chat sessions">
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Recent chats</p>
                <ul className="space-y-1">
                    {chatSessions.map((session, index) => (
                        <li key={session._id}>
                            <button onClick={() => handleChatSession(session._id)} type="button" className={`w-full truncate rounded-lg px-3 py-2.5 text-left text-sm ${index === 0 ? "bg-gray-100 font-medium text-gray-900" : "text-gray-600 hover:bg-gray-100"
                                }`}>
                                {session.title}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    )
}

export default Sidebar;
