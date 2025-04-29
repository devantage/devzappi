# Extends from Node.JS 23
FROM node:23

# Creating temporary directory for application's source code
RUN mkdir -p /source

# Setting working directory to /source
WORKDIR /source

# Copying application's source code to container's working directory
COPY . .

# Updating NPM
RUN npm install -g npm@latest

# Installing application dependencies
RUN npm install

# Building application
RUN npm run build

# Creating directory for builded application
RUN mkdir -p /app

# Setting working directory to /app
WORKDIR /app

# Copying the application dependencies to builded application directory
RUN cp -r /source/node_modules .

# Copying the builded application to builded application directory
RUN cp -r /source/dist/* .

# Removing the application source code
RUN rm -rf /source

# Creating app user
RUN useradd -m -u 1001 app_user

# Setting app dir ownership
RUN chown -R app_user:app_user /app

# Setting container user
USER app_user

# Exposing application port
EXPOSE 80

# Running application
CMD ["node", "."]
