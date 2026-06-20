const express = require('express');
const cors = require('cors');

const downloadRoutes = require('./routes/download');
const discoverRoutes = require('./routes/discover');
const chatRoutes = require('./routes/chat');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', downloadRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => res.send('Beats backend is running.'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Beats backend listening on ${PORT}`));
