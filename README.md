# Vedavayu Backend API

This is the backend API for the Vedavayu Health application.

## Setup and Installation

1. Clone the repository
2. Run `npm install` to install dependencies
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ADDITIONAL_ORIGINS=https://yourdomain.com,https://anotherdomain.com
   ```
4. Run `npm start` to start the server

## API Endpoints

The API has the following endpoints:

- `/api/auth` - Authentication routes
- `/api/users` - User management
- `/api/doctors` - Doctor profiles
- `/api/services` - Services offered
- `/api/banners` - Banner management
- `/api/gallery` - Gallery images
- `/api/partners` - Partner information
- `/api/statistics` - Statistical data
- `/api/about` - About page content

## CORS Configuration

The API uses CORS to allow requests from specific origins. By default, it allows requests from:

- `http://localhost:3000` 
- `http://localhost:5173`
- `https://vedavayu-vedavayus-projects.vercel.app`
- `https://vedavayu.vercel.app`

To add additional origins, set the `ADDITIONAL_ORIGINS` environment variable as a comma-separated list.

## Deployment

This application is configured for deployment on Render.com. The `render.yaml` file contains the service configuration.

### Troubleshooting CORS Issues

If you're experiencing CORS errors when making requests to the API:

1. Ensure your frontend domain is in the allowed origins list
2. Check that the API is responding with the proper CORS headers
3. Use the `/api/health` endpoint to verify that CORS is configured correctly
4. For production issues, check the Render logs for any errors

## License

Copyright © 2023-2025 Vedavayu Health