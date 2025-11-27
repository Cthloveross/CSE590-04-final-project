# Multi-stage Dockerfile for Nuxt.js application

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy patches directory for patch-package
COPY patches ./patches

# Install all dependencies (needed for postinstall script)
RUN npm ci

# Copy built application from builder
COPY --from=builder /app/.output /app/.output

# Remove dev dependencies after build
RUN npm prune --production

# Expose the application port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", ".output/server/index.mjs"]
