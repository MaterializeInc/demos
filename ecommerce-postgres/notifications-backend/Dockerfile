# Define base image
FROM node:16

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Set the container to listen on the specified port at runtime
EXPOSE 8080

# Run the app
CMD [ "node", "index.js" ]
