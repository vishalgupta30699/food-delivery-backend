import express from "express";
import {
  getVandorProfile,
  updateVandorProfile,
  updateVandorService,
  vandorLogin,
} from "../controllers";
import { Authenticate } from "../middlewares";

const router = express.Router();

router.post("/login", vandorLogin);

router.get("/profile", Authenticate, getVandorProfile);
router.patch("/profile", Authenticate, updateVandorProfile);
router.patch("/service", Authenticate, updateVandorService);

export { router as VandorRoute };
