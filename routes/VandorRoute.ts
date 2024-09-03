import express from "express";
import {
  addFood,
  getFoods,
  getVandorProfile,
  updateVandorCoverImage,
  updateVandorProfile,
  updateVandorService,
  vandorLogin,
} from "../controllers";
import { Authenticate } from "../middlewares";
import multer from "multer";

const router = express.Router();

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "_" + file.originalname
    );
  },
});

const images = multer({ storage: imageStorage }).array("images", 10);

router.post("/login", vandorLogin);

router.use(Authenticate);
router.get("/profile", getVandorProfile);
router.patch("/profile", updateVandorProfile);
router.patch("/service", updateVandorService);
router.patch('/coverimage',images,updateVandorCoverImage);

router.post("/food", images, addFood);
router.get("/foods", getFoods);

export { router as VandorRoute };
