# Steps
- **Assumptions**: DB connection done
  
1. **model banao**
## `user.model.js`

### Strategy
- schema banao, export karo schema ko
- 'pre' hook ka use karke hashing bhi kar do using bcrypt.
- 'methods' ka use karke password compare bhi kar do.
- 'methods' ka hi use karke two functions bana lo jinse access token aur refresh token generate kara lo

```
// Import necessary modules
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Define the user schema using Mongoose
const userSchema = new mongoose.Schema(
  {
    // User's watch history, an array of Video ObjectId references
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    // User's username with constraints
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Index for efficient query performance
    },
    // User's email with constraints
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // User's full name
    fullName: {
      type: String,
      required: true,
    },
    // User's avatar, stored as a Cloudinary URL
    avatar: {
      type: String,
      required: true,
    },
    // User's cover image, stored as a Cloudinary URL
    coverImage: {
      type: String,
    },
    // User's hashed password with a required constraint
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    // User's refresh token for JWT token refresh mechanism
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true } // Add timestamps for createdAt and updatedAt
);

// Pre-save hook to hash the password before saving to the database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if the password is modified
  this.password = await bcrypt.hash(this.password, 10); // Hash the password using bcrypt
  next();
});

// Method to check if the provided password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Method to generate an access token for the user
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET, // Secret key for signing the token
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY } // Token expiration time
  );
};

// Method to generate a refresh token for the user
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET, // Secret key for signing the token
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } // Token expiration time
  );
};

// Export the User model based on the defined schema
export const User = mongoose.model("User", userSchema);

```

**jwt.sign explaination**
```
    // Method to generate an access token for the user
    userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET, // Secret key for signing the token
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY } // Token expiration time
        );
    };
```
Here's an explanation of the parameters passed to jwt.sign:

- **Payload:**

  - The first argument to jwt.sign is the payload that will be included in the JWT. It's an object containing the data you want to encode into the token.
  - In this case, the payload includes properties like _id, email, username, and fullName from the user object.

- **Secret Key:**

    - The second argument is the secret key used to sign the JWT. This key is known only to the server, and it's crucial for verifying the authenticity of the token.
    - In the provided code, process.env.ACCESS_TOKEN_SECRET is used, which is likely stored in the environment variables for security.

- **Options:**

    - The third argument is an options object that includes configurations for the JWT.
    - expiresIn: Specifies the expiration time for the token. It is set to process.env.ACCESS_TOKEN_EXPIRY in the code, indicating how long the token is valid.

- **Return Value:**

    - The jwt.sign method returns the signed JWT as a string.
  
- Putting it all together, the generateAccessToken method in the code generates a JWT with a payload containing user information, signs it with a secret key, and includes an expiration time. This token can then be used for authenticating and authorizing the user.


## `user.controller.js`
### Strategy

```
// Import necessary modules and functions
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

// Define a function to generate access and refresh tokens for a given user ID
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // Find the user by ID
    const user = await User.findById(userId);

    // Generate access and refresh tokens using user's methods
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Update the user's refresh token in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Return the generated tokens
    return { accessToken, refreshToken };
  } catch (error) {
    // Throw an error if something goes wrong during token generation
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

// Define a function to handle user registration
const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend/postman
  const { username, email, fullName, password } = req.body;

  // validation - not empty or undefined
  if (
    [fullName, email, username, password].some(
      (field) => field === undefined || field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check if user already exists? username, email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  // Throw an error if the user already exists
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // check for images, check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  // upload avatar to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  // Throw an error if avatar upload fails
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // check for images, check for coverImage
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  // upload coverImage to cloudinary
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // check for user creation and remove password and refresh token
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Throw an error if user creation fails
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering");
  }

  // return user response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

// Define a function to handle user login
const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  const { email, username, password } = req.body;
  // username or email
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  // find the user
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // check password
  const isPasswordValid = await user.isPasswordCorrect(password);

  // Throw an error if the password is invalid
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Retrieve the logged-in user details (excluding password and refresh token)
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // send Cookie
  const options = {
    httpOnly: true,
    secure: true,
  };

  // Set cookies in the response containing the access and refresh tokens
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User Logged In Successfully"
      )
    );
});

// Define a function to handle user logout
const logoutUser = asyncHandler(async (req, res) => {
  // Update the user's refreshToken to undefined in the database
  User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  // Configure options for clearing cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  // Clear cookies in the response for accessToken and refreshToken
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Define a function to handle refreshing access tokens
const refreshAccessToken = asyncHandler(async (req, res) => {
  // Retrieve the incoming refreshToken from cookies or request body
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  // Throw an error if no refreshToken is provided
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    // Verify the incoming refreshToken using the secret key
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find the user based on the decodedToken
    const user = await User.findById(decodedToken?._id);

    // Throw an error if the user does not exist
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    // Throw an error if the incoming refreshToken does not match the user's refreshToken
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    // Configure options for cookies
    const options = {
      httpOnly: true,
      secure: true,
    };

    // Generate new access and refresh tokens
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    // Set cookies in the response containing the new access and refresh tokens
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    // Throw an error if token verification fails
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

// Export the functions for use in routes
export { registerUser, loginUser, logoutUser, refreshAccessToken };

```