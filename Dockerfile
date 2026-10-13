FROM mongo:5.0.14-focal

WORKDIR /usr/src/app

RUN rm -f /etc/apt/sources.list.d/mongodb-org.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs zstd jq curl \
    && rm -rf /var/lib/apt/lists/*

COPY . .

CMD ["/usr/src/app/dump-nf.sh"]
