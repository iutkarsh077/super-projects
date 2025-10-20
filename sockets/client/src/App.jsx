import { useEffect } from "react";
import socket from "./Sockets";
import { useState } from "react";
import { useRef } from "react";

const App = () => {
  const [socketId, setSocketId] = useState(null);
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [welcomeNotification, setWelcomeNotification] = useState("");
  const [joinRoomNotification, setJoinRoomNotification] = useState([]);
  const [typingAlert, setTypingAlert] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [userCounts, setUserCounts] = useState(0);
  let typingTimer = useRef();
  useEffect(() => {
    const onConnect = async () => {
      setSocketId(socket.id);
      socket.emit("welcome");
    };

    const onDisconnect = (data) =>{
      setUserCounts(data.count);
    } 

    const welcomeNotification = (data) => {
      setWelcomeNotification(data);
    };

    const joinRoomNotification = (data) => {
      setJoinRoomNotification((prev) => [...prev, data.message]);
      setUserCounts(data.count)
    };

    const typingAlertNotification = (data) => {
      setTypingAlert((prev) => {
        const findSocket = prev.find(
          (item) => item.socket == data.socket
        );
        console.log("find socket: ", findSocket);
        console.log("data is: ", data);
        if (!findSocket && data.text.length > 0) {
          return [...prev, { socket: data.socket, message: data.message }];
        } else if (data.text.length <= 0 && findSocket) {
          return typingAlert.filter((item) => item.socket != data.socket);
        } else {
          return prev;
        }
      });
    };

    const receiveMessage = (msg) => {
      const data = {
        role: "Friend",
        message: msg,
      };
      setConversation((prev) => [...prev, data]);
    };

    socket.on("connect", onConnect);
    socket.on("join-room-notification", joinRoomNotification);
    socket.on("welcome-notification", welcomeNotification);
    socket.on("typing-alert-client", typingAlertNotification);
    socket.on("receive-message", receiveMessage);
    socket.on("disconnect1", onDisconnect)
    return () => {
      socket.off("connect", onConnect);
      socket.off("receive-message", receiveMessage);
      socket.off("welcome-notification", welcomeNotification);
      socket.off("join-room-notification", joinRoomNotification);
      socket.off("typing-alert-client", typingAlertNotification);
      socket.off("disconnect1", onDisconnect)
    };
  }, []);

  const sendMessage = async () => {
    const data = {
      role: "Me",
      message: message,
    };
    setConversation((prev) => [...prev, data]);
    socket.emit("send-message", { roomId, message });
  };

  const handleEnter = async (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const handleJoinRoomId = () => {
    socket.emit("join-room", { roomId, socketId });
  };

  const UserTypingAlert = (e) => {
    const text = e.target.value;
    clearTimeout(typingTimer.current)
    setMessage(text);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing-alert-server", { roomId, socketId, text })
    }, 500);
  };
  return (
    <div className="bg-zinc-800 min-h-screen">
      <p className="text-blue-500 text-xl font-semibold">
        Total Users are: {userCounts}
      </p>
      <h4 className="text-white text-xl font-semibold">{socketId}</h4>
      <h1 className="text-green-500 text-xl font-semibold">
        {welcomeNotification}
      </h1>
      <div>
        {joinRoomNotification.map((item, index) => (
          <p key={index} className="text-yellow-500 text-sm font-semibold">
            {item}
          </p>
        ))}
      </div>
      <div>
        {typingAlert.map((item, index) => (
          <p key={index} className="text-gray-300 text-sm font-semibold">
            {item.message}
          </p>
        ))}
      </div>
      <div>
        {conversation &&
          conversation?.map((item, index) => (
            <div key={index} className="flex gap-x-4 text-white">
              <span>{item.role}</span>
              <span>{item.message}</span>
            </div>
          ))}
      </div>
      <div className="flex flex-col  fixed bottom-2 left-2/5 gap-3">
        <p className="flex gap-x-4">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Write your RoomId here..."
            className="h-12 w-80 border-gray-300 border-2 text-white rounded-md pl-2"
          />
          <button
            onClick={handleJoinRoomId}
            className="bg-yellow-500 font-medium text-white px-5 py-3 rounded-md hover:bg-yellow-700 duration-300 ease-in-out transition-all hover:cursor-pointer"
          >
            Join
          </button>
        </p>
        <p className="flex gap-x-4">
          <input
            type="text"
            value={message}
            onKeyDown={handleEnter}
            onChange={UserTypingAlert}
            placeholder="Write your message here..."
            className="h-12 w-80 border-gray-300 border-2 text-white rounded-md pl-2"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-5 py-3 rounded-md hover:bg-blue-700 duration-300 ease-in-out transition-all hover:cursor-pointer"
          >
            Send
          </button>
        </p>
      </div>
    </div>
  );
};

export default App;
