import { NextFunction, Request, Response } from "express";
import { AuthPayload } from "../dto";
import { VerifySignature } from "../utility";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const Authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validate = await VerifySignature(req);

    if (validate) {
      next();
    } else {
      return res.status(401).json({ message: "User not Authorize" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
