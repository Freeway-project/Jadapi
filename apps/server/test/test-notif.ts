// test-send-notif.ts — dev helper
// If you set TEST_FCM_TOKEN in env, this will send directly to that token (no DB required).
const svc = require('../dist/services/notificationService');

const TEST_TOKEN = "e1guP4aeDkcdGy6gtj3cSI:APA91bG8L7lfMLh7nqrrmoZzjygSK51L_yeylVXT4YTs95060UoIiYn-j06WJIN55zO0gQpTewZWh4QDh32aC3unqDaCYN93eWnhmQrAACSXkC31aszcj2M";

if (TEST_TOKEN) {
	svc.sendNotificationToToken(TEST_TOKEN, { title: 'Test', body: 'Hello from server', url: '/driver' })
		.then(() => console.log('done'))
		.catch(console.error);
} else {
	// fallback: try sending using a user/driver id (requires DB)
	const { sendDriverNotification } = svc;
	sendDriverNotification('69056bc33df80483bef5edf4', { title: 'Test', body: 'Hello from server', url: '/driver' })
		.then(() => console.log('done'))
		.catch(console.error);
}