import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import axios from "axios";

export default function Accept(props) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadResult, setUploadResult] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 1) {
      setUploadStatus("Only one image can be uploaded at a time.");
      return;
    }
    const file = acceptedFiles[0];
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      setUploadStatus("Only image files (JPEG and PNG) are allowed.");
      return;
    }
    setSelectedImage(file);
  }, []);
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      accept: {
        "image/jpeg": [],
        "image/png": [],
      },
      onDrop,
    });
  const onUpload = async () => {
    if (!selectedImage) {
      setUploadStatus("Please select an image file to upload.");
      return;
    }

    setUploadStatus("Uploading...");
    const formData = new FormData();
    formData.append("image", selectedImage);
    try {
      const response = await axios.post(
        "http://localhost:3000/upload",
        formData
      );
      console.log(response.data);
      setUploadResult({
        link: response.data, // Assuming response.data contains the message
      });
      setUploadStatus("upload successful");
    } catch (error) {
      console.log("imageUpload" + error);
      setUploadStatus("Upload failed..");
    }
  };
  const acceptedFileItems = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
      <ul>
        {errors.map((e) => (
          <li key={e.code}>{e.message}</li>
        ))}
      </ul>
    </li>
  ));

  return (
    <section className="container">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>Drag n drop some files here, or click to select files</p>
        <em>(Only *.jpeg and *.png images will be accepted)</em>
        <div>
          <button onClick={onUpload}>Upload to Cloudinary</button>
          <p>{uploadStatus}</p>
        </div>
      </div>
      {uploadResult && (
        <div>
          <a href={uploadResult.link} target="_blank" rel="noreferrer noopener">
            {uploadResult.link}
          </a>
        </div>
      )}
      <aside>
        <h4>Accepted files</h4>
        <ul>{acceptedFileItems}</ul>
        <h4>Rejected files</h4>
        <ul>{fileRejectionItems}</ul>
      </aside>
    </section>
  );
}
