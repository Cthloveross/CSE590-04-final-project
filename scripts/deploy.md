# Deployment Scripts

This directory contains deployment helper scripts.

## deploy.sh

Basic deployment script for remote servers using SSH.

### Usage:

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production
```

### Prerequisites:

1. Set up environment variables or modify the script:
   - STAGING_SERVER
   - STAGING_USER
   - PRODUCTION_SERVER
   - PRODUCTION_USER

2. Ensure SSH keys are set up for passwordless login

3. Docker must be installed on target servers
