# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install ALL dependencies
COPY package*.json ./
RUN npm install

# Copy source code and compile TS to JS
COPY . .
RUN npm run build 

# --- Stage 2: Runtime ---
FROM node:20-alpine AS runner

WORKDIR /app

# Only copy production dependencies to keep the image light
COPY package*.json ./
RUN npm install --only=production

# Copy the compiled code from the builder stage
COPY --from=builder /app/dist ./dist

# Environmental variables
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "dist/index.js"]