import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, validateUser } from "../schema/userSchema.js";

const JWT_SECRET = "Nusratilloh";

class UsersController {
    // SIGN-UP user
    async registerUser(req, res) {
        try {
            const { error } = validateUser(req.body);
            if (error)
                return res.status(400).json({
                    msg: error.details[0].message,
                    variant: "error",
                    payload: null,
                });

            const { username, password } = req.body;

            const existingUser = await User.findOne({ username });
            if (existingUser)
                return res.status(400).json({
                    msg: "User already exists.",
                    variant: "error",
                    payload: null,
                });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = await User.create({
                ...req.body,
                password: hashedPassword,
            });
            const role = user.role
            const token = jwt.sign({ _id: user._id, role: user.role }, JWT_SECRET, {
                expiresIn: "1d",
            })

            res.status(201).json({
                msg: "User registered successfully",
                variant: "success",
                role,
                payload: { user, token },
            });
        } catch (err) {
            res.status(500).json({
                msg: err.message,
                variant: "error",
                payload: null,
            });
        }
    }
    // LOGIN user
    async loginUser(req, res) {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user)
            return res.status(400).json({
                msg: "Invalid username or password.",
                variant: "error",
                payload: null,
            });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword)
            return res.status(400).json({
                msg: "Invalid username or password.",
                variant: "error",
                payload: null,
            });

        const token = jwt.sign({ _id: user._id, role: user.role }, JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(200).json({
            msg: "Logged in successfully",
            variant: "success",
            payload: token,
        });
    };
    // GET ALL USERS
    async getAllUsers(req, res) {
        try {
            const { limit, skip = 0 } = req.query;
            const users = await User.find().sort({ createdAt: -1 }).limit(limit).skip(skip * limit);
            const total = await User.countDocuments();
            res.status(200).json({
                msg: "Users fetched successfully",
                variant: "success",
                payload: users,
                total,
            });
        } catch (err) {
            res.status(500).json({
                msg: err.message,
                variant: "error",
                payload: null,
            });
        }
    };
    // GET Details user
    async getUser(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);
            if (!user) return res.status(400).json({
                msg: 'User not found',
                variant: 'error',
                payload: null
            })
            res.status(200).json({
                msg: "User fetched successfully",
                variant: "success",
                payload: user,
            });
        } catch (err) {
            res.status(500).json({
                msg: err.message,
                variant: "error",
                payload: null,
            });
        }
    };
    // UPDATE USER
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            let user = await User.findByIdAndUpdate(id, req.body, { new: true })
            res.status(200).json({
                msg: "user updated",
                variant: "success",
                payload: user,
            })

        } catch (err) {
            res.status(500).json({
                msg: err.message,
                variant: "error",
                payload: null,
            });
        }
    };

}

export default new UsersController();