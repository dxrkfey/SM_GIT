const axios = require("axios");
const FormData = require("form-data");
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();

const url_line_notification = "https://notify-api.line.me/api/notify";

module.exports = {
  callLineApi: async function (token, message, imagePath) {
    if (!token) {
      console.error("Error: Token is undefined");
      return;
    }

    try {
      const form = new FormData();
      form.append("message", message);
      if (imagePath) {
        form.append("imageFile", fs.createReadStream(imagePath));
      }

      const response = await axios.post(url_line_notification, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Notification sent successfully:", response.data);
    } catch (error) {
      console.error(
        "Error sending LINE notification:",
        error.response?.data || error.message
      );
    }
  },
};
