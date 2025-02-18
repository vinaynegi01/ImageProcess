import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import ProcessingRequest from "../model/processrequest.js";
import XLSX from "xlsx";
import axios from "axios";
import sharp from "sharp";

const imageProcess = {
    downloadAndCompressImage: async (url, outputDir) => {
        try {
          const response = await axios({
            url,
            responseType: "arraybuffer",
          });
    
          let filename = path.basename(url).split("?")[0] || `${uuidv4()}.jpg`;
          if (!filename || !/\.(jpg|jpeg|png)$/i.test(filename)) {
            filename = `${uuidv4()}.jpg`;
          }
          const compressedFilePath = path.join(outputDir, filename);
        
          await sharp(response.data)
            .resize({ width: 500 })
            .jpeg({ quality: 50 })
            .toFile(compressedFilePath);
    
          return { filename, path: compressedFilePath };
        } catch (error) {
          console.error(`Failed to download or compress image from ${url}:`, error.message);
          return null;
        }
      },
    
      UploadCsvFile: async (req, res) => {
        try {
          if (!req.file) {
            return res.status(400).send("No file uploaded");
          }
    
          const outputDir = path.join(process.cwd(), "compressed-images");
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }
    
          // Create a new processing request
          const requestId = uuidv4();
          const processingRequest = new ProcessingRequest({
            requestId,
            status: "processing",
            products: [],
          });
          await processingRequest.save();
    
          // Parse Excel File
          const workbook = XLSX.readFile(req.file.path);
          const sheetName = workbook.SheetNames[0];
          const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    
          const products = [];
    
          for (const row of sheetData) {
            console.log("Row Data:", row); // Debugging
            if (row.serial && row.product && row.Images) {
              const urls = row.Images.split(",").map((url) => url.trim());
              const outputImages = [];
    
              for (const url of urls) {
                const result = await imageProcess.downloadAndCompressImage(url, outputDir);
                if (result) {
                  outputImages.push(result.path);
                }
              }
    
              products.push({
                serial: row.serial,
                product: row.product,
                inputImages: urls,
                outputImages: outputImages,
              });
            }
          }
    
          // Save products to ProcessingRequest
          processingRequest.products = products;
          processingRequest.status = "completed";
          await processingRequest.save();
    
          // Cleanup uploaded Excel file
          fs.unlinkSync(req.file.path);
    
          res.status(200).json({
            message: "Images processed and stored successfully",
            requestId: processingRequest.requestId,
            products: processingRequest.products,
          });
        } catch (error) {
          console.error("Error processing Excel file:", error);
          res.status(500).send("Internal Server Error");
        }
      },
        
};

export default imageProcess;
