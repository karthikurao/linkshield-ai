# Deployment Guide

This document provides detailed instructions for deploying the LinkShield AI application to AWS cloud infrastructure.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Serverless Framework installed (`npm install -g serverless`)
- Node.js 18+ and npm
- Python 3.11+
- Git LFS

## Backend Deployment

### 1. Setup AWS Credentials

```bash
aws configure
```

Input your AWS Access Key, Secret Key, default region (e.g., us-east-1), and output format (json).

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
npm install
```

### 3. Configure Serverless

Review and update the `serverless.yml` file to match your requirements:

```yaml
# Example serverless.yml configuration
service: linkshield-ai-backend
frameworkVersion: '3'

provider:
  name: aws
  runtime: python3.11
  stage: ${opt:stage, 'dev'}
  region: ${opt:region, 'us-east-1'}
  memorySize: 1024
  timeout: 30
  environment:
    STAGE: ${self:provider.stage}
    DATABASE_URL: ${ssm:/linkshield/${self:provider.stage}/database-url}
    JWT_SECRET: ${ssm:/linkshield/${self:provider.stage}/jwt-secret}

functions:
  app:
    handler: handler.handler
    events:
      - httpApi: '*'
```

### 4. Store Secrets in AWS Parameter Store

```bash
# Store database connection string
aws ssm put-parameter --name "/linkshield/dev/database-url" --type "SecureString" --value "your-database-connection-string"

# Store JWT secret
aws ssm put-parameter --name "/linkshield/dev/jwt-secret" --type "SecureString" --value "your-jwt-secret"
```

### 5. Deploy the Backend

```bash
serverless deploy --stage dev
```

Note the API endpoint URL from the output.

## Frontend Deployment

### 1. Configure API Endpoint

Update the API endpoint in the frontend configuration:

```bash
cd frontend
```

Edit `src/services/api.js` to update the API_URL with the endpoint from your backend deployment.

### 2. Build the Frontend

```bash
npm install
npm run build
```

This will generate optimized production files in the `dist` folder.

### 3. Create S3 Bucket for Hosting

```bash
aws s3 mb s3://linkshield-frontend-$STAGE
```

### 4. Configure S3 for Website Hosting

```bash
aws s3 website s3://linkshield-frontend-$STAGE --index-document index.html --error-document index.html
```

### 5. Set Bucket Policy for Public Access

Create a file named `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::linkshield-frontend-$STAGE/*"
    }
  ]
}
```

Apply the policy:

```bash
aws s3api put-bucket-policy --bucket linkshield-frontend-$STAGE --policy file://bucket-policy.json
```

### 6. Upload Frontend Build to S3

```bash
aws s3 sync dist/ s3://linkshield-frontend-$STAGE --delete
```

### 7. (Optional) Set Up CloudFront

For better performance and HTTPS support:

```bash
# Create CloudFront distribution (simplified example)
aws cloudfront create-distribution --origin-domain-name linkshield-frontend-$STAGE.s3-website-$REGION.amazonaws.com
```

## Database Setup

### 1. Create RDS Instance

```bash
aws rds create-db-instance \
  --db-instance-identifier linkshield-$STAGE \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --allocated-storage 20 \
  --master-username adminuser \
  --master-user-password YOUR_PASSWORD \
  --vpc-security-group-ids sg-12345 \
  --db-name linkshield
```

### 2. Run Database Migrations

Once the database is available:

```bash
cd backend
# Run your database migration script here
python scripts/db_migrations.py
```

## CI/CD Pipeline Setup

Configure GitHub Actions to automate deployment:

1. Add AWS credentials to GitHub repository secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

2. Ensure your repository has the workflow file at `.github/workflows/cicd.yml`

3. Push changes to trigger the workflow:
   - Push to `develop` branch for development environment
   - Push to `main` branch for production environment

## Monitoring and Logging

### 1. Configure CloudWatch Logs

Lambda functions automatically send logs to CloudWatch. To view:

```bash
aws logs get-log-events --log-group-name /aws/lambda/linkshield-ai-backend-dev-app
```

### 2. Set Up CloudWatch Alarms

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "API-HighErrorRate" \
  --alarm-description "Alarm if API error rate exceeds threshold" \
  --metric-name "5XXError" \
  --namespace "AWS/ApiGateway" \
  --statistic "Sum" \
  --period 60 \
  --threshold 5 \
  --comparison-operator "GreaterThanThreshold" \
  --evaluation-periods 1 \
  --alarm-actions "arn:aws:sns:us-east-1:123456789012:LinkShield-Alerts"
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure API Gateway has proper CORS configuration
2. **Database Connection Issues**: Check security groups and network ACLs
3. **Lambda Timeouts**: Increase timeout value in serverless.yml
4. **S3 Access Denied**: Verify bucket policy and permissions

### Useful Commands

```bash
# Check Lambda logs
serverless logs -f app

# Test API endpoint
curl -X GET https://your-api-endpoint.execute-api.us-east-1.amazonaws.com/dev/health

# Verify database connection
aws rds describe-db-instances --db-instance-identifier linkshield-$STAGE
```
