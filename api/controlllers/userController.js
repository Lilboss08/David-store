import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { User } from "../schemas/userSchema.js";
import createToken from "../utils/jasonwebtoken.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/email.js";


// get all users
const getAllUser = async (req, res) => {
  try {
    const findUser = await User.find({});
    if (findUser) {
      res.status(200).json({
        status: "success",
        findUser,
      });
    }
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: "no user or users in the database",
    });
  }
};

// getting a single user from the database

const getSingleUser = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ status: "failed", message: "id is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ status: "failed", message: "invalid user id" });
  }

  const findUser = await User.findById(id);


  if (!findUser) {
    return res.status(404).json({
      status: "failed",
      message: "no user with the id provided",
    });
  } else {
    return res.status(200).json({
      status: "success",
      user: findUser,
    });
  }
};

// posting or adding new user to the database

const addUser = async (req, res) => {
  const { fullName, email, password, confirmPassword, role, adminPasscode } = req.body;

  // Validate required fields
  if (!fullName || !fullName.trim()) {
    return res.status(400).json({
      status: "failed",
      message: "Full name is required",
    });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({
      status: "failed",
      message: "Email is required",
    });
  }

  if (!password) {
    return res.status(400).json({
      status: "failed",
      message: "Password is required",
    });
  }

  if (!confirmPassword) {
    return res.status(400).json({
      status: "failed",
      message: "Confirm password is required",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      status: "failed",
      message: "Passwords do not match",
    });
  }

  // Validate role and admin passcode for admin registration
  let userRole = 'user';
  if (role && role.toLowerCase() === 'admin') {
    const normalizedAdminPasscode = (adminPasscode || '').trim();
    const expectedAdminPasscode = (process.env.ADMIN_PASSCODE || '').trim();

    if (normalizedAdminPasscode && normalizedAdminPasscode === expectedAdminPasscode) {
      userRole = 'admin';
    } else {
      return res.status(403).json({
        status: 'failed',
        message: `Invalid admin passcode. Admin registration denied. Expected ${expectedAdminPasscode ? 'configured passcode' : 'a configured passcode'}.`,
      });
    }
  }

  // check for existing user
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({
      status: "failed",
      message: "user with the email already exists",
    });
  }

  try {
    // Generate verification token (optional, for future use)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      confirmPassword: confirmPassword,
      role: userRole,
      isVerified: true, // Immediately verify for simplicity
      verificationToken,
      verificationTokenExpires,
    });

    // Optionally send welcome email (commented out for now)
    // const message = `Hi ${name},\n\nWelcome to David Store! Your account has been created successfully.`;
    // await sendEmail({
    //   email: userEmail,
    //   subject: 'Welcome to David Store',
    //   message,
    // });

    // Create JWT token
    const token = jwt.sign(
        { userId: newUser._id, role: newUser.role, email: newUser.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.JWT_EXPIRE_IN }
    );

    // Send verification email (non-critical - don't block registration if it fails)
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailErr) {
      console.warn('Verification email failed to send (non-critical):', emailErr.message);
    }
    
    return res.status(201).json({
      status: "success",
      message: "Registration successful! You can now log in.",
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role
      },
      token: token
    });

  } catch (error) {
    console.error('Registration error:', error.message, error);
    return res.status(500).json({
      status: "failed",
      message: error.message || 'Registration failed. Please try again.',
    });
  }
};

// login existing user and return token
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const userEmail = email;
  const userPassword = password;
  
  // check is user exists in the database
  const findUser = await User.findOne({ email: userEmail });
  try {
    if (!findUser) {
      return res.status(404).json({
        status: "failed",
        message: "user not found, please register",
      });
    }

    // compare the password in the request with the password in the database
    const isPsswordValid = await findUser.comparePassword(userPassword);
    if (!isPsswordValid) {
      return res.status(400).json({
        status: "failed",
        message: "invalid credentials",
      });
    }

    // create token with user id and role as payload
    const tokenPayload = { userId: findUser._id, role: findUser.role, email: findUser.email };
    console.log('[Login] Creating token with payload:', tokenPayload);
    console.log('[Login] JWT_SECRET_KEY:', process.env.JWT_SECRET_KEY ? 'IS SET' : 'MISSING!!!');
    
    const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.JWT_EXPIRE_IN }
    );
    
    console.log('[Login] Token created:', token ? `${token.substring(0, 30)}...` : 'FAILED');
    console.log('[Login] User role from DB:', findUser.role);

    // update token in database using findByIdAndUpdate to avoid re-validation
    await User.findByIdAndUpdate(findUser._id, { token });

    res.status(200).json({
      status: "success",
      message: "login successful",
      user: {
        _id: findUser._id,
        fullName: findUser.fullName,
        email: findUser.email,
        role: findUser.role
      },
      token: token
    });
    
  } catch (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

// verify email
const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid or expired verification token",
      });
    }

    // Update user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

// updating a user using patch method

const updateUser = async (req, res) => {
  const { id } = req.params;
  const {
    fullName,
    Fullname,
    Email,
    email,
    password,
    Password,
    confirmPassword,
    ConfirmPassword,
    state,
    lga,
  } = req.body;

  const name = fullName || Fullname;
  const userEmail = Email || email;
  const pwd = password || Password;
  const confirmPwd = confirmPassword || ConfirmPassword;
  const userState = state || '';
  const userLga = lga || '';

  try {
    const updated = await User.findByIdAndUpdate(
      id,
      {
        fullName: name,
        email: userEmail,
        password: pwd,
        confirmPassword: confirmPwd,
        state: userState,
        lga: userLga
      },
      { new: true }
    );
    return res.status(200).json({
      status: "success",
      updateUser: updated,
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
      message: "could not update user, error: " + error.message,
    });
  }
};

// deleting a user from the database

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await User.findById(id);
    if (!existing) {
      return res.status(404).json({
        status: "failed",
        message: "user not found",
      });
    }

    await User.findByIdAndDelete(id);
    return res.status(200).json({
      status: "success",
      message: "user deleted",
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
      message: "could not delete user, error: " + error.message,
    });
  }
}



export { addUser, loginUser, verifyEmail, getAllUser, getSingleUser, updateUser, deleteUser};