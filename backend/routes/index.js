import express from "express"
import BlogsController from "../controller/blog.js";
import UsersController from "../controller/user.js"
import { auth, adminMiddleware } from '../middleware/auth-middleware.js'
const router = express.Router()

router.get("/api/blogs", BlogsController.get)
router.post("/api/blogs", BlogsController.create)

router.get('/api/users', UsersController.getAllUsers)
router.post('/api/users/sign-up', UsersController.registerUser)
router.post('/api/users/sign-in', UsersController.loginUser)
router.patch('/api/users/:id', UsersController.getUser)
router.patch('/api/users/:id', UsersController.updateUser)

export default router