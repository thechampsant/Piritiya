# Piritiya Production Deployment Checklist

Use this checklist to track your deployment progress.

---

## Pre-Deployment

- [ ] AWS infrastructure verified (run `./scripts/test-before-deploy.sh quick`)
- [ ] Docker Desktop running (for backend build)
- [ ] AWS CLI configured with correct account (288761728613)
- [ ] All code committed to git
- [ ] .env file configured with all required variables

---

## Phase 1: Backend Deployment

### Automated Steps (via script)
- [ ] ECR repository created: `piritiya-api`
- [ ] Lambda container built and pushed to ECR
- [ ] Lambda function created/updated: `piritiya-api`
- [ ] API Gateway HTTP API created: `piritiya-api`
- [ ] Routes configured: `ANY /` and `ANY /{proxy+}`
- [ ] Backend health check verified

### Manual Steps
- [ ] IAM role created: `PiritiyaApiLambdaRole`
  - [ ] Trust policy for `lambda.amazonaws.com`
  - [ ] Managed policies attached (5 policies)
  - [ ] Inline policy for Polly and Transcribe

### Verification
- [ ] `GET /health` returns `{"status":"healthy"}`
- [ ] `GET /farmers` returns array of 3 farmers
- [ ] `POST /speech/synthesize` returns audio file

**API Endpoint:** `https://____________.execute-api.us-east-1.amazonaws.com`

---

## Phase 2: Frontend Deployment

### Automated Steps (via script)
- [ ] S3 bucket created: `piritiya-app-288761728613`
- [ ] Frontend built with production API URL
- [ ] Frontend uploaded to S3
- [ ] CORS updated on Lambda function

### Manual Steps
- [ ] CloudFront distribution created
  - [ ] Origin: S3 bucket with OAC
  - [ ] Default root object: `index.html`
  - [ ] Error responses: 403/404 → 200 with `/index.html`
  - [ ] Viewer protocol: Redirect HTTP to HTTPS
  - [ ] Comment: "Piritiya PWA Distribution"
- [ ] S3 bucket policy updated (from CloudFront console)
- [ ] CloudFront distribution deployed (wait 10-15 min)

### Verification
- [ ] Frontend loads at CloudFront URL
- [ ] No console errors in browser
- [ ] Service worker registered

**CloudFront URL:** `https://____________.cloudfront.net`  
**Distribution ID:** `____________`

---

## Post-Deployment Testing

### Functional Tests
- [ ] Onboarding screen loads
- [ ] Can enter Farmer ID (try F001, F002, F003)
- [ ] Home screen displays after onboarding
- [ ] Language selector works (Hindi ↔ English)
- [ ] Voice input button works (microphone)
- [ ] Voice output works (AWS Polly)
- [ ] Quick actions work (Weather, Soil, Crops, Market)
- [ ] Chat interface works
- [ ] Can send text messages
- [ ] Can send voice messages
- [ ] Bot responses appear
- [ ] Structured data displays (soil gauge, crop cards, market table)
- [ ] Navigation between screens works
- [ ] Settings screen accessible
- [ ] Can change language in settings
- [ ] Can toggle voice settings

### Offline Mode Tests
- [ ] Disconnect network (airplane mode)
- [ ] Send a message (should queue)
- [ ] See "offline" indicator
- [ ] Reconnect network
- [ ] Queued message syncs automatically
- [ ] Receive response

### Performance Tests
- [ ] Page loads in < 3 seconds
- [ ] Animations are smooth (60fps)
- [ ] No layout shifts
- [ ] Images load properly
- [ ] Fonts load without flash

### Accessibility Tests
- [ ] All buttons have 44x44px touch targets
- [ ] Text has sufficient contrast
- [ ] Can navigate with keyboard (Tab key)
- [ ] Screen reader announces content (optional)
- [ ] Zoom to 200% works without breaking layout

### Browser Compatibility
- [ ] Chrome (desktop)
- [ ] Safari (desktop)
- [ ] Chrome (Android mobile)
- [ ] Safari (iOS mobile)

---

## Production Hardening (Optional)

### Monitoring
- [ ] CloudWatch alarms set up
  - [ ] Lambda error rate > 5%
  - [ ] Lambda duration > 25s
  - [ ] API Gateway 5xx errors
  - [ ] DynamoDB throttling
- [ ] CloudWatch dashboard created
- [ ] AWS X-Ray tracing enabled

### Backups
- [ ] DynamoDB point-in-time recovery enabled
- [ ] S3 versioning enabled on critical buckets
- [ ] Automated backup schedule configured

### Security
- [ ] IAM policies reviewed for least privilege
- [ ] WAF rules configured for API Gateway
- [ ] CloudTrail logging enabled
- [ ] Secrets moved to AWS Secrets Manager
- [ ] CORS restricted to CloudFront domain only

### Performance
- [ ] CloudFront cache settings optimized
- [ ] Lambda memory/timeout tuned based on metrics
- [ ] DynamoDB capacity reviewed
- [ ] S3 lifecycle policies configured

### Custom Domain (Optional)
- [ ] SSL certificate requested in ACM
- [ ] Certificate validated
- [ ] CloudFront alternate domain configured
- [ ] DNS CNAME record added
- [ ] HTTPS working on custom domain

---

## Rollback Plan

If deployment fails or issues are found:

### Backend Rollback
```bash
# Revert to previous Lambda version
aws lambda update-function-code \
  --function-name piritiya-api \
  --image-uri 288761728613.dkr.ecr.us-east-1.amazonaws.com/piritiya-api:previous \
  --region us-east-1
```

### Frontend Rollback
```bash
# Restore previous S3 version (if versioning enabled)
# Or re-deploy previous build
export VITE_API_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
export S3_BUCKET=piritiya-app-288761728613
export CLOUDFRONT_DIST_ID=your-dist-id
./scripts/deploy-frontend-s3.sh

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id your-dist-id \
  --paths "/*"
```

---

## Support Contacts

- **AWS Support:** https://console.aws.amazon.com/support/
- **Project Documentation:** [README.md](README.md)
- **Troubleshooting:** [docs/troubleshooting/](docs/troubleshooting/)

---

## Deployment Log

| Date | Version | Deployed By | Status | Notes |
|------|---------|-------------|--------|-------|
| YYYY-MM-DD | 1.0.0 | | ⬜ Pending | Initial production deployment |
|  |  |  |  |  |
|  |  |  |  |  |

---

**Last Updated:** March 7, 2026  
**Next Review:** After first production deployment
