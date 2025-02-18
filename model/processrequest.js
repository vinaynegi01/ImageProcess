import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  serial: String,
  product: String,
  inputImages: [String],
  outputImages: [String], // Stores local file paths
});

const ProcessRequestSchema = new mongoose.Schema({
  requestId: String,
  status: { type: String, enum: ["processing", "completed", "failed"] },
  products: [ProductSchema],
});

export default mongoose.model("ProcessingRequest", ProcessRequestSchema);
