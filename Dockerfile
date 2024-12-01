# Container for the shared node module
FROM node:18-bullseye



WORKDIR /app

COPY package*.json ./

RUN npm i -g nx@20.0.5
RUN npm ci
COPY . .