FROM node:20.11.0-bullseye-slim

ENV TZ=Europe/Kiev
ENV PROJECT_DIR /var/www/ecoflow-exporter
USER root

RUN mkdir -p ${PROJECT_DIR}
ADD ./ ${PROJECT_DIR}/

RUN chown node:node ${PROJECT_DIR} -R

USER node
WORKDIR ${PROJECT_DIR}

RUN npm ci

CMD [ "node", "server.js" ]


