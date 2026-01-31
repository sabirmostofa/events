# Stage 1: Build the TypeScript code
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./
RUN npm install

# Copy source code and config
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Production Runner
FROM node:22-alpine AS runner

WORKDIR /app

# Only copy production dependencies to save space
COPY package*.json ./
RUN npm install --omit=dev

# Copy the compiled JS from the builder stage
COPY --from=builder /app/dist ./dist

# Set environment to production
ENV NODE_ENV=production

# The port your Registration Service listens on
EXPOSE 8081

CMD ["node", "dist/index.js"]