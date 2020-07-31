FROM node:12.16.1

COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn install

COPY public/ public/
COPY src/ src/

ARG CORS_SERVER
ENV CORS_SERVER $CORS_SERVER
ENV REACT_APP_CORS_SERVER $CORS_SERVER

RUN yarn build

COPY docker/start.sh start.sh
COPY docker/cors-anywhere.js cors-anywhere.js

CMD [ "sh", "start.sh" ]
