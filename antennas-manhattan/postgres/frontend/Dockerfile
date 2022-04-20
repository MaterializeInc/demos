# Specify a base image
FROM node:16 as build-deps

# Create working directory and copy the app before running yarn install as the artifactory
# credentials can be inside .npmrc
WORKDIR /usr/src/app
COPY . ./

# Run yarn install
RUN yarn install

# Build the project
RUN yarn build

# Install serve command for yarn package manager
RUN yarn global add serve

# Start the application
CMD serve -p 3000 ./build