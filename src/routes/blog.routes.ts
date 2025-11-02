import { Router } from 'express';
import { createBlog, getBlogs, deleteBlog, updateBlog } from '../controllers/blog.controller';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpe?g|png|webp/;
    const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = mimetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Images only'));
    }
  },
});

// Routes
router.route('/').post(upload.single('featuredImage'), createBlog).get(getBlogs);
// In blog.routes.ts
router.route('/:id').delete(deleteBlog);  // Add this line after your existing routes
router.route('/:id')
  .delete(deleteBlog)
  .put(upload.single('featuredImage'), updateBlog); // Add this line

export default router;
