import { Request, Response, NextFunction } from "express";
import { Food, Vandor } from "../models";
import { GenerateSignature, matchPassword } from "../utility";
import { EditVandorInput, vandorLoginInput, createFoodInputs } from "../dto";

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

export const addFood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (user) {
      const { name, description, foodType, readyTime, price, category } = <
        createFoodInputs
      >req.body;

      const vandor = await Vandor.findById(user._id);

      if (vandor !== null) {
        const files = req.files as [Express.Multer.File];

        const images = files?.map((file: Express.Multer.File) => file.filename);

        const createFood = await Food.create({
          vandorId: vandor._id,
          name,
          description,
          category,
          foodType,
          images: images,
          readyTime,
          price,
          rating: 0,
        });

        if (createFood !== null) {
          vandor.foods.push(createFood);
          const result = await vandor.save();
          return res.status(200).json(result);
        }
      }
      return res.status(400).json({ message: "Vandor not exist" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (user) {
      const foods = await Food.find({ vandorId: user._id });

      if (foods !== null) {
        return res.status(200).json(foods);
      }
    }
    return res.status(400).json({ message: "Foods Information not found" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateVandorCoverImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (user) {
      const vandor = await Vandor.findById(user._id);

      if (vandor !== null) {
        const files = req.files as [Express.Multer.File];

        const images = files?.map((file) => file.filename);

        vandor.coverImages.push(...images);

        const result = await vandor.save();

        return res.status(200).json(result);
      }
    }
    return res.status(400).json({ message: "Vandor Information not found" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
