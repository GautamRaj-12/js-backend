# routes and controllers guide

## Creating Controllers

### `controllers/user.controller.js`

- Controllers are just functions
```
import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "ok",
  });
});

export { registerUser };
```
- This is a JavaScript function named registerUser that is used to handle HTTP requests in an asynchronous manner, typically in a Node.js server environment using Express.js.

- The function is wrapped with asyncHandler, which is a common practice to handle errors in asynchronous functions without needing to use traditional try-catch blocks.

- The function takes two arguments: req and res. req is the request object, which contains information about the HTTP request that was made. res is the response object, which is used to send data back to the client.

- Inside the function, res.status(200).json({ message: "ok" }); is used to send a response back to the client. res.status(200) sets the HTTP status code of the response to 200, which means "OK". .json({ message: "ok" }) sends a JSON response to the client with a property message that has a value of "ok".

- This function isn't doing any registration logic. It simply responds with a status of 200 and a message of "ok", regardless of the request.

## Defining Routes

### `routes/user.routes.js`
```
import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);
export default router;

```
- Importing Dependencies:

    - import { Router } from "express";: This line imports the Router class from the "express" module, which is used to create modular, mountable route handlers.

    - import { registerUser } from "../controllers/user.controller.js";: This line imports the registerUser function from a file located at "../controllers/user.controller.js". This function is likely handling the logic for user registration.

- Router Initialization:

    - const router = Router();: This line creates an instance of the Express Router using the Router class. The router is used to define the routes for the application.
  
- Defining a Route:

    - router.route("/register").post(registerUser);: This line defines a route for handling HTTP POST requests to the "/register" endpoint. When a POST request is made to "/register", it will invoke the registerUser function from the imported controller (user.controller.js). The post method indicates that this route is specifically for handling POST requests.
  
- Exporting the Router:

    - export default router;: This line exports the configured router instance, making it available for use in other parts of the application.
  
In summary, this module sets up a route for user registration using Express.js. When a POST request is made to "/register", it will trigger the registerUser function from the user controller.


### `app.js`

```
... 
//routes import
import userRouter from "./routes/user.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter);
//http:localhost:8000/api/v1/users/register
...
```

- Importing Routes:

    - import userRouter from "./routes/user.routes.js";: This line imports the router instance (userRouter) from a file located at "./routes/user.routes.js". This router is expected to contain route definitions related to user operations, such as registration.
  
- Routes Declaration:

    - app.use("/api/v1/users", userRouter);: This line declares that any incoming requests with a path starting with "/api/v1/users" should be handled by the routes defined in the userRouter. The app.use method is used to mount the userRouter at the specified base path ("/api/v1/users").
  
- Example Endpoint:

  - //http:localhost:8000/api/v1/users/register: This comment provides an example endpoint based on the route configuration. If a POST request is made to "/api/v1/users/register", it will be handled by the corresponding route defined in the userRouter.

In summary, this code sets up and integrates user-related routes from user.routes.js into the main Express application. The base path for these routes is "/api/v1/users", and an example endpoint is given as "//http:localhost:8000/api/v1/users/register".