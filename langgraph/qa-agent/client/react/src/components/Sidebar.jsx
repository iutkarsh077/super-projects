const chatSessions = [
    "Getting started with LangGraph",
    "React authentication flow",
    "MongoDB connection help",
    "Ideas for my QA agent",
];

const Sidebar = () => (
    <aside className="flex w-72 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
            <button type="button" className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800">+ New chat</button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="Chat sessions">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Recent chats</p>
            <ul className="space-y-1">
                {chatSessions.map((session, index) => (
                    <li key={session}>
                        <button type="button" className={`w-full truncate rounded-lg px-3 py-2.5 text-left text-sm ${
                            index === 0 ? "bg-gray-100 font-medium text-gray-900" : "text-gray-600 hover:bg-gray-100"
                        }`}>
                            {session}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    </aside>
);

export default Sidebar;
