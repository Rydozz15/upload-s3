import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import axios from "axios";

export default function Accept(props) {
  //1. El primero es para guardar el archivo, el segundo para indicar el status
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  //Este elemento es inncesario para la implementación
  const [uploadResult, setUploadResult] = useState(null);

  //2. Este element cachea el archivo
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
  //3. La lógica de la librería, en accept se ve los tipos de archivo
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      accept: {
        "image/jpeg": [],
        "image/png": [],
      },
      onDrop,
    });
  //4. La función para subir el archivo
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
        "http://localhost:3000/upload", //Cambiar a la ruta que sea necesaria
        formData
      );
      console.log(response.data);
      //{Esta parte del código es innecesaria
      setUploadResult({
        link: response.data, // Assuming response.data contains the message
      });
      //Fin de parte innecesaria}
      setUploadStatus("upload successful");
    } catch (error) {
      console.log("imageUpload" + error);
      setUploadStatus("Upload failed..");
    }
  };
  //{Parte del código innecesaria
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
    //Hasta acá}
  ));

  return (
    <section className="container">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>Drag n drop some files here, or click to select files</p>
        <em>(Only *.jpeg and *.png images will be accepted)</em>
        <div>
          <button onClick={onUpload}>Upload button</button>
          <p>{uploadStatus}</p>
        </div>
      </div>
      {/*{Esta parte del código es innecesaria*/}
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
      {/*Hasta aquí}*/}
    </section>
  );
}
