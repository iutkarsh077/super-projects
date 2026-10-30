import { Routes, Route } from "react-router-dom";
import Signup from "../components/Signup";
import Login from "../components/Login";
import Dashboard from "../components/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import Checkboxes from "../components/Checkboxes";
import UploadFiles from "../components/UploadFiles";
import MediaAccess from "../components/MediaAccess2";
import RecordingMedia from "../components/Recording";
import TextToSpeech from "../components/texttospeech";
import VoiceAgent from "../components/voiceagent";

const MyRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/checkbox" element={<Checkboxes />} />
            <Route path="/files" element={<UploadFiles />} />
            <Route path="/media" element={<MediaAccess />} />
            <Route path="/recording" element={<RecordingMedia />} />
            <Route path="/tts" element={<TextToSpeech />} />
            <Route path="/voice" element={<VoiceAgent />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
            </Route>
        </Routes>
    )
}

export default MyRoutes;