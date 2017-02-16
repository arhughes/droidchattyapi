FROM mhart/alpine-node:7.5

WORKDIR /app
COPY . ./

RUN npm install

CMD ["./node_modules/forever/bin/forever", "web.js"]
