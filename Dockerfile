# Container for the shared node module
FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm i -g nx@20.0.5
RUN npm install