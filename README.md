# Blog Backend

This is the backend for the blog application, built with Node.js, Express, TypeScript, and MongoDB.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/blog_db
   NODE_ENV=development
   ```
   - For MongoDB Atlas, use your connection string:
     ```
     MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/blog_db?retryWrites=true&w=majority
     ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5001`

## API Endpoints

- `POST /api/blogs` - Create a new blog post
- `GET /api/blogs` - Get all blog posts

## Production Build

To create a production build:

```bash
npm run build
```

Then start the server:

```bash
npm start
```

## Frontend Setup

The frontend should be configured to make requests to the backend API. Make sure to update the API URL in the frontend code if needed.

## License

MIT
