#!/bin/bash

# Script to deploy backend changes to Render
echo "Committing backend changes..."
cd d:/Samiran/Sami/vedavayu-backend
git add .
git commit -m "Fix CORS issues for production deployment"
git push origin main

echo "Backend changes pushed to repository."
echo "Render will automatically redeploy the application."
echo "Please wait a few minutes for the changes to take effect."

# Instructions for frontend deployment
echo "----------------------------------------------"
echo "Instructions for frontend deployment:"
echo "1. Push your frontend changes to your repository"
echo "2. Vercel will automatically redeploy your frontend"
echo "3. Wait a few minutes for both deployments to complete"
echo "4. Test your application again"
echo "----------------------------------------------"
