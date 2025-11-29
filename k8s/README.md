# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying the Gaming Services Platform.

## Prerequisites

1. **Kubernetes Cluster**: Local (minikube, kind, Docker Desktop) or cloud (GKE, EKS, AKS)
2. **kubectl**: Kubernetes CLI tool
3. **Docker**: For building images

## Quick Start (Local Development)

### 1. Start Kubernetes (Docker Desktop)

Enable Kubernetes in Docker Desktop:
- Open Docker Desktop → Settings → Kubernetes → Enable Kubernetes

### 2. Build Docker Image

```bash
# Build the image
docker build -t gaming-platform:latest .
```

### 3. Update Secrets

Edit `k8s/secrets.yaml` with your actual credentials:
- MongoDB Atlas connection string
- JWT secrets
- OAuth credentials

Or create secrets from your `.env` file:
```bash
kubectl create namespace gaming-platform
kubectl create secret generic gaming-platform-secrets \
  --from-env-file=.env \
  -n gaming-platform
```

### 4. Deploy to Kubernetes

```bash
# Deploy all resources using Kustomize
kubectl apply -k k8s/

# Or deploy individually
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployment-app.yaml
kubectl apply -f k8s/deployment-socket.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

### 5. Access the Application

**Using NodePort (Local Development):**
```bash
# Application: http://localhost:30000
# Socket.IO: http://localhost:30001
```

**Using Port Forward:**
```bash
kubectl port-forward svc/gaming-platform-app 3000:3000 -n gaming-platform
kubectl port-forward svc/gaming-platform-socket 3001:3001 -n gaming-platform
```

**Using Ingress (requires ingress controller):**
```bash
# Add to /etc/hosts
echo "127.0.0.1 gaming-platform.local" | sudo tee -a /etc/hosts

# Access: http://gaming-platform.local
```

## Useful Commands

```bash
# Check deployment status
kubectl get all -n gaming-platform

# View pod logs
kubectl logs -f deployment/gaming-platform-app -n gaming-platform
kubectl logs -f deployment/gaming-platform-socket -n gaming-platform

# Check pod details
kubectl describe pod -l app=gaming-platform -n gaming-platform

# Scale deployment
kubectl scale deployment gaming-platform-app --replicas=3 -n gaming-platform

# Delete all resources
kubectl delete -k k8s/

# Restart deployment
kubectl rollout restart deployment/gaming-platform-app -n gaming-platform
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
│  │  (ClusterIP)    │           │  (ClusterIP)    │         │
│  └─────────────────┘           └─────────────────┘         │
│           │                              │                   │
│           ▼                              ▼                   │
│  ┌─────────────────┐           ┌─────────────────┐         │
│  │  App Deployment │           │Socket Deployment│         │
│  │  (2+ replicas)  │           │  (1 replica)    │         │
│  │                 │           │                 │         │
│  │  ┌───┐ ┌───┐   │           │     ┌───┐       │         │
│  │  │Pod│ │Pod│   │           │     │Pod│       │         │
│  │  └───┘ └───┘   │           │     └───┘       │         │
│  └─────────────────┘           └─────────────────┘         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              ConfigMap & Secrets                      │   │
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
