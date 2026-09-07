
import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "shopmindai-products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const fileFilter = (req, file, cb) => {
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;
  if (mimetypes.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Images only"), false);
  }
};

const upload = multer({ storage, fileFilter });
const uploadSingleImage = upload.single("image");

router.post("/", (req, res) => {
  uploadSingleImage(req, res, (err) => {
    if (err) {
      res.status(400).send({ message: err.message });
    } else if (req.file) {
      res.status(200).send({
        message: "Image uploaded successfully",
        image: req.file.path, // this is now the full Cloudinary URL
      });
    } else {
      res.status(400).send({ message: "No image file provided" });
    }
  });
});

export default router;