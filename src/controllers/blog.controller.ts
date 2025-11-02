import { Request, Response } from 'express';
import Blog, { IBlog } from '../models/blog.model';
import path from 'path';
import fs from 'fs';

// Create a new blog post
export const createBlog = async (req: Request, res: Response) => {
  try {
    const { title, category, slug, metaDescription } = req.body;
    
    // Handle file upload
    let featuredImage = '';
    if (req.file) {
      featuredImage = `/uploads/${req.file.filename}`;
    }

    const blog = await Blog.create({
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
  } catch (error: any) {
    // If there's an error, delete the uploaded file
    if (req.file) {
      const filePath = path.join(__dirname, '../../public', req.file.path);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all blog posts
export const getBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// In blog.controller.ts
export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    // Delete the associated image file if it exists
    if (blog.featuredImage) {
      const filePath = path.join(__dirname, '../../public', blog.featuredImage);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
// Update a blog post
export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle file upload if exists
    if (req.file) {
      updateData.featuredImage = `/uploads/${req.file.filename}`;
      
      // Delete old image if exists
      const oldBlog = await Blog.findById(id);
      if (oldBlog?.featuredImage) {
        const oldFilePath = path.join(__dirname, '../../public', oldBlog.featuredImage);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Error deleting old file:', err);
        });
      }
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

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
  } catch (error: any) {
    // Delete the uploaded file if there was an error
    if (req.file) {
      const filePath = path.join(__dirname, '../../public/uploads', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};