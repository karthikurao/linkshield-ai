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
  # Deployment Guide

  This guide walks through deploying LinkShield AI without any cloud-specific tooling. The reference setup uses:

  - **Backend**: FastAPI served by Uvicorn/Gunicorn
  - **Frontend**: Static build served by any HTTP server (e.g., Nginx)
  - **Database**: Embedded SQLite (default) or external Postgres if configured

  Feel free to adapt these steps to Docker, Kubernetes, or your preferred platform.

  ## 1. Prepare the Environment

  1. Clone the repository onto the target host.
  2. Ensure Python 3.11 and Node.js 18+ are installed.
  3. Copy `backend/.env.example` to `backend/.env` and set production secrets (`SECRET_KEY`, `JWT_SECRET_KEY`, optional `VIRUSTOTAL_API_KEY`).
  4. Copy `frontend/.env.example` to `frontend/.env` and point `VITE_API_BASE_URL` to the backend URL that will be exposed (e.g., `https://api.example.com`).

  ## 2. Build and Package the Backend

  ```bash
  cd backend
  python -m venv venv
  source venv/bin/activate  # use backenv\Scripts\activate on Windows
  pip install -r requirements.txt

  # Optional: run the test suite
  pytest

  # Start the server for smoke testing
  uvicorn app.main:app --host 0.0.0.0 --port 8000
  ```

  For production use Gunicorn with Uvicorn workers:

  ```bash
  gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000
  ```

  Place the command in a process manager such as systemd, Supervisor, or pm2 to keep it running.

  ## 3. Build the Frontend

  ```bash
  cd frontend
  npm install
  npm run build
  ```

  The production files are generated in `frontend/dist`. Serve them with any static web server. Example Nginx snippet:

  ```
  server {
      listen 80;
      server_name app.example.com;

      root /var/www/linkshield-frontend/dist;
      index index.html;

      location / {
          try_files $uri /index.html;
      }
  }
  ```

  Copy the `dist` directory to `/var/www/linkshield-frontend/dist` (or similar) and reload Nginx.

  ## 4. Reverse Proxy Setup (Optional but Recommended)

  Terminate HTTPS and proxy traffic to the backend with Nginx or another reverse proxy:

  ```
  server {
      listen 443 ssl;
      server_name api.example.com;

      ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

      location / {
          proxy_pass http://127.0.0.1:8000;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
  }
  ```

  Use Certbot or your certificate authority of choice to provision TLS certificates.

  ## 5. Database Considerations

  - The default SQLite database (`backend/app/linkshield.db`) works well for small deployments. Ensure the application user has write permissions to that file.
  - For Postgres or another external database, update the connection logic in `app/database.py` accordingly and configure environment variables as needed.
  - Remember to schedule regular backups regardless of the engine.

  ## 6. CI/CD Alignment

  The GitHub Actions workflow (`.github/workflows/cicd.yml`) currently runs:

  - Backend unit tests
  - Frontend lint + tests
  - Frontend build artifact upload

  Hook the generated build artifact into your deployment pipeline or extend the workflow with SSH/SFTP steps to push assets to your server.

  ## 7. Post-Deployment Checks

  1. Hit `https://api.example.com/health` to confirm the backend is healthy.
  2. Log in through the frontend to ensure authentication works end-to-end.
  3. Verify static assets load correctly and no mixed-content warnings appear in the browser console.
  4. Monitor server logs (`journalctl`, Nginx access/error logs, Gunicorn logs) for the first few hours of traffic.

  ## 8. Hardening Tips

  - Run the backend under a dedicated OS user with minimal permissions.
  - Enable automatic restarts (systemd `Restart=always`) for the API service.
  - Serve the frontend with HTTP/2 and gzip/brotli compression.
  - Configure a Web Application Firewall (WAF) or reverse proxy rate limits if exposing the API publicly.

  With these steps, LinkShield AI can be hosted on any VM or container platform without depending on AWS-specific services.
