import { Request, Response, NextFunction } from "express";
import { FoodDoc, Vandor } from "../models";

export const GetFoodAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pincode } = req.params;

    const result = await Vandor.find({
      pincode,
      serviceAvailable: true,
    })
      .sort([["name", "descending"]])
      .populate("foods");

    if (result.length > 0) {
      return res.status(200).json(result);
    }

    return res.status(400).json({ message: "Data Not Found" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GetTopRestaurants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pincode } = req.params;

    const result = await Vandor.find({ pincode, serviceAvailable: true })
      .sort([["rating", "desc"]])
      .limit(1);

    if (result.length > 0) {
      return res.status(200).json(result);
    }
    return res.status(400).json({ message: "Restaurant Not Found" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GetFoodIn30Min = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pincode } = req.params;

    const result = await Vandor.find({
      pincode,
      serviceAvailable: true,
    }).populate("foods");

    if (result.length > 0) {
      let foodResults: any = [];
      result.map((vandor) => {
        const foods = vandor.foods as [FoodDoc];

        foodResults.push(
          ...foods.filter((food) => {
            return food.readyTime <= 30;
          })
        );
      });

      return res.status(200).json(foodResults);
    }
    return res.status(400).json({ message: "No Data Found" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const SearchFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pincode } = req.params;

    const result = await Vandor.find({ pincode }).populate("foods");

    if (result.length > 0) {
      let foodResults: any = [];

      result.map((vandor) => {
        foodResults.push(...vandor.foods);
      });

      return res.status(200).json(foodResults);
    }
    return res.status(400).json({ message: "Food Not Found" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const RestaurantById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const result = await Vandor.findById(id).populate("foods");

    if (result) {
      return res.status(200).json(result);
    }
    return res.status(400).json({ message: "Restaurant Not Found" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
