const express = require('express');
const router = express.Router();
const ytdl = require('@distube/ytdl-core');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Set HTTPS_PROXY env var on your host if you need to route through a proxy.
// ytdl-core will pick it up automatically via the 'requestOptions' agent.

router.post('/fetch-info', async (req, res) => {
  const { url } = req.body;
  if (!url || !ytdl.validateURL(url)) return res.status(400).json({ error: 'Invalid URL' });
  try {
    const info = await ytdl.getInfo(url);
    res.json({
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails.slice(-1)[0]?.url,
      duration: info.videoDetails.lengthSeconds,
      id: info.videoDetails.videoId,
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch info', detail: e.message });
  }
});

router.post('/download', async (req, res) => {
  const { url, format } = req.body;
  if (!url || !ytdl.validateURL(url)) return res.status(400).json({ error: 'Invalid URL' });

  const id = Date.now();
  const tmpDir = os.tmpdir();
  const rawPath = path.join(tmpDir, `${id}_raw.mp4`);
  const outPath = path.join(tmpDir, `${id}.${format}`);

  try {
    const stream = ytdl(url, { quality: format === 'mp3' ? 'highestaudio' : 'highest' });
    const writeStream = fs.createWriteStream(rawPath);
    stream.pipe(writeStream);

    writeStream.on('finish', () => {
      const cmd = format === 'mp3'
        ? `ffmpeg -i "${rawPath}" -vn -ab 192k -ar 44100 -y "${outPath}"`
        : `ffmpeg -i "${rawPath}" -c:v libx264 -c:a aac -y "${outPath}"`;

      exec(cmd, (err) => {
        fs.unlink(rawPath, () => {});
        if (err) return res.status(500).json({ error: 'Conversion failed', detail: err.message });
        res.download(outPath, () => fs.unlink(outPath, () => {}));
      });
    });

    writeStream.on('error', (err) => res.status(500).json({ error: 'Download stream failed', detail: err.message }));
  } catch (e) {
    res.status(500).json({ error: 'Download failed', detail: e.message });
  }
});

module.exports = router;
