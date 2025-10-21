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
  const [file, setFile] = useState(null);
  const [previewFiles, setPreviewFiles] = useState(null);
  let typingTimer = useRef();
  useEffect(() => {
    const onConnect = async () => {
      setSocketId(socket.id);
      socket.emit("welcome");
    };

    const onDisconnect = (data) => {
      setUserCounts(data.count);
    };

    const welcomeNotification = (data) => {
      setWelcomeNotification(data);
    };

    const joinRoomNotification = (data) => {
      setJoinRoomNotification((prev) => [...prev, data.message]);
      setUserCounts(data.count);
    };

    const typingAlertNotification = (data) => {
      setTypingAlert((prev) => {
        const findSocket = prev.find((item) => item.socket == data.socket);
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

    const receiveFile = ({buffer, type }) => {
      const blob = new Blob([buffer], { type });
      const a = document.createElement("a");
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = "received_file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url)
      // const preview = URL.createObjectURL(base64);
      // setPreviewFiles(base64)
    };

    socket.on("connect", onConnect);
    socket.on("join-room-notification", joinRoomNotification);
    socket.on("welcome-notification", welcomeNotification);
    socket.on("typing-alert-client", typingAlertNotification);
    socket.on("receive-message", receiveMessage);
    socket.on("disconnect1", onDisconnect);
    socket.on("receive-file", receiveFile);
    return () => {
      socket.off("connect", onConnect);
      socket.off("receive-message", receiveMessage);
      socket.off("welcome-notification", welcomeNotification);
      socket.off("join-room-notification", joinRoomNotification);
      socket.off("typing-alert-client", typingAlertNotification);
      socket.off("disconnect1", onDisconnect);
      socket.off("receive-file", receiveFile);
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
    clearTimeout(typingTimer.current);
    setMessage(text);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing-alert-server", { roomId, socketId, text });
    }, 500);
  };

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSendFile = () => {
//     if (file.size > 500 * 1024) {
//   alert("File too large to send via socket!");
//   return;
// }
    const reader = new FileReader();
    reader.onload = (event) => {
      console.log(event.target.result);
      const buffer = event.target.result;
      socket.emit("send-file", {buffer, type: file.type, roomId });
    };
    reader.readAsArrayBuffer(file);
  };
  return (
   <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 min-h-screen flex flex-col items-center py-10 px-4">
  {/* Header Section */}
  <div className="text-center mb-10">
    <p className="text-blue-400 text-2xl font-semibold">
      Total Users: <span className="text-white">{userCounts}</span>
    </p>
    <h4 className="text-gray-300 text-lg font-medium mt-2">
      Socket ID: <span className="text-yellow-400">{socketId}</span>
    </h4>
    <h1 className="text-green-400 text-xl font-semibold mt-3">
      {welcomeNotification}
    </h1>
  </div>

  {/* Notifications Section */}
  <div className="bg-zinc-700/60 backdrop-blur-md rounded-2xl p-5 w-full max-w-3xl mb-6 shadow-lg">
    <h2 className="text-white text-lg font-semibold mb-3 border-b border-zinc-600 pb-2">
      Room Activity
    </h2>
    <div className="space-y-2">
      {joinRoomNotification.map((item, index) => (
        <p key={index} className="text-yellow-400 text-sm font-medium">
          {item}
        </p>
      ))}
      {typingAlert.map((item, index) => (
        <p key={index} className="text-gray-300 text-sm font-semibold">
          {item.message}
        </p>
      ))}
    </div>
  </div>

  {/* Conversation Section */}
  <div className="bg-zinc-700/60 backdrop-blur-md rounded-2xl p-5 w-full max-w-3xl mb-6 shadow-lg">
    <h2 className="text-white text-lg font-semibold mb-3 border-b border-zinc-600 pb-2">
      Conversation
    </h2>
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {conversation?.map((item, index) => (
        <div
          key={index}
          className={`flex items-start gap-3 ${
            item.role === "You" ? "justify-end" : "justify-start"
          }`}
        >
          <span
            className={`px-4 py-2 rounded-xl ${
              item.role === "You"
                ? "bg-blue-600 text-white"
                : "bg-zinc-600 text-gray-200"
            }`}
          >
            <span className="block text-sm font-semibold">{item.role}:</span>
            <span className="block text-base">{item.message}</span>
          </span>
        </div>
      ))}
    </div>
  </div>

  {/* Input Section */}
  <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-full max-w-3xl flex flex-col gap-4 bg-zinc-800/90 p-5 rounded-2xl shadow-2xl backdrop-blur-md">
    {/* Room Input */}
    <div className="flex gap-3">
      <input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter Room ID..."
        className="h-12 flex-1 bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
      />
      <button
        onClick={handleJoinRoomId}
        className="bg-yellow-500 font-medium text-white px-5 py-3 rounded-lg hover:bg-yellow-600 transition-all duration-300"
      >
        Join
      </button>
    </div>

    {/* Message Input */}
    <div className="flex gap-3">
      <input
        type="text"
        value={message}
        onKeyDown={handleEnter}
        onChange={UserTypingAlert}
        placeholder="Type your message..."
        className="h-12 flex-1 bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={sendMessage}
        className="bg-blue-500 text-white px-5 py-3 rounded-lg hover:bg-blue-600 transition-all duration-300"
      >
        Send
      </button>
    </div>

    {/* File Upload */}
    <div className="flex gap-3">
      <input
        type="file"
        onChange={handleFile}
        className="flex-1 h-12 bg-zinc-900 border border-zinc-700 text-gray-300 rounded-lg px-3 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
      />
      <button
        onClick={handleSendFile}
        className="bg-green-500 text-white px-5 py-3 rounded-lg hover:bg-green-600 transition-all duration-300"
      >
        Upload
      </button>
    </div>
  </div>

  {/* Preview Section */}
  {previewFiles && (
    <div className="fixed bottom-32 right-5 bg-zinc-800 p-3 rounded-xl shadow-xl border border-zinc-700">
      <img
        src={previewFiles}
        className="w-40 h-40 object-cover rounded-lg"
        alt="Preview"
      />
    </div>
  )}
</div>

  );
};

export default App;
