FROM node:20.11.0

WORKDIR /usr/src/app

COPY package*.json /usr/src/app

RUN yarn install

COPY . /usr/src/app

EXPOSE 3000

CMD ["yarn", "start"]