import express from "express";
import cors from "cors";
import router from "./routes/routes.js";
import DBConnection from "./database/db.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", router);

const PORT = process.env.PORT;
 
DBConnection();

app.listen(4000, () => console.log(`Server is Running on PORT ${PORT}`))