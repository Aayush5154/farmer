import mongoose from "mongoose"
const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}`)
        console.log(`\n Mongodb connected || DB Host: ${connectionInstance.connect.host}`)
    }
    catch(error){
        console.log("MONGODB connection failed", error)
        process.exit(1)
    }
}


export default connectDB
