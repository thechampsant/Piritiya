# Piritiya Documentation

Complete documentation for the Piritiya Agricultural Advisory System.

## 📖 Documentation Structure

### 🚀 Setup Guides (`setup/`)

Step-by-step instructions for setting up the system:

- **[AWS Setup India](setup/AWS_SETUP_INDIA.md)** - AWS account setup for India region
- **[Bedrock Setup](setup/BEDROCK_SETUP.md)** - AWS Bedrock Agent configuration
- **[Bedrock Configuration](setup/BEDROCK_CONFIG.md)** - Bedrock model and settings
- **[Bedrock Model Guide](setup/BEDROCK_MODEL_GUIDE.md)** - Available models and selection
- **[Phase 1 Setup](setup/PHASE1_SETUP.md)** - Initial infrastructure setup
- **[Phase 1 Complete](setup/PHASE1_COMPLETE.md)** - Phase 1 completion checklist
- **[Phase 1 Checklist](setup/.phase1_checklist.md)** - Detailed task checklist
- **[Deploy US East 1](setup/deploy_us_east_1.sh)** - Deployment script for us-east-1
- **[Setup Phase 1 Script](setup/setup_phase1.sh)** - Automated setup script
- **[IAM Policy](setup/POLICY_TO_ADD.json)** - Required IAM policy JSON

### 📚 User Guides (`guides/`)

How-to guides for using the system:

- **[Start Here](guides/START_HERE.md)** - First steps for new users
- **[Getting Started](guides/GETTING_STARTED.md)** - Comprehensive getting started guide
- **[Quickstart](guides/QUICKSTART.md)** - Quick setup for experienced users
- **[Quick Reference](guides/QUICK_REFERENCE.md)** - Command and API reference
- **[Create Agent Console](guides/CREATE_AGENT_CONSOLE.md)** - Manual Bedrock Agent creation

### 🔧 Troubleshooting (`troubleshooting/`)

Solutions for common issues:

- **[Fix Bedrock Access](troubleshooting/FIX_BEDROCK_ACCESS.md)** - Bedrock permission issues
- **[Fix Agent Role](troubleshooting/FIX_AGENT_ROLE.md)** - IAM role configuration
- **[Simple Agent Fix](troubleshooting/SIMPLE_AGENT_FIX.md)** - Quick agent fixes
- **[Final Agent Fix](troubleshooting/FINAL_AGENT_FIX.md)** - Comprehensive agent troubleshooting
- **[Fresh Start](troubleshooting/FRESH_START.md)** - Clean slate setup
- **[Chatbot Workaround](troubleshooting/WORKAROUND_CHATBOT.md)** - Chatbot issues

## 🎯 Quick Navigation

### For Developers

1. **First Time Setup:**
   - Start with [Getting Started](guides/GETTING_STARTED.md)
   - Follow [Phase 1 Setup](setup/PHASE1_SETUP.md)
   - Configure [AWS Setup](setup/AWS_SETUP_INDIA.md)

2. **Backend Development:**
   - See `../backend/README.md` (if exists)
   - Review `.kiro/specs/piritiya-backend-api/`

3. **Frontend Development:**
   - See `../frontend/README.md` (if exists)
   - Review `.kiro/specs/piritiya-chatbot-frontend/`

### For DevOps

1. **Infrastructure Setup:**
   - [AWS Setup India](setup/AWS_SETUP_INDIA.md)
   - [Deploy US East 1](setup/deploy_us_east_1.sh)
   - [IAM Policy](setup/POLICY_TO_ADD.json)

2. **Bedrock Configuration:**
   - [Bedrock Setup](setup/BEDROCK_SETUP.md)
   - [Bedrock Model Guide](setup/BEDROCK_MODEL_GUIDE.md)
   - [Create Agent Console](guides/CREATE_AGENT_CONSOLE.md)

3. **Troubleshooting:**
   - [Fix Bedrock Access](troubleshooting/FIX_BEDROCK_ACCESS.md)
   - [Fix Agent Role](troubleshooting/FIX_AGENT_ROLE.md)

### For Users

1. **Getting Started:**
   - [Start Here](guides/START_HERE.md)
   - [Quickstart](guides/QUICKSTART.md)

2. **Reference:**
   - [Quick Reference](guides/QUICK_REFERENCE.md)

## 📋 Common Tasks

### Setup DynamoDB Tables
```bash
python scripts/create_dynamodb_tables.py
```

### Load Mock Data
```bash
python scripts/load_mock_data.py
```

### Deploy Lambda Functions
```bash
./lambda_functions/deploy.sh
```

### Start Backend Server
```bash
cd backend
uvicorn main:app --reload
```

### Start Frontend Development
```bash
cd frontend
npm run dev
```

## 🔗 Related Documentation

- **Spec Documentation:** `../.kiro/specs/`
  - Backend API spec
  - Frontend PWA spec
- **Project README:** `../README.md`
- **Backend Code:** `../backend/`
- **Frontend Code:** `../frontend/`

## 📝 Documentation Standards

All documentation follows these conventions:

- **Markdown format** for all docs
- **Clear headings** with emoji for visual navigation
- **Code blocks** with language syntax highlighting
- **Step-by-step instructions** for setup guides
- **Screenshots** where helpful (in `images/` subdirectory)

## 🤝 Contributing to Documentation

When adding new documentation:

1. Place in appropriate subdirectory (`setup/`, `guides/`, `troubleshooting/`)
2. Update this README.md with a link
3. Follow existing formatting conventions
4. Include practical examples and code snippets
5. Test all commands and instructions

## 📞 Need Help?

1. Check the [Troubleshooting](troubleshooting/) section
2. Review the [Quick Reference](guides/QUICK_REFERENCE.md)
3. Consult the spec documentation in `../.kiro/specs/`
4. Open an issue on GitHub

---

**Last Updated:** 2026-03-01  
**Documentation Version:** 1.0
