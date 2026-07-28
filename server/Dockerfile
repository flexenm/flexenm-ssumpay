FROM node:18-alpine

# bcrypt is a native module; node-gyp needs a toolchain to build it on alpine
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["yarn", "start"]
