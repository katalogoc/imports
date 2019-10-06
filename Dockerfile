FROM "node:12.11.0"
LABEL maintainer="shonie.starnikov@gmail.com"
WORKDIR /app
COPY . /app
RUN npm i
EXPOSE 8083
RUN apt-get update \
  && apt-get -y install cron \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*
CMD ["sh", "-c", "crontab -u root .crontab && npm start"]