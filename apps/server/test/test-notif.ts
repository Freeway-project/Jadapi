// test-send-notif.js (run after building or with ts-node)
const { sendDriverNotification } = require('./dist/services/notificationService'); // built path
sendDriverNotification('68e30359156628e7d89a460c', { title: 'Test', body: 'Hello from server', url: '/driver' })
 .then(() => console.log('done'))
 .catch(console.error)