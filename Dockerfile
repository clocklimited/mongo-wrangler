FROM mongo:5.0.14-focal

WORKDIR /usr/src/app

COPY . .

RUN apt update
RUN apt -y install zstd jq curl

CMD [ "/usr/src/app/dump-nf.sh" ]
