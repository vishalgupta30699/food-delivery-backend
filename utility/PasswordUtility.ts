import { Request } from "express";
import bcrypt from "bcryptjs";
import { AuthPayload } from "../dto";
import jwt, { sign } from "jsonwebtoken";

export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

export const GeneratePassword = async (password: string, salt: string) => {
  return await bcrypt.hash(password, salt);
};

export const matchPassword = async (
  userPassword: string,
  savedPassword: string,
  salt: string
) => {
  return (await GeneratePassword(userPassword, salt)) === savedPassword;
};

export const GenerateSignature = (payload: AuthPayload) => {
  const SECRET = process.env.JWT_SECRET;

  return jwt.sign(payload, SECRET as string, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
};

export const VerifySignature = async (req: Request) => {
  const signature = req.get("Authorization");

  if (signature) {
    const payload = (await jwt.verify(
      signature.split(" ")[1],
      process.env.JWT_SECRET as string
    )) as AuthPayload;

    req.user = payload;

    return true;
  }
};
