# Container for the shared node module
FROM node:18-bullseye



WORKDIR /app

COPY package*.json ./
#ENV NODE_ENV=development

RUN npm i -g nx@20.0.5
RUN npm i
COPY . .
#RUN npm ci