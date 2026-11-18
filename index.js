const express = require('express');
const cors = require('cors');
const webpush = require('web-push');

const app = express();
app.use(cors());
app.use(express.json());

const publicVapidKey = 'BKGxjECshWcaJoLsu3yO6VN8kovWY2bjPEu8IlOrDyMd1zJ3yvqufPGLidGTkZEhJidb_q4PPzdXS63d9qIBG6I';
const privateVapidKey = 'pPMvhKh8ISBgXU0Bp3Mi3y2XhgwM7S11KYCZn9Z50sU';

webpush.setVapidDetails(
  'mailto:contacto@spacepulse.app',
  publicVapidKey,
  privateVapidKey
);

let subscriptions = [];

app.get('/', (req, res) => {
  res.send('Servidor Push SpacePulse activo - María José Bazán Águila (20233L001076)');
});

app.post('/api/subscribe', (req, res) => {
  const subscription = req.body;
  const exists = subscriptions.some(s => s.endpoint === subscription.endpoint);
  if (!exists) {
    subscriptions.push(subscription);
  }
  res.status(201).json({ message: 'Suscripción registrada' });
});

app.post('/api/notify', async (req, res) => {
  const { missionName, rocketName } = req.body;

  const payload = JSON.stringify({
    notification: {
      title: `🚀 Alerta de Despegue: ${missionName || 'Misión Orbital'}`,
      body: `Cohete ${rocketName || 'espacial'} listo | María José Bazán Águila - 20233L001076`,
      icon: 'icons/icon-192x192.png',
      vibrate: [200, 100, 200],
      data: { url: '/' }
    }
  });

  try {
    await Promise.all(
      subscriptions.map(sub => webpush.sendNotification(sub, payload))
    );
    res.status(200).json({ message: 'Notificación enviada' });
  } catch (error) {
    console.error('Error enviando push:', error);
    res.status(500).json({ error: 'Error al enviar notificación' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor Push corriendo en puerto ${PORT}`));