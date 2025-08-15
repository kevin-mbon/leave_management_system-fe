# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Add ARG instructions for build-time variables
ARG VITE_API_URL
ARG VITE_APP_NAME
ARG VITE_APP_VERSION

# Set ENV variables
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy all files preserving case
COPY . .

# Ensure correct file permissions and line endings
RUN find . -type f -name "*.jsx" -exec chmod 644 {} \;

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]