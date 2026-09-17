import { useEffect, useState } from "react";
import api from "../helpers/api"
import { useSelector } from "react-redux";

const UploadFiles = () => {
    const [allFiles, setFiles] = useState([]);
    const data = useSelector((state) => state.user.user);
    const currentChatSession = useSelector(
        (state) => state.user?.currentChatSessionId
    );

    const handleAllFiles = async (e) => {
        try {
            const files = e.target.files;

            console.log(files)

            const UpdateFiles = [...allFiles, ...files]
            const latestFiles = Array.from(files);
            setFiles(UpdateFiles)

            const formData = new FormData();

            latestFiles.forEach((file) => {
                formData.append("files", file);
            });

            const userId = data?.id;
            const chatSessionId = currentChatSession || null;


            formData.append("userId", userId);
            if (chatSessionId) {
                formData.append("sessionId", chatSessionId)

            }
            const res = await api.post("/uploadfiles", formData);

            console.log(res);
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="h-full">
            <div className="flex items-center">
                <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center justify-center"
                >
                    📁
                </label>

                <input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleAllFiles}
                    className="hidden"
                />
            </div>
        </div>
    )
}

export default UploadFiles;