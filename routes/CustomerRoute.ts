import express from 'express';
import {
  CustomerLoginIn,
  CustomerSignUp,
  CustomerVerify,
  GetCustomerProfile,
  RequestOTP,
  UpdateCustomerProfile,
} from '../controllers';
import { Authenticate } from '../middlewares';

const router = express.Router();

/** Signup / Create Customer  */
router.post('/signup', CustomerSignUp);

/** Login Customer */
router.post('/login', CustomerLoginIn);

router.use(Authenticate);
/** Verify Customer Account */
router.patch('/verify', CustomerVerify);

/** OTP / Requesting OTP  */
router.get('/otp', RequestOTP);

/** Customer Profile */
router.get('/profile', GetCustomerProfile);

/** Update Customer Profile */
router.patch('/profile', UpdateCustomerProfile);

export { router as CustomerRoute };
