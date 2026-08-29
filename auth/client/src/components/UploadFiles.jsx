import { useState } from "react";
import api from "../lib/api";

const UploadFiles = () => {
    const [fileDetails, setFileDetails] = useState(null);
    const [progress, setProgress] = useState(0);

    const allowedFiles = ["image/jpeg", "image/jpg", "image/png"];

    const [realImageUrl, setRealImageUrl] = useState(null);
    const handleFileChange = async (e) => {
        const fileDetail = e.target.files;
        setFileDetails(fileDetail);
        try {

            const formdata = new FormData();
            const fileArray = Array.from(e.target.files);

            const isAllImage = fileArray.every((item) => item.type === allowedFiles.find((it) => it === item.type))
            if (!isAllImage) {
                alert("Inavlid file type");
                return;
            }

            let allUrls = [];
            for (let i = 0; i < fileArray.length; i++) {
                formdata.append("photo", fileArray[i]);
                const file = fileArray[i];
                const url = URL.createObjectURL(file);
                allUrls.push(url);
            }
            
            setRealImageUrl(allUrls);
            console.log("image url is: ", allUrls)


            console.log(formdata)

            const res = await api.post("/upload-file", formdata, {
                onUploadProgress: (e) => {
                    console.log(e);
                    // consoel.log()
                    setProgress((e.loaded / e.total) * 100)
                }
            })

            console.log(res);

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div>
            Upload files from here
            <input type="file" accept="image/*" multiple placeholder="Upload file from here" className="border-black border " onChange={handleFileChange} />
            Progress is: {progress}
            <div className="w-screen">
                <div className={`transition-all duration-300 h-4 bg-green-700`} style={{ width: `${progress}%` }} />
            </div>

            <div>
                {
                    realImageUrl?.map((item, index) => (
                        <div key={index}>
                            <img src={item} alt="image" className="h-10 w-auto object-cover"/>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}


export default UploadFiles;