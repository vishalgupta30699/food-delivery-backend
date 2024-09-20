import express from "express";
import {
  AddTocart,
  CreateOrder,
  CustomerLoginIn,
  CustomerSignUp,
  CustomerVerify,
  DeleteCart,
  GetAllOrder,
  GetCart,
  GetCustomerProfile,
  GetOrderByID,
  RequestOTP,
  UpdateCustomerProfile,
} from "../controllers";
import { Authenticate } from "../middlewares";

const router = express.Router();

/** Signup / Create Customer  */
router.post("/signup", CustomerSignUp);

/** Login Customer */
router.post("/login", CustomerLoginIn);

router.use(Authenticate);
/** Verify Customer Account */
router.patch("/verify", CustomerVerify);

/** OTP / Requesting OTP  */
router.get("/otp", RequestOTP);

/** Customer Profile */
router.get("/profile", GetCustomerProfile);

/** Update Customer Profile */
router.patch("/profile", UpdateCustomerProfile);

//Cart
router.post("/cart", AddTocart);
router.get("/cart", GetCart);
router.delete("/cart", DeleteCart);

//order
router.post("/create-order", CreateOrder);
router.get("/orders", GetAllOrder);
router.get("/order/:id", GetOrderByID);

export { router as CustomerRoute };
