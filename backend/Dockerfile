# Multi-stage production Dockerfile for Sisodiya Craft Backend
# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

# Generate Prisma client and compile TypeScript
RUN npx prisma generate
RUN npm run build

# Stage 2: Production runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

# Copy compiled files from builder
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -S sisodiya && adduser -S sisodiya -G sisodiya
USER sisodiya

EXPOSE 5000

CMD ["node", "dist/server.js"]

