const UploadedFile = async (req, res) => {
    try {

        console.log(req.file);
        return res.status(200).json({status: true, message: "Successfully uploaded the file"});
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", status: false });
    }
}

export default UploadedFile;