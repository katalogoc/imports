FROM node:12.11.0 AS builder
LABEL maintainer="shonie.starnikov@gmail.com"
# Default dir equals to /app (container)
WORKDIR /app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json tsconfig.json .crontab /app/
ADD src/ /app/src
RUN npm i
RUN npm run build
# Remove src folder and devDependencies to decrease image size
RUN rm -rf src packae-lock.json
RUN npm prune --production

FROM node:12.11.0-alpine
COPY --from=builder /app /app
WORKDIR /app
EXPOSE 8083
RUN npm install pm2 -g
# Start container with scheduling the import jobs and starting the node server
CMD ["sh", "-c", "crontab -u root .crontab && pm2-runtime npm -- start"]
