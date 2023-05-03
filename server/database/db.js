import mongoose from "mongoose";

const DBConnection = async () => {
    const MONGO_URI = "mongodb+srv://prateek:cvKx4jrPzfgmmbUT@mern.483njbl.mongodb.net/?retryWrites=true&w=majority";
    try {
        await mongoose.connect(MONGO_URI,{dbName: "file", useNewUrlParser: true});
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Error while connecting with the database ", error.message);
    }
}

export default DBConnection;