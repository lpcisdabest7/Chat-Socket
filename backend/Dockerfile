# BUILD FOR LOCAL DEVELOPMENT
# Base image for development
FROM node:20-buster-slim As development

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies
RUN yarn install

RUN npm i -g @nestjs/cli

COPY . .

RUN yarn build

# PRODUCTION
# Base image for production
FROM node:20-buster-slim As production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install --only=production --ignore-scripts

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/package.json package.json

CMD ["yarn", "start:prod"]
