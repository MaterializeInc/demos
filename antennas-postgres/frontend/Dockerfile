# Specify a base image
FROM node:16

# Create working directory and copy the app before running yarn install as the artifactory
# credentials can be inside .npmrc
WORKDIR /usr/src/app
COPY . ./

# Run yarn install - Clean cache - Build the project - Install serve command for yarn package manager
RUN yarn install && yarn cache clean && yarn build && yarn global add serve

# Start the application
CMD serve -p 3000 ./build
