import { Request, Response, NextFunction } from "express";
import { Vandor } from "../models";
import { GenerateSignature, matchPassword } from "../utility";
import { EditVandorInput, vandorLoginInput } from "../dto";

export const vandorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = <vandorLoginInput>req.body;

    const existingVandor = await Vandor.findOne({ email });
    //if vandor doesn't exist
    if (existingVandor !== null) {
      //Check password match with stored password by converting to hash
      const isPasswordMatch = await matchPassword(
        password,
        existingVandor.password,
        existingVandor.salt
      );
      if (isPasswordMatch) {
        //Generate Jwt token
        const signature = GenerateSignature({
          _id: existingVandor.id,
          name: existingVandor.name,
          foodTypes: existingVandor.foodType,
          email: existingVandor.email,
        });
        return res.status(200).json(signature);
      } else {
        return res.status(400).json({ message: "Invalid Password" });
      }
    } else {
      return res.status(400).json({ message: "User doesn't exist" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getVandorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (user) {
      const existingVandor = await Vandor.findById(user._id);
      return res.status(200).json(existingVandor);
    }

    return res.status(400).json({ message: "Vandor Information Not found" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateVandorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, address, phone, foodTypes } = <EditVandorInput>req.body;
    const user = req.user;

    if (user) {
      const existingVandor = await Vandor.findById(user._id);

      if (existingVandor !== null) {
        const isUpdate = await Vandor.findOneAndUpdate(
          { _id: user._id },
          { name, address, phone, foodType: foodTypes },
          { new: true }
        );
        return res.status(200).json(isUpdate);
      }
      return res.status(400).json({ message: "Vandor Not found" });
    }

    return res.status(400).json({ message: "Vandor Information Not found" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const updateVandorService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (user) {
      const existingVandor = await Vandor.findById(user._id);

      if (existingVandor !== null) {
        existingVandor.serviceAvailable = !existingVandor.serviceAvailable;

        const savedResult = await existingVandor.save();

        return res.status(200).json(savedResult);
      }
    }
    return res.status(400).json({ message: "Vandor Not found" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
