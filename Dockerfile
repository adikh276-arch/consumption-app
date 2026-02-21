# Build stage
FROM node:20-slim AS builder

WORKDIR /build

# Set build environment
ENV NODE_ENV=production

# Install dependencies
COPY package.json ./
RUN npm install --production=false

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
