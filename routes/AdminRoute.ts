import express from "express";
import { createVandor, getVandorById, getVandors } from "../controllers";

const router = express.Router();

router.post("/vandor", createVandor);
router.get("/vandors", getVandors);
router.get("/vandor/:id", getVandorById);

router.get("/", (req, res) => {
  res.json({ message: "Hello from Admin" });
});

export { router as AdminRoute };
