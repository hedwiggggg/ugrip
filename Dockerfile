FROM node:12.16.1

COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn install

COPY public/ public/
COPY src/ src/

ARG CORS_HOST
ENV CORS_HOST $CORS_HOST
ENV REACT_APP_CORS_HOST $CORS_HOST

ARG CORS_PORT
ENV CORS_PORT $CORS_PORT
ENV REACT_APP_CORS_PORT $CORS_PORT

ENV REACT_APP_CORS_PROTOCOL "http"

RUN yarn build

COPY docker/start.sh start.sh
COPY docker/cors-anywhere.js cors-anywhere.js

CMD [ "sh", "start.sh" ]
