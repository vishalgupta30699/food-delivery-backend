import { Request, Response, NextFunction } from "express";
import { createVandorInput } from "../dto";
import { Vandor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";

export const createVandor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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
      return res
        .status(409)
        .json({ message: "A Vandor is exist with this Email ID" });
    }

    //Generate Salt
    const salt = await GenerateSalt();
    //Generate Password
    const hashPassword = await GeneratePassword(password, salt);

    const createVandor = await Vandor.create({
      name,
      ownerName,
      pincode,
      foodType,
      phone,
      email,
      password: hashPassword,
      address,
      salt: salt,
      serviceAvaialble: false,
      coverImages: [],
      rating: 0,
    });

    if (createVandor != null) {
      return res.status(201).json(createVandor);
    }

    return res
      .status(400)
      .json({ message: "Something went wrong while creating Vandor" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getVandors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const getAllVandors = await Vandor.find();

    if (getAllVandors !== null) {
      return res.status(200).json(getAllVandors);
    }

    return res.status(400).json({ message: "Vandors not found" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getVandorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vandorID = req.params.id;
    const getVandor = await Vandor.findById(vandorID);
    if (getVandor !== null) {
      return res.status(200).json(getVandor);
    }
    return res.status(400).json({ message: "Vandor doesn't exist" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
