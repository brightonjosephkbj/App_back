const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Requires a YouTube Data API v3 key: https://console.cloud.google.com
const YT_API_KEY = process.env.YOUTUBE_API_KEY;
// Requires a SoundCloud API client id (register at developers.soundcloud.com)
const SC_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;

router.get('/youtube', async (req, res) => {
  const q = req.query.q;
  try {
    const endpoint = q
      ? `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=20&key=${YT_API_KEY}`
      : `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=20&key=${YT_API_KEY}`;

    const r = await fetch(endpoint);
    const data = await r.json();
    const items = (data.items || []).map((v) => ({
      id: v.id.videoId || v.id,
      title: v.snippet.title,
      channel: v.snippet.channelTitle,
      thumbnail: v.snippet.thumbnails?.medium?.url,
      url: `https://youtube.com/watch?v=${v.id.videoId || v.id}`,
    }));
    res.json({ items });
  } catch (e) {
    res.status(500).json({ error: 'YouTube fetch failed', detail: e.message });
  }
});

router.get('/soundcloud', async (req, res) => {
  const q = req.query.q || 'trending';
  try {
    const r = await fetch(`https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(q)}&client_id=${SC_CLIENT_ID}&limit=20`);
    const data = await r.json();
    const items = (data.collection || []).map((t) => ({
      id: String(t.id),
      title: t.title,
      user: t.user?.username,
      artwork: t.artwork_url,
      permalink: t.permalink_url,
    }));
    res.json({ items });
  } catch (e) {
    res.status(500).json({ error: 'SoundCloud fetch failed', detail: e.message });
  }
});

module.exports = router;
