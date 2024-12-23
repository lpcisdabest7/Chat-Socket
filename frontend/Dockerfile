# Stage 1: Build the React app using Vite
FROM node:alpine AS build

# Set environment variables
ENV REACT_APP_API_URL=https://chat-socket-production-6e52.up.railway.app/

# Set the working directory inside the container
WORKDIR /react-app

# Copy package.json and yarn.lock to install dependencies
COPY ./package*.json ./yarn.lock /react-app/

# Install dependencies
RUN yarn install

# Copy the rest of the project files
COPY . .

# Build the app for production using Vite
RUN yarn build

# Stage 2: Serve the production build
FROM nginx:alpine AS production

# Copy the build files from the build stage
COPY --from=build /react-app/dist /usr/share/nginx/html

# Expose port 80 for serving the app
EXPOSE 80

# Start nginx to serve the app
CMD ["nginx", "-g", "daemon off;"]
