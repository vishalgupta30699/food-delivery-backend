import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { CreateCustomerInputs, UserLoginInputs } from "../dto";
import { validate, ValidationError } from "class-validator";
import {
  GenerateOTP,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  matchPassword,
  onRequestOTP,
} from "../utility";
import { Customer } from "../models/Customer";

export const CustomerSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customerInputs = plainToClass(CreateCustomerInputs, req.body);

    const inputErrors = await validate(customerInputs, {
      validationError: { target: true },
    });

    if (inputErrors.length > 0) {
      return res.status(400).json(inputErrors);
    }

    const { email, password, phone } = req.body;

    //Check for customer exist or not
    const existCustomer = await Customer.findOne({ email });

    if (existCustomer !== null) {
      return res.status(409).json({ message: "Customer already exist" });
    }

    const salt = await GenerateSalt();
    const hashPassword = await GeneratePassword(password, salt);

    const { otp, expiry } = GenerateOTP();

    const createCustomer = await Customer.create({
      email,
      password: hashPassword,
      phone,
      salt,
      firstName: "",
      lastName: "",
      otp,
      otp_expiry: expiry,
      verified: false,
      lat: 0,
      lng: 0,
    });

    if (createCustomer) {
      //Send OTP to customer
      //   await onRequestOTP(otp, phone);

      //Generate Signature
      const signature = GenerateSignature({
        _id: createCustomer.id,
        email: createCustomer.email,
        verified: createCustomer.verified,
      });

      //Send result to client
      return res.status(201).json(signature);
    }

    return res.status(400).json({ message: "Customer not created!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const CustomerLoginIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const loginInputs = plainToClass(UserLoginInputs, req.body);

    const inputErrors = await validate(loginInputs, {
      validationError: { target: true },
    });

    if (inputErrors.length > 0) {
      return res.status(400).json(inputErrors);
    }

    const { email, password } = loginInputs;

    const customer = await Customer.findOne({ email });

    if (customer !== null) {
      const validation = await matchPassword(
        password,
        customer.password,
        customer.salt
      );

      if (validation) {
        const signature = GenerateSignature({
          _id: customer.id,
          email: customer.email,
          verified: customer.verified,
        });

        return res.status(201).json({
          signature: signature,
          verified: customer.verified,
          email: customer.email,
        });
      } else {
        return res.status(400).json({ message: "Incorrect Password" });
      }
    }

    return res.status(400).json({ message: "Customer not exist" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const CustomerVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { otp } = req.body;
    const customer = req.user;

    if (customer) {
      const profile = await Customer.findById(customer._id);

      if (profile) {
        //Check for expiry later
        if (profile.otp === parseInt(otp)) {
          profile.verified = true;

          const updateCustomerResponse = await profile.save();

          //generate Signature
          const signature = GenerateSignature({
            _id: updateCustomerResponse.id,
            email: updateCustomerResponse.email,
            verified: updateCustomerResponse.verified,
          });

          return res.status(201).json(signature);
        } else {
          return res.status(401).json({ message: "Incorrect OTP" });
        }
      }
      return res.status(400).json({ message: "Customer not found" });
    }
    return res.status(400).json({ message: "Customer not found" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const RequestOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const UpdateCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
