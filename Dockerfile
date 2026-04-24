# Use official Node.js LTS image
FROM node:20-bullseye as builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Next.js app in standalone mode
RUN npx next build

# --- Production image ---
FROM node:20-bullseye-slim as runner
WORKDIR /app

# Copy standalone output and static files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/signaling-server.js ./signaling-server.js
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env.example ./

# Install only production dependencies
RUN npm install --omit=dev && npm cache clean --force;

# Expose ports
EXPOSE 3000 8080

# Start both servers
CMD ["sh", "-c", "node signaling-server.js & node server.js"]
