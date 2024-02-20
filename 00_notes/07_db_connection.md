## Handling DB Connection: Naive and Professional

### Two important points
---
- DB se baat karne par problems aa sakti hai to **try-catch** me wrap karo humesha. Ya phir **promises** bhi le sakte hai.
- DB is always in another continent - means time lagega - **async-await**

## Naive way
`.env`
PORT = 8000
MONGODB_URI = mongodb+srv://<username>:<password>@practice.u5g2cwm.mongodb.net

`constants.js`
export const DB_NAME = "youtube-twitter";

`index.js`
```
import express from 'express'
const app = express()

import dotenv from 'dotenv'
dotenv.config()


;(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERR: ",error);
            throw error;
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    }catch(error){
        console.error("ERROR: ",error);
        throw error;
    }
})()
```

## Professional
- **`.env`**: isme bas environment variables daalo
- **`constants.js`**: isme constants if needed
- **`index.js`**: isme dotenv ko import or config karenge. `app.js` ko import karenge jisme express server ka code hoga, aur `db/connection.js`  ko import karenge, aur jo function jisme connection ka code hoga use call kar denge.
- **`db/connection.js`**: isme db connection ka code hoga aur jo function hoga use export kar lenge.
- **`app.js`**:express ka code yaha hoga


`.env`

PORT = 8000
MONGODB_URI = mongodb+srv://<username>:<password>@practice.u5g2cwm.mongodb.net

`constants.js`

export const DB_NAME = "youtube-twitter";

`index.js`

> dotenv ko import aur config karo, and connection.js me se connection wale function ko import kar ke call kar do.

```
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./db/connection.js";
import "./app.js";

connectDB();
```

`app.js`
```
import express from "express";
const app = express();

app.listen(process.env.PORT, () => {
  console.log(`App is listening on port ${process.env.PORT}`);
});

```

`connection.js`

```
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDb Connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connection FAILED", error);
    process.exit(1);
  }
};

export default connectDB;
```

## Important 

In our code, the database connection is established using the mongoose.connect method, and the connection string is constructed by concatenating process.env.MONGODB_URI and DB_NAME. If DB_NAME is not present in your MongoDB database, MongoDB will **not create** a new database with that name unless you perform some write operations.

MongoDB will connect successfully even if the specified database (youtube-twitter in this case) does not exist at the time of connection. MongoDB will create the database when we perform our first write operation.