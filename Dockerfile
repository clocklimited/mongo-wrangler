FROM mongo:8.0.32-noble

WORKDIR /usr/src/app

RUN apt-get update \
    && apt-get install -y --no-install-recommends nodejs zstd jq curl \
    && rm -rf /var/lib/apt/lists/*

COPY . .

CMD ["/usr/src/app/dump-nf.sh"]
