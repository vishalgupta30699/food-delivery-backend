import { Request, Response, NextFunction } from "express";
import { createVandorInput } from "../dto";
import { Vandor } from "../models";

export const createVandor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    ownerName,
    pincode,
    foodType,
    phone,
    email,
    password,
    address,
  } = <createVandorInput>req.body;

  const existingVandor = await Vandor.findOne({ email });

  if (existingVandor !== null) {
    return res.json({ message: "A Vandor is exist with this Email ID" });
  }

  const createVandor = await Vandor.create({
    name,
    ownerName,
    pincode,
    foodType,
    phone,
    email,
    password,
    address,
    salt: "",
    serviceAvaialble: false,
    coverImages: [],
    rating: 0,
  });

  console.log(createVandor);

  return res.json({
    name,
    ownerName,
    pincode,
    foodType,
    phone,
    email,
    password,
    address,
  });
};

export const getVandors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const getVandorById = (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
