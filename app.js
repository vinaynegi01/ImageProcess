import dotenv from "dotenv";
dotenv.config();
import  express  from "express";
import connectDB from "./db/connectiondb.js";
import router from "./routes/imageRoutes.js";
const DATABASE_URL = process.env.DATABASE_URL;
const app = express();
const port = process.env.PORT || '3000'

connectDB(DATABASE_URL);

app.use(express.urlencoded({extended:false}))
// Static Files

// app.use('/student',express.static(join(process.cwd(),"public")))

// Load Routes
app.use("/student",router);


app.listen(port,()=>{
    console.log(`Server listening at http://localhost:${port}`)
})