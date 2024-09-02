import express from "express";
import dotenv from "dotenv";
import { AdminRoute, VandorRoute } from "./routes";
import bodyParser from "body-parser";
import mongoose, { ConnectOptions } from "mongoose";

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/admin", AdminRoute);
app.use("/vandor", VandorRoute);

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
  //   console.clear();
  console.log(`Server is listening on Port :${port}`);
});
