const express = require('express');
const multer = require('multer');
const fs = require('fs');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const port = 3000;

const CLUSTER_API = 'http://localhost:9094';
const NODE_API = 'http://localhost:5001';

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), async (req, res) => {
  const form = new FormData();
  form.append('file', fs.createReadStream(req.file.path), req.file.originalname);

  try {
    const response = await fetch(`${CLUSTER_API}/add`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    const text = await response.text();
    if (!response.ok) {
      return res.status(response.status).send(text);
    }

    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      return res.status(500).send('Invalid JSON response from cluster: ' + text);
    }

    res.json({ cid: result.cid });
  } catch (err) {
    res.status(500).send('Error uploading file: ' + err.message);
  }
});

app.get('/status/:cid', async (req, res) => {
  try {
    const response = await fetch(`${CLUSTER_API}/pins/${req.params.cid}`);
    const text = await response.text();
    if (!response.ok) {
      return res.status(response.status).send(text);
    }
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      return res.status(500).send('Invalid JSON response from cluster: ' + text);
    }
    res.json(result);
  } catch (err) {
    res.status(500).send('Error fetching status: ' + err.message);
  }
});

app.get('/fetch/:cid', async (req, res) => {
  try {
    // Use the IPFS HTTP API (cat) to fetch file content
    const apiUrl = `${NODE_API}/api/v0/cat?arg=${req.params.cid}`;
    const response = await fetch(apiUrl, { method: 'POST' });

    if (!response.ok) {
      return res.status(response.status).send('Failed to fetch file from IPFS API');
    }

    res.set('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    response.body.pipe(res);
  } catch (err) {
    res.status(500).send('Error fetching file: ' + err.message);
  }
});

app.listen(port, () => {
  console.log(`🚀 IPFS Cluster Pinning Service running at http://localhost:${port}`);
});

