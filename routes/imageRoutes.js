import express from "express";
import multer from "multer";
import imageProcess from "../controllers/imageProcess.js";
import statusController from "../controllers/statusController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), imageProcess.UploadCsvFile);
router.get("/status/:requestId", statusController.checkStatus);

export default router;
