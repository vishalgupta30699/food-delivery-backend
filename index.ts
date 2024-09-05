import express from "express";
import dotenv from "dotenv";
import {
  AdminRoute,
  CustomerRoute,
  ShoppingRoute,
  VandorRoute,
} from "./routes";
import bodyParser from "body-parser";
import mongoose, { ConnectOptions } from "mongoose";
import path from "path";

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/admin", AdminRoute);
app.use("/vandor", VandorRoute);
app.use(ShoppingRoute);
app.use("/customer", CustomerRoute);

//Databse Connection
mongoose
  .connect(
    process.env.MONGO_CONNECT_URI as string,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions
  )
  .then((res) => console.log("Database Connect successfully"))
  .catch((err) => console.log(err));

const port = process.env.PORT;
app.listen(port, () => {
  console.clear();
  console.log(`Server is listening on Port :${port}`);
});
