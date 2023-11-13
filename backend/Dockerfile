FROM node:18-alpine as builder

WORKDIR /app

COPY package.json .
RUN yarn

COPY tsconfig.json .
COPY tsconfig.build.json .

COPY nest-cli.json .
COPY src/ src/

RUN yarn build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package.json .
RUN yarn install --production

COPY --from=builder /app/dist/ ./dist/

CMD ["node", "dist/main.js"]