FROM debian:bullseye-slim

# Install dependencies
RUN apt-get update && \
    apt-get install -y wget tar ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install IPFS (Kubo)
ENV IPFS_VERSION=v0.34.1
RUN wget https://dist.ipfs.tech/kubo/${IPFS_VERSION}/kubo_${IPFS_VERSION}_linux-amd64.tar.gz && \
    tar -xzf kubo_${IPFS_VERSION}_linux-amd64.tar.gz && \
    mv kubo/ipfs /usr/local/bin/ipfs && \
    rm -rf kubo*

# Install IPFS Cluster
ENV CLUSTER_VERSION=v1.1.2
RUN wget https://dist.ipfs.tech/ipfs-cluster-service/${CLUSTER_VERSION}/ipfs-cluster-service_${CLUSTER_VERSION}_linux-amd64.tar.gz && \
    tar -xzf ipfs-cluster-service_${CLUSTER_VERSION}_linux-amd64.tar.gz && \
    mv ipfs-cluster-service/ipfs-cluster-service /usr/local/bin/ipfs-cluster-service && \
    rm -rf ipfs-cluster-service*

# Install IPFS Cluster CTL
RUN wget https://dist.ipfs.tech/ipfs-cluster-ctl/${CLUSTER_VERSION}/ipfs-cluster-ctl_${CLUSTER_VERSION}_linux-amd64.tar.gz && \
    tar -xzf ipfs-cluster-ctl_${CLUSTER_VERSION}_linux-amd64.tar.gz && \
    mv ipfs-cluster-ctl/ipfs-cluster-ctl /usr/local/bin/ipfs-cluster-ctl && \
    rm -rf ipfs-cluster-ctl*

# Set cluster config path for all processes
ENV IPFS_CLUSTER_PATH=/data/ipfs-cluster

# Expose IPFS and Cluster ports
EXPOSE 4001 5001 8080 9094 9095 9096

# Entrypoint: initialize and run both daemons
CMD ["/bin/sh", "-c", "\
    if [ ! -d \"$IPFS_PATH\" ]; then ipfs init --profile=server; fi && \
    ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001 && \
    if [ ! -f /data/ipfs-cluster/service.json ]; then ipfs-cluster-service init --consensus crdt --datastore badger; fi && \
    ipfs daemon --migrate=true & \
    sleep 5 && \
    exec ipfs-cluster-service daemon \
"]