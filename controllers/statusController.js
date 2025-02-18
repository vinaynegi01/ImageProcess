import processingRequestModel from "../model/processrequest.js";

const statusController = {
  checkStatus: async (req, res) => {
    try {
      const { requestId } = req.params;
      const request = await processingRequestModel.findOne({ requestId });

      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }

      res.json({ status: request.status, products: request.products });
    } catch (error) {
      console.error("Error checking status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

export default statusController;
