FROM mhart/alpine-node:8

WORKDIR /app
COPY . ./

RUN npm install

CMD ["./node_modules/forever/bin/forever", "web.js"]
