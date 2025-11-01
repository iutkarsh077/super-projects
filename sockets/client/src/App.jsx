import { useEffect } from "react";
import socket from "./Sockets";
import { useState } from "react";
import { useRef } from "react";
import Editor from "./components/Editor";

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
  const [editorContent, setEditorContent] = useState("");
  let typingTimer = useRef();
  useEffect(() => {
    const onConnect = async () => {
      setSocketId(socket.id);
      socket.emit("welcome");
    };

    const onDisconnect = (data) => {
      setUserCounts(data.count);
    };

    const editorTextContent = (text) => {
      console.log(text);
      setEditorContent(text);
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

    const receiveFile = ({ buffer, type }) => {
      const blob = new Blob([buffer], { type });
      const a = document.createElement("a");
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = "received_file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
    socket.on("editor-content-client", editorTextContent);
    return () => {
      socket.off("connect", onConnect);
      socket.off("receive-message", receiveMessage);
      socket.off("welcome-notification", welcomeNotification);
      socket.off("join-room-notification", joinRoomNotification);
      socket.off("typing-alert-client", typingAlertNotification);
      socket.off("disconnect1", onDisconnect);
      socket.off("receive-file", receiveFile);
      socket.off("editor-content-client", editorTextContent);
    };
  }, []);

  useEffect(() => {
    if (roomId && editorContent) {
      socket.emit("editor-content-server", { roomId, content: editorContent });
    }
  }, [editorContent]);

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
      socket.emit("send-file", { buffer, type: file.type, roomId });
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 min-h-screen flex flex-col">
      {/* Header Section */}
      <div className="bg-zinc-800/50 backdrop-blur-md border-b border-zinc-700 px-6 py-6">
        <div className="flex items-center justify-between gap-8">
          <div>
            <p className="text-blue-400 text-xl font-semibold">
              Total Users: <span className="text-white">{userCounts}</span>
            </p>
            <h4 className="text-gray-300 text-sm font-medium mt-1">
              Socket ID: <span className="text-yellow-400">{socketId}</span>
            </h4>
          </div>
          <h1 className="text-green-400 text-2xl font-semibold">
            {welcomeNotification || "Welcome to Chat"}
          </h1>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex flex-1 gap-6 p-6 overflow-hidden">
        {/* Left Sidebar - Room Activity & File Upload */}
        <div className="w-80 flex flex-col gap-6 overflow-y-auto">
          {/* Room Activity Section */}
          <div className="bg-zinc-700/60 backdrop-blur-md rounded-2xl p-5 shadow-lg flex-shrink-0">
            <h2 className="text-white text-lg font-semibold mb-3 border-b border-zinc-600 pb-2">
              Room Activity
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {joinRoomNotification.length > 0 ? (
                joinRoomNotification.map((item, index) => (
                  <p
                    key={index}
                    className="text-yellow-400 text-sm font-medium"
                  >
                    {item}
                  </p>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No activity yet</p>
              )}
              {typingAlert.map((item, index) => (
                <p key={index} className="text-gray-300 text-sm font-semibold">
                  {item.message}
                </p>
              ))}
            </div>
          </div>

          {/* File Upload Section */}
          <div className="bg-zinc-700/60 backdrop-blur-md rounded-2xl p-5 shadow-lg flex-shrink-0">
            <h2 className="text-white text-lg font-semibold mb-3 border-b border-zinc-600 pb-2">
              Share File
            </h2>
            <div className="space-y-3">
              <div>
                <input
                  type="file"
                  onChange={handleFile}
                  className="w-full h-12 bg-zinc-900 border border-zinc-700 text-gray-300 rounded-lg px-3 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
              </div>
              <button
                onClick={handleSendFile}
                // disabled={!previewFiles}
                className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Upload
              </button>
            </div>

            {/* File Preview */}
            {previewFiles && (
              <div className="mt-4 pt-4 border-t border-zinc-600">
                <p className="text-gray-300 text-sm mb-2">Preview:</p>
                <img
                  src={previewFiles || "/placeholder.svg"}
                  className="w-full h-40 object-cover rounded-lg"
                  alt="Preview"
                />
              </div>
            )}
          </div>

          {/* Room Join Section */}
          <div className="bg-zinc-700/60 backdrop-blur-md rounded-2xl p-5 shadow-lg flex-shrink-0">
            <h2 className="text-white text-lg font-semibold mb-3 border-b border-zinc-600 pb-2">
              Join Room
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter Room ID..."
                className="flex-1 h-10 bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
              />
              <button
                onClick={handleJoinRoomId}
                className="bg-yellow-500 font-medium text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all duration-300 text-sm"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Chat Section */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          {/* Conversation Section */}
          <div className="bg-zinc-700/60 backdrop-blur-md rounded-2xl p-5 shadow-lg flex-1 flex flex-col overflow-hidden">
            <h2 className="text-white text-lg font-semibold mb-3 border-b border-zinc-600 pb-2 flex-shrink-0">
              Conversation
            </h2>
            <div className="space-y-3 overflow-y-scroll max-h-[500px] flex-1">
              {conversation.length > 0 ? (
                conversation.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${
                      item.role === "You" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span
                      className={`px-4 py-2 rounded-xl max-w-xs flex gap-x-4 items-center ${
                        item.role === "You"
                          ? "bg-blue-600 text-white"
                          : "bg-zinc-600 text-gray-200"
                      }`}
                    >
                      <span className="block text-xs font-semibold opacity-75">
                        {item.role}
                      </span>
                      <span className="block text-sm">{item.message}</span>
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No messages yet. Start chatting!
                </p>
              )}
            </div>
          </div>

          {/* Message Input Section */}
          <div className="bg-zinc-700/60 backdrop-blur-md rounded-2xl p-5 shadow-lg flex-shrink-0">
            <div className="flex gap-3">
              <input
                type="text"
                value={message}
                onKeyDown={handleEnter}
                onChange={UserTypingAlert}
                placeholder="Type your message..."
                className="flex-1 h-12 bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
      <Editor
        setEditorContent={setEditorContent}
        editorContent={editorContent}
      />
    </div>
  );
};

export default App;
