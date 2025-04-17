const { fetch: undiciFetch } = require('undici');

// Override global fetch so that any request with a body
// automatically gets duplex: 'half'
globalThis.fetch = (url, init = {}) => {
  if (init.body) {
    init.duplex = 'half';
  }
  return undiciFetch(url, init);
};

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { create } = require('ipfs-http-client');

const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });
const ipfs = create({ url: 'http://ipfs:5001' });

app.post('/upload', upload.single('file'), async (req, res) => {
  const file = fs.readFileSync(req.file.path);
  const result = await ipfs.add(file);
  res.json({ cid: result.cid.toString() });
});

app.get('/fetch/:cid', async (req, res) => {
  const chunks = [];
  for await (const chunk of ipfs.cat(req.params.cid)) {
    chunks.push(chunk);
  }
  res.send(Buffer.concat(chunks));
});

app.listen(port, () => {
  console.log(`🚀 IPFS Pinning Service running at http://localhost:${port}`);
});

