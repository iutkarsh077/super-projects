import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react"
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

function App() {
  const cameraRef = useRef(null);
  const [mediaState, setMediaState] = useState({ media: null });
  useEffect(()=>{
    const cameraControls = async () =>{
      const res = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
      if(cameraRef.current){
        console.log(cameraRef.current.srcObject)
        cameraRef.current.srcObject = res;
        setMediaState({
          media: res
        })
      }
    }
    cameraControls();
  }, [])

  const handleStart = ()=>{
    const mediaRecorder = new MediaRecorder(mediaState.media, {
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 2500000,
      framerate: 25
    })

    mediaRecorder.ondataavailable = (e) =>{
      // console.log("Binary stream: ", e.data);
      socket.emit("binaryStream", e.data);
    }

    mediaRecorder.start(25)
  }
  return (
    <div> 
      <video ref={cameraRef} autoPlay muted></video>
      <button className="bg-black text-white px-5 py-2 font-medium text-sm border-2 rounded-md hover:cursor-pointer" onClick={handleStart}>Start</button>
    </div>
  )
}

export default App
