# API Gateway Permissions Required

Your IAM user `piritiya-developer` needs API Gateway (HTTP API / v2) permissions so the deploy script can create and manage the API and routes.

---

## Who Must Add This Policy

**The `piritiya-developer` user cannot attach policies to itself.** You need to use one of:

- **AWS root account** (login as root in the console), or  
- **Another IAM user/role** that has IAM permissions (e.g. `iam:PutUserPolicy`).

If you only have `piritiya-developer` credentials, ask your account owner/admin to add the policy using the steps below (Console or CLI).

---

## Error You Saw

```
User: arn:aws:iam::288761728613:user/piritiya-developer is not authorized to perform: apigateway:GET on resource: arn:aws:apigateway:us-east-1::/apis
```

---

## Quick Fix (AWS CLI) — run as admin

**Use credentials that have IAM permissions** (root or an IAM admin). From the project root:

```bash
aws iam put-user-policy \
  --user-name piritiya-developer \
  --policy-name PiritiyaAPIGatewayAccess \
  --policy-document file://docs/setup/API_GATEWAY_POLICY.json
```

Then, as `piritiya-developer`, re-run the deploy:

```bash
./scripts/deploy-production.sh
```

---

## Manual Fix (AWS Console) — use an admin login

1. Sign in as **root** or an IAM user with permission to edit users.
2. Go to **IAM Console** → **Users** → **piritiya-developer**
2. Open the **Permissions** tab → **Add permissions** → **Create inline policy**
3. Open the **JSON** tab and paste the contents of [docs/setup/API_GATEWAY_POLICY.json](API_GATEWAY_POLICY.json), or:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "APIGatewayHTTPAPI",
      "Effect": "Allow",
      "Action": [
        "apigateway:GET",
        "apigateway:POST",
        "apigateway:PUT",
        "apigateway:PATCH",
        "apigateway:DELETE"
      ],
      "Resource": [
        "arn:aws:apigateway:us-east-1::/apis",
        "arn:aws:apigateway:us-east-1::/apis/*"
      ]
    }
  ]
}
```

4. Click **Next**, name the policy **PiritiyaAPIGatewayAccess**, then **Create policy**
5. Re-run: `./scripts/deploy-production.sh`

---

## Why This Is Needed

The deploy script uses API Gateway v2 (HTTP API) to:

- List/create the HTTP API
- Create the Lambda integration and routes (`ANY /`, `ANY /{proxy+}`)
- Create the `$default` stage

Those actions require the `apigateway:*` permissions scoped to your region’s APIs.

---

## After Adding Permissions

Run the deployment again; the API Gateway step should succeed:

```bash
./scripts/deploy-production.sh
```
