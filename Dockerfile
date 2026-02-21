# Build stage
FROM node:20-alpine AS builder

WORKDIR /build

# Install dependencies with multiple fallbacks
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline --no-audit 2>&1 || npm install --legacy-peer-deps --no-optional --no-fund 2>&1 || npm install --force

# Copy source
COPY . .

# Build
RUN npm run build

# Serve stage
FROM nginx:1.24-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/consumption-app.conf

# Copy built app to nginx
COPY --from=builder /build/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
