# StoreChain IPFS Cluster Pinning Service

This project provides a local IPFS Cluster setup using Docker Compose, along with a Node.js-based pinning service API. You can use this setup to pin files to your cluster, check pin status, and fetch files via HTTP.

---

## Features

- **Multi-peer IPFS Cluster**: Three IPFS Cluster peers, each running their own IPFS node.
- **Pinning Service API**: Upload files, check pin status, and fetch files using a simple REST API.
- **Easy Local Development**: All services run locally using Docker Compose.
- **Easily Scalable**: To increase the number of peers, simply add another peer service in the `docker-compose.yml` file, following the pattern of the existing peers.

---

## Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd StoreChain/ipfs-pinning-service
```

### 2. Configure and Start the Cluster

#### a. Start Peer 1

```bash
docker-compose up -d ipfs_cluster_peer1
```

Wait for it to initialize. Then, get its Peer ID by checking the logs or by running:

```bash
docker exec -it ipfs_cluster_peer1 ipfs-cluster-ctl id
```

Look for a line like:

```
/ip4/127.0.0.1/tcp/9096/p2p/<peerid>
```

or

```
/ip4/0.0.0.0/tcp/9096/p2p/<peerid>
```

#### b. Update `docker-compose.yml` for Peer Connections

- Copy the Peer ID from Peer 1.
- In the environment variables for `ipfs_cluster_peer2` and `ipfs_cluster_peer3`, set `CLUSTER_PEER_ADDRESSES` to:
  ```
  /ip4/ipfs_cluster_peer1/tcp/9096/p2p/<peerid>
  ```
- Save the file.

#### c. Restart the Cluster

```bash
docker-compose down
docker-compose up -d
```

#### d. Update `service.json` for All Peers

For each peer (`cluster_data_peer1/service.json`, `cluster_data_peer2/service.json`, `cluster_data_peer3/service.json`):

- Edit all endpoints that use `127.0.0.1` and change them to `0.0.0.0` (for example, `http_listen_multiaddress`, `listen_multiaddress`, etc.).
- Save the files.

#### e. Restart the Cluster Again

```bash
docker-compose down
docker-compose up -d
```

---

## API Usage

### Upload a File

```bash
curl -X POST -F "file=@path/to/yourfile.txt" http://localhost:3000/upload
```

**Response:**

```json
{ "cid": "Qm..." }
```

---

### Check Pin Status

```bash
curl http://localhost:3000/status/<CID>
```

---

### Fetch a File

```bash
curl http://localhost:3000/fetch/<CID> -o outputfile
```

---

## How It Works

- **/upload**: Accepts a file, uploads it to the IPFS Cluster via the REST API, and returns the CID.
- **/status/:cid**: Checks the pin status of a CID in the cluster.
- **/fetch/:cid**: Fetches the file content from the IPFS node's HTTP API (`/api/v0/cat`).

---

## Customization

- To change the number of cluster peers, add another peer service in `docker-compose.yml` following the existing pattern.
- To expose additional ports or change API endpoints, update the respective Dockerfiles and configs.

---

## Troubleshooting

- **Ports already in use**: Make sure ports `3000`, `4001-4003`, `5001-5003`, `8080`, `8082`, `8083`, `9094-9099` are free.
- **File not found on fetch**: Ensure the file is pinned and available on the node mapped to `localhost:5001`.
- **Cluster REST API not accessible**: Confirm `CLUSTER_RESTAPI_HTTP_LISTEN_MULTIADDRESS` is set to `/ip4/0.0.0.0/tcp/9094` and the config is correct.
- **Peers not connecting**: Double-check the `CLUSTER_PEER_ADDRESSES` and peer IDs in your `docker-compose.yml`.

---

## Stopping and Cleaning Up

To stop all services:

```bash
docker-compose down
```

To remove all data (including pinned files and cluster state):

```bash
docker-compose down -v
```

---

## Credits

- [IPFS](https://ipfs.io/)
- [IPFS Cluster](https://ipfscluster.io/)