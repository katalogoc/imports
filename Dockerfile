FROM "node:12.11.0"
LABEL maintainer="shonie.starnikov@gmail.com"
WORKDIR /app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json tsconfig.json .crontab /app/
ADD src/ /app/src
RUN ls -la
RUN npm i
RUN npm run build
EXPOSE 8083
RUN apt-get update \
  && apt-get -y install cron \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*
CMD ["sh", "-c", "crontab -u root .crontab && npm start"]
