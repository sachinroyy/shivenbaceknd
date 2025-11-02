"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBlog = exports.deleteBlog = exports.getBlogs = exports.createBlog = void 0;
const blog_model_1 = __importDefault(require("../models/blog.model"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Create a new blog post
const createBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, category, slug, metaDescription } = req.body;
        // Handle file upload
        let featuredImage = '';
        if (req.file) {
            featuredImage = `/uploads/${req.file.filename}`;
        }
        const blog = yield blog_model_1.default.create({
            title,
            category,
            slug,
            metaDescription,
            featuredImage,
        });
        res.status(201).json({
            success: true,
            data: blog,
        });
    }
    catch (error) {
        // If there's an error, delete the uploaded file
        if (req.file) {
            const filePath = path_1.default.join(__dirname, '../../public', req.file.path);
            fs_1.default.unlink(filePath, (err) => {
                if (err)
                    console.error('Error deleting file:', err);
            });
        }
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
});
exports.createBlog = createBlog;
// Get all blog posts
const getBlogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blogs = yield blog_model_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: blogs.length,
            data: blogs,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
});
exports.getBlogs = getBlogs;
// In blog.controller.ts
const deleteBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield blog_model_1.default.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                error: 'Blog post not found'
            });
        }
        // Delete the associated image file if it exists
        if (blog.featuredImage) {
            const filePath = path_1.default.join(__dirname, '../../public', blog.featuredImage);
            fs_1.default.unlink(filePath, (err) => {
                if (err)
                    console.error('Error deleting file:', err);
            });
        }
        res.status(200).json({
            success: true,
            message: 'Blog post deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
exports.deleteBlog = deleteBlog;
// Update a blog post
const updateBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = Object.assign({}, req.body);
        // Handle file upload if exists
        if (req.file) {
            updateData.featuredImage = `/uploads/${req.file.filename}`;
            // Delete old image if exists
            const oldBlog = yield blog_model_1.default.findById(id);
            if (oldBlog === null || oldBlog === void 0 ? void 0 : oldBlog.featuredImage) {
                const oldFilePath = path_1.default.join(__dirname, '../../public', oldBlog.featuredImage);
                fs_1.default.unlink(oldFilePath, (err) => {
                    if (err)
                        console.error('Error deleting old file:', err);
                });
            }
        }
        const blog = yield blog_model_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!blog) {
            return res.status(404).json({
                success: false,
                error: 'Blog post not found'
            });
        }
        res.status(200).json({
            success: true,
            data: blog
        });
    }
    catch (error) {
        // Delete the uploaded file if there was an error
        if (req.file) {
            const filePath = path_1.default.join(__dirname, '../../public/uploads', req.file.filename);
            fs_1.default.unlink(filePath, (err) => {
                if (err)
                    console.error('Error deleting file:', err);
            });
        }
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
});
exports.updateBlog = updateBlog;
