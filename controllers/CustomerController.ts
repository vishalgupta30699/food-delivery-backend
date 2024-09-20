import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import {
  CreateCustomerInputs,
  CreateOrderInput,
  UpdateUserInputs,
  UserLoginInputs,
} from "../dto";
import { validate } from "class-validator";
import {
  GenerateOTP,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  matchPassword,
  onRequestOTP,
} from "../utility";
import { Customer, Food, Order } from "../models";

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
      orders: [],
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
    const customer = req.user;

    if (customer) {
      const result = await Customer.findById(customer._id);

      if (result !== null) {
        const { otp, expiry } = GenerateOTP();

        result.otp = otp;
        result.otp_expiry = expiry;

        await result.save();
        //await onRequestOTP(otp, result.phone);

        return res
          .status(200)
          .json({ message: "OTP sent to your registred phone number!" });
      }
    }

    return res.status(400).json({ message: "Customer Not Found" });
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
    const customer = req.user;

    if (customer) {
      const profile = await Customer.findById(customer._id);

      if (profile !== null) {
        return res.status(200).json(profile);
      }
      return res.status(400).json({ message: "Customer not found" });
    }
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
    const customer = req.user;

    const profileInput = plainToClass(UpdateUserInputs, req.body);

    const profileErrors = await validate(profileInput, {
      validationError: { target: false },
    });

    if (profileErrors.length > 0) {
      return res.status(400).json(profileErrors);
    }
    const { firstName, lastName, address } = profileInput;

    if (customer) {
      const profile = await Customer.findByIdAndUpdate(
        customer._id,
        {
          firstName,
          lastName,
          address,
        },
        { new: true }
      );

      if (profile) {
        return res.status(200).json(profile);
      }
      return res.status(400).json({ message: "Error on update profile" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const CreateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = req.user;

    if (customer) {
      const profile = await Customer.findById(customer._id);

      const cart = <[CreateOrderInput]>req.body;

      let cartItems = Array();

      let netAmount = 0.0;

      const foods = await Food.find()
        .where("_id")
        .in(cart.map((item) => item._id))
        .exec();

      foods.map((food) => {
        cart.map(({ _id, unit }) => {
          if (food._id == _id) {
            netAmount += food.price * unit;
            cartItems.push({ food, unit });
          }
        });
      });

      if (cartItems) {
        const createOrder = await Order.create({
          items: cartItems,
          totalAmount: netAmount,
          orderDate: new Date(),
          paidThrough: "COD",
          paymentResponse: "",
          orderStatus: "Waiting",
        });

        if (createOrder) {
          profile?.orders.push(createOrder);
          const profileReponse = await profile?.save();

          return res.status(200).json(profileReponse);
        }
      }
    }
    return res.status(400).json({ message: "Error with create order" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GetAllOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (user) {
      const profile = await Customer.findById(user).populate("orders");

      if (profile !== null) {
        return res.status(200).json(profile.orders);
      }

      return res.status(400).json({ message: "Customer Order not found" });
    }

    return res.status(400).json({ message: "User Order not found" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GetOrderByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (user) {
      const { id } = req.params;

      const order = await Order.findById(id).populate("items.food");

      if (order !== null) {
        return res.status(200).json(order);
      }

      return res.status(400).json({ message: "Order  not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const AddTocart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = req.user;

    if (customer) {
      const profile = await Customer.findById(customer._id).populate(
        "cart.food"
      );

      let cartItems = Array();

      const { _id, unit } = <CreateOrderInput>req.body;

      const food = await Food.findById(_id);

      if (food) {
        if (profile !== null) {
          cartItems = profile.cart;

          if (cartItems.length > 0) {
            let existFoodItem = cartItems.filter(
              (item) => item.food._id.toString() === _id
            );

            if (existFoodItem.length > 0) {
              const index = cartItems.indexOf(existFoodItem[0]);
              if (unit > 0) {
                cartItems[index] = { food, unit };
              } else {
                cartItems.splice(index, 1);
              }
            } else {
              cartItems.push({ food, unit });
            }
          } else {
            cartItems.push({ food, unit });
          }

          if (cartItems) {
            profile.cart = cartItems as any;
            const cartResult = await profile.save();
            return res.status(200).json(profile);
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GetCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (user) {
      const profile = await Customer.findById(user._id).populate("cart.food");
      if (profile !== null) {
        return res.status(200).json(profile.cart);
      }
    }
    return res.status(400).json({ message: "Error on fetching cart" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const DeleteCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (user) {
      const profile = await Customer.findById(user._id);

      if (profile !== null) {
        profile.cart = [] as any;
        const result = await profile.save();

        return res.status(200).json(result);
      }
      return res.status(400).json({ message: "Error on deleting cart" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
