FROM node:alpine
LABEL authors="david"
WORKDIR /app
RUN npm install -g nodemon
COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3030
CMD ["npm", "start"]
