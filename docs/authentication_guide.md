# Authentication Guide for LinkShield AI

## Overview

LinkShield AI uses AWS Cognito for secure authentication. This document explains how authentication works and how to configure it for your environment.

## Authentication Flow

1. **Sign Up**: Users create an account via the Login page
2. **Sign In**: Users authenticate using their email and password
3. **Token Management**: AWS Amplify handles tokens automatically
4. **Protected Routes**: Routes like `/profile` require authentication

## Environment Variables

For authentication to work properly, you need to set these environment variables:

```
VITE_COGNITO_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=your_user_pool_id_here
VITE_COGNITO_APP_CLIENT_ID=your_app_client_id_here
```

## Setting Up AWS Cognito

1. **Create a User Pool**:
   - Go to AWS Console → Cognito → User Pools
   - Create a new user pool with email sign-in
   - Add name as a required attribute

2. **Create an App Client**:
   - Within your user pool, create an app client
   - Enable necessary OAuth flows
   - Set callback URLs to your frontend URL

3. **Update Environment Variables**:
   - Copy your User Pool ID and App Client ID to your `.env` file

## Development Testing

For local development:
1. Create a `.env` file in the `/frontend` directory
2. Add the required Cognito variables
3. Run the application with `npm run dev`

## Troubleshooting

- **Login Issues**: Check browser console for authentication errors
- **Token Expiration**: AWS Amplify handles token refresh automatically
- **API Access Denied**: Verify your Cognito setup and JWT token configuration

## Security Best Practices

- Never commit `.env` files with real credentials
- Use environment-specific user pools for dev/staging/production
- Regularly rotate app client secrets
- Monitor authentication activity in AWS CloudWatch
