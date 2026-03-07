# Piritiya Quick Reference

## Configuration Files

### .env file (Main Configuration)
```bash
# Copy example and edit
cp .env.example .env

# Edit with your values
nano .env  # or use any text editor
```

**Required values:**
- `BEDROCK_AGENT_ID` - Get from AWS Console → Bedrock → Agents
- `BEDROCK_AGENT_ALIAS_ID` - Get from Aliases tab (use `TSTALIASID` for testing)
- `AWS_REGION` - Already set to `ap-south-1`

## Common Commands

### Phase 1 Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Create DynamoDB tables
python3 scripts/create_dynamodb_tables.py

# Load mock data
python3 scripts/load_mock_data.py

# Deploy Lambda functions
./lambda_functions/deploy.sh

# Test Phase 1
python3 scripts/test_phase1.py
```

### Bedrock Setup
```bash
# Setup IAM roles
./scripts/setup_bedrock.sh

# After creating agent in console, grant permissions
./scripts/grant_lambda_permissions.sh YOUR_AGENT_ID

# Test Bedrock agent (using .env)
python3 scripts/test_bedrock_agent.py

# OR with command line args
python3 scripts/test_bedrock_agent.py AGENT_ID ALIAS_ID
```

### AWS CLI Commands
```bash
# List DynamoDB tables
aws dynamodb list-tables --region ap-south-1

# List Lambda functions
aws lambda list-functions --region ap-south-1 --query 'Functions[?starts_with(FunctionName, `get-`)].FunctionName'

# List Bedrock agents
aws bedrock-agent list-agents --region ap-south-1

# Get agent details
aws bedrock-agent get-agent --agent-id YOUR_AGENT_ID --region ap-south-1

# List agent aliases
aws bedrock-agent list-agent-aliases --agent-id YOUR_AGENT_ID --region ap-south-1
```

## File Structure

```
Piritiya/
├── .env                          # Your configuration (create from .env.example)
├── .env.example                  # Configuration template
├── README.md                     # Project overview
├── requirements.md               # Project requirements
├── design.md                     # Architecture design
├── GETTING_STARTED.md           # Quick start guide
├── PHASE1_SETUP.md              # Phase 1 detailed setup
├── BEDROCK_SETUP.md             # Bedrock setup guide
├── BEDROCK_CONFIG.md            # How to configure Agent ID/Alias
├── AWS_SETUP_INDIA.md           # AWS India region setup
├── requirements.txt             # Python dependencies
│
├── scripts/
│   ├── create_dynamodb_tables.py    # Create DynamoDB tables
│   ├── load_mock_data.py            # Load mock farmer data
│   ├── test_phase1.py               # Test Phase 1 components
│   ├── setup_bedrock.sh             # Setup Bedrock IAM roles
│   ├── grant_lambda_permissions.sh  # Grant Lambda permissions
│   └── test_bedrock_agent.py        # Test Bedrock agent
│
├── lambda_functions/
│   ├── deploy.sh                    # Deploy all Lambda functions
│   ├── get_soil_moisture/
│   │   ├── lambda_function.py
│   │   └── requirements.txt
│   ├── get_crop_advice/
│   │   ├── lambda_function.py
│   │   └── requirements.txt
│   └── get_market_prices/
│       ├── lambda_function.py
│       └── requirements.txt
│
└── data/
    └── farm_data.json               # Mock farmer data
```

## Where to Find IDs

| What | Where to Find | Example |
|------|---------------|---------|
| Agent ID | AWS Console → Bedrock → Agents → Your Agent | `A1B2C3D4E5` |
| Alias ID | Bedrock → Agents → Your Agent → Aliases | `TSTALIASID` |
| AWS Account ID | `aws sts get-caller-identity --query Account --output text` | `288761728613` |
| Lambda ARN | `aws lambda get-function --function-name FUNCTION_NAME` | `arn:aws:lambda:...` |

## Testing Checklist

- [ ] DynamoDB tables created and populated
- [ ] S3 buckets created
- [ ] All 3 Lambda functions deployed
- [ ] Lambda functions tested individually
- [ ] Bedrock IAM role created
- [ ] Bedrock agent created in console
- [ ] Lambda permissions granted to agent
- [ ] Agent tested with sample queries
- [ ] .env file configured with Agent ID and Alias ID

## Troubleshooting

### Lambda deployment fails
```bash
# Check if functions exist
aws lambda list-functions --region ap-south-1

# Check function logs
aws logs tail /aws/lambda/get-soil-moisture --follow --region ap-south-1
```

### Bedrock agent not working
```bash
# Verify agent exists
aws bedrock-agent get-agent --agent-id YOUR_AGENT_ID --region ap-south-1

# Check if model access is enabled
# Go to AWS Console → Bedrock → Model access
```

### .env not loading
```bash
# Install python-dotenv
pip install python-dotenv

# Verify .env file exists
ls -la .env

# Check file contents
cat .env
```

## Next Steps After Phase 1

1. Build FastAPI backend
2. Create PWA frontend
3. Integrate Bedrock agent with backend
4. Add user authentication
5. Implement offline-first capabilities
6. Connect to real NISAR data

## Resources

- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [NISAR Mission](https://nisar.jpl.nasa.gov/)
