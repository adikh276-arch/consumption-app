# Build stage
FROM node:20-alpine AS builder

WORKDIR /build

# Set build environment
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=2048"

# Install dependencies
COPY package.json ./
RUN npm cache clean --force && \
    npm install --legacy-peer-deps && \
    npm list vite && \
    ls -la node_modules/.bin/vite

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
