FROM node:18-alpine as builder

WORKDIR /app

COPY package.json .
RUN yarn

COPY tsconfig.json .

COPY index.html .
COPY public/ public/
COPY src/ src/

RUN yarn build

FROM node:18-alpine

WORKDIR /app

RUN npm i -g serve

COPY --from=builder /app/dist/ ./dist/

CMD ["npx", "serve", "-s", "dist", "-p", "3000"]