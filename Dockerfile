FROM alpine:3.17

WORKDIR /usr/src/app

COPY . .

RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.6/main' >> /etc/apk/repositories
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.6/community' >> /etc/apk/repositories
RUN apk update
RUN apk add zstd curl mongodb mongodb-tools tar yarn jq sed bash libc6-compat gcompat

CMD [ "/usr/src/app/dump-nf.sh" ]
