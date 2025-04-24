# Extends from Node.JS 23
FROM node:23

# Setting working directory to /app
WORKDIR /app

# Copying the application source code to the container's working directory
COPY . .

# Installing application dependencies
RUN npm install

# Building application
RUN npm run build

# Exposing application port
EXPOSE 3333

# Running application
CMD ["npm", "run", "start:prod"]
