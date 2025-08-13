FROM node:20-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

FROM node:alpine As production 

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["sh", "-lc", "npm run start:dev signal-processor"]