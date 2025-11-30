# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying the Gaming Services Platform.

## Prerequisites

1. **Kubernetes Cluster**: Local (minikube, kind, Docker Desktop) or cloud (GKE, EKS, AKS)
2. **kubectl**: Kubernetes CLI tool
3. **Docker**: For building images
4. **MongoDB Atlas Account**: Free tier available at https://cloud.mongodb.com/

## Quick Start (Local Development)

### 1. Start Kubernetes (Docker Desktop)

Enable Kubernetes in Docker Desktop:
- Open Docker Desktop → Settings → Kubernetes → Enable Kubernetes

### 2. Set Up MongoDB Atlas

Before deploying, you need a MongoDB Atlas database:

1. **Create Account & Cluster**
   - Go to https://cloud.mongodb.com/
   - Create a free M0 cluster

2. **Configure Network Access** ⚠️ CRITICAL
   - Navigate to **Network Access** → **Add IP Address**
   - Add your current IP address (or `0.0.0.0/0` for development)
   - Wait 1-2 minutes for changes to take effect

3. **Create Database User**
   - Navigate to **Database Access** → **Add New Database User**
   - Create user with "Read and Write" permissions
   - Save username and password

4. **Get Connection String**
   - Go to **Database** → Click **Connect** → **Connect your application**
   - Copy the connection string
   - Replace `<password>` and add database name (`game-services`)

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env

# Edit with your real values
nano .env   # or use your preferred editor
```

**Required values in `.env`:**
```env
# MongoDB Atlas (REQUIRED)
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/game-services
NUXT_MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/game-services

# JWT Secret (REQUIRED) - Generate with: openssl rand -base64 32
JWT_SECRET=your-generated-secret-here
NUXT_JWT_SECRET=your-generated-secret-here

# Session Password (REQUIRED) - At least 32 characters
NUXT_SESSION_PASSWORD=your-session-password-at-least-32-chars

# Site URL for K8s (REQUIRED for OAuth callbacks)
NUXT_PUBLIC_SITE_URL=http://localhost:30000
NUXT_PUBLIC_SOCKET_URL=http://localhost:30001

# OAuth (OPTIONAL - for social login)
NUXT_OAUTH_GOOGLE_CLIENT_ID=your-google-client-id
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret
NUXT_OAUTH_GITHUB_CLIENT_ID=your-github-client-id
NUXT_OAUTH_GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 4. Build Docker Image

**macOS / Linux:**
```bash
docker build \
  --build-arg NUXT_PUBLIC_SOCKET_URL=http://localhost:30001 \
  --build-arg NUXT_PUBLIC_SITE_URL=http://localhost:30000 \
  -t gaming-platform:latest .
```

**Windows (PowerShell):**
```powershell
docker build `
  --build-arg NUXT_PUBLIC_SOCKET_URL=http://localhost:30001 `
  --build-arg NUXT_PUBLIC_SITE_URL=http://localhost:30000 `
  -t gaming-platform:latest .
```

### 5. Create Kubernetes Secrets from .env

**macOS / Linux:**
```bash
kubectl create namespace gaming-platform
kubectl create secret generic gaming-platform-secrets \
  --from-env-file=.env \
  -n gaming-platform \
  --dry-run=client -o yaml | kubectl apply -f -
```

**Windows (PowerShell):**
```powershell
kubectl create namespace gaming-platform
kubectl create secret generic gaming-platform-secrets `
  --from-env-file=.env `
  -n gaming-platform `
  --dry-run=client -o yaml | kubectl apply -f -
```

### 6. Deploy to Kubernetes

```bash
# Deploy all resources using Kustomize
kubectl apply -k k8s/

# Check deployment status
kubectl get all -n gaming-platform
```

### 7. Seed the Database (First Time Only)

```bash
# Seed demo data into MongoDB Atlas
node scripts/seed.mjs
```

### 8. Access the Application

| Service          | URL                    |
| ---------------- | ---------------------- |
| Application      | http://localhost:30000 |
| Socket.IO Server | http://localhost:30001 |

## OAuth Configuration for Kubernetes

If using OAuth (Google/GitHub login), update your OAuth app settings:

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Edit your OAuth 2.0 Client
3. Add authorized redirect URI: `http://localhost:30000/api/auth/callback/google`

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Edit your OAuth App
3. Update Authorization callback URL: `http://localhost:30000/api/auth/callback/github`

> **Note**: Keep the original `localhost:3000` URIs for local development.

## Useful Commands

```bash
# Check deployment status
kubectl get all -n gaming-platform

# View pod logs
kubectl logs -f deployment/gaming-platform-app -n gaming-platform
kubectl logs -f deployment/gaming-platform-socket -n gaming-platform

# Check pod details (debugging)
kubectl describe pod -l app=gaming-platform -n gaming-platform

# Restart deployment (after config changes)
kubectl rollout restart deployment -n gaming-platform

# Scale deployment
kubectl scale deployment gaming-platform-app --replicas=3 -n gaming-platform

# Delete all resources
kubectl delete -k k8s/

# View current secrets (base64 encoded)
kubectl get secret gaming-platform-secrets -n gaming-platform -o yaml
```

## Troubleshooting

### Database Connection Fails
```bash
# Check pod logs for errors
kubectl logs -f deployment/gaming-platform-app -n gaming-platform
```

Common causes:
- **IP not whitelisted**: Add your IP in MongoDB Atlas → Network Access
- **Wrong credentials**: Verify MONGODB_URI in your secrets
- **Database name missing**: Ensure `/game-services` is in the URI

### OAuth Not Working
- Verify redirect URIs match exactly (including port 30000)
- Check that OAuth secrets are correctly set
- Ensure NUXT_PUBLIC_SITE_URL is `http://localhost:30000`

### Pods Stuck in CrashLoopBackOff
```bash
# View detailed error messages
kubectl describe pod -l app=gaming-platform -n gaming-platform
kubectl logs deployment/gaming-platform-app -n gaming-platform --previous
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Ingress Controller                   │ │
│  │                 (nginx-ingress / traefik)               │ │
│  └────────────────────────────────────────────────────────┘ │
│           │                              │                   │
│           ▼                              ▼                   │
│  ┌─────────────────┐           ┌─────────────────┐         │
│  │  App Service    │           │ Socket Service  │         │
│  │  NodePort:30000 │           │  NodePort:30001 │         │
│  └─────────────────┘           └─────────────────┘         │
│           │                              │                   │
│           ▼                              ▼                   │
│  ┌─────────────────┐           ┌─────────────────┐         │
│  │  App Deployment │           │Socket Deployment│         │
│  │  (2+ replicas)  │           │  (1 replica)    │         │
│  └─────────────────┘           └─────────────────┘         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              ConfigMap & Secrets                      │   │
│  │                 (from .env file)                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  MongoDB Atlas  │
                    │   (External)    │
                    └─────────────────┘
```

## Production Considerations

1. **Secrets Management**: Use HashiCorp Vault, AWS Secrets Manager, or Sealed Secrets
2. **Image Registry**: Push images to a container registry (Docker Hub, GCR, ECR)
3. **TLS/SSL**: Configure cert-manager for automatic TLS certificates
4. **Monitoring**: Add Prometheus/Grafana for monitoring
5. **Logging**: Configure centralized logging (ELK, Loki)
6. **Socket.IO Scaling**: Use Redis adapter for multiple Socket.IO replicas

## File Reference

| File                     | Description                               |
| ------------------------ | ----------------------------------------- |
| `namespace.yaml`         | Creates `gaming-platform` namespace       |
| `configmap.yaml`         | Non-sensitive configuration               |
| `secrets.yaml`           | Template for secrets (placeholder values) |
| `deployment-app.yaml`    | Main Nuxt application deployment          |
| `deployment-socket.yaml` | Socket.IO server deployment               |
| `service.yaml`           | NodePort services for external access     |
| `ingress.yaml`           | Ingress rules (optional)                  |
| `kustomization.yaml`     | Kustomize configuration                   |
