FROM "node:12.11.0"
LABEL maintainer="shonie.starnikov@gmail.com"

# Default dir equals to /app (container path)
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json tsconfig.json .crontab /app/
ADD src/ /app/src
RUN npm i
RUN npm run build

# Remove src folder and devDependencies to decrease image size
RUN rm -rf src
RUN npm prune --production

EXPOSE 8083

# Install cron to run import jobs regularly
RUN apt-get update \
  && apt-get -y install cron \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Start container with scheduling the import jobs and starting the node server
CMD ["sh", "-c", "crontab -u root .crontab && npm start"]
