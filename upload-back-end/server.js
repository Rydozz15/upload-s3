import express from "express";
import cors from "cors";
//Elements to upload
import "dotenv/config";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// AWS configuration (replace with your actual credentials)
const s3Client = new S3Client({
  region: process.env.AWS_S3_BUCKET_REGION, // Replace with your region if different
  credentials: {
    accessKeyId: process.env.AWS_ACCES_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCES_KEY,
  },
});
const myBucket = process.env.AWS_BUCKET_NAME; // Replace with your bucket name

// Multer configuration
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 3 },
}); // 3 MB limit

// Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    res.status(400).send("Error uploading file: " + error.message);
  } else if (error) {
    res.status(400).send("Error: " + error.message);
  } else {
    next();
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Server uploader Online");
});

// Upload route
app.post("/upload", upload.single("image"), async (req, res) => {
  const file = req.file;
  let fileName = file.originalname.replace(/\s/g, "");
  const params = {
    Bucket: myBucket,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const result = await s3Client.send(new PutObjectCommand(params));
    let accesUrl = `https://${myBucket}.s3.${process.env.AWS_S3_BUCKET_REGION}.amazonaws.com/${fileName}`;
    res.status(200).send(`${accesUrl}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading file to S3");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});

export default app;
