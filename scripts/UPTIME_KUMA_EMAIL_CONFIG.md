# Uptime Kuma Email Configuration - Ready to Use

## 📧 Gmail SMTP Settings (Pre-configured)

### Your Email Setup:
- **Sending From:** indianshahishere@gmail.com
- **Sending To:** jaddpi1@gmail.com
- **From Name:** jadapi

---

## 🚀 Quick Setup in Uptime Kuma

### Step 1: Access Uptime Kuma
Open: `http://your-vps-ip:7001`

### Step 2: Add Notification
1. Click **Settings** (gear icon, bottom left)
2. Click **Notifications** tab
3. Click **Setup Notification**
4. Select **SMTP (Email)**

### Step 3: Copy-Paste Configuration

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 COPY THESE SETTINGS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 4: Test & Apply
1. Click **Test** button
2. Check **jaddpi1@gmail.com** inbox
3. You should receive "Test message from Uptime Kuma"
4. Click **Save**
5. Toggle **"Apply on all existing monitors"** → ON
6. Click **Save** again

---

## 📋 Configuration Details

| Setting | Value |
|---------|-------|
| SMTP Host | smtp.gmail.com |
| Port | 587 |
| Security | TLS (STARTTLS) |
| Username | indianshahishere@gmail.com |
| Password | iispstgsnsrdauro |
| From | indianshahishere@gmail.com (jadapi) |
| To | jaddpi1@gmail.com |

---

## 🎯 What You'll Receive

### When Monitor Goes DOWN:
```
From: jadapi <indianshahishere@gmail.com>
To: jaddpi1@gmail.com
Subject: [Jadapi Alert] Jadapi - Health Check is DOWN

Monitor: Jadapi - Health Check
Status: DOWN
Time: 2025-10-20 05:45:00
Message: HTTP Error 503
URL: http://your-ip:4001/health
```

### When Monitor Comes UP:
```
From: jadapi <indianshahishere@gmail.com>
To: jaddpi1@gmail.com
Subject: [Jadapi Alert] Jadapi - Health Check is UP

Monitor: Jadapi - Health Check
Status: UP
Time: 2025-10-20 05:46:30
```

---

## ⚙️ Optional: Custom Email Template

In Uptime Kuma notification settings, you can customize:

**Subject Line:**
```
[Jadapi] {{MONITOR_NAME}} is {{STATUS}}
```

**Email Body:**
```
🚨 Jadapi Monitoring Alert

Monitor: {{MONITOR_NAME}}
Status: {{STATUS}}
Time: {{DATETIME}}
Duration: {{DURATION}}
Message: {{ERROR_MESSAGE}}
URL: {{MONITOR_URL}}

────────────────────────
Jadapi Monitoring System
```

---

## 📱 Add More Recipients (Optional)

To send to multiple emails, in the **To Email** field:

```
jaddpi1@gmail.com, another@email.com, team@company.com
```

---

## ✅ Quick Checklist

- [ ] Open Uptime Kuma (http://your-ip:7001)
- [ ] Go to Settings → Notifications
- [ ] Click Setup Notification → SMTP
- [ ] Paste settings from above
- [ ] Click Test
- [ ] Check jaddpi1@gmail.com inbox
- [ ] Click Save
- [ ] Enable "Apply on all existing monitors"
- [ ] Done! 🎉

---

## 🔧 Troubleshooting

### "Authentication Failed"
✅ The password is an App Password (16 chars) - looks good!

### "No Test Email Received"
1. Check spam folder in jaddpi1@gmail.com
2. Wait 1-2 minutes
3. Verify SMTP settings are exactly as shown

### "Connection Timeout"
- Verify port 587 is allowed through firewall
- Try changing Security to "SSL" with port 465

---

## 🎉 You're All Set!

Alerts will be sent:
- **FROM:** jadapi (indianshahishere@gmail.com)
- **TO:** jaddpi1@gmail.com

Whenever your monitors go down or come back up! 🚀

---

## 📝 Environment Variables (Already Set)

Your .env file already has:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=indianshahishere@gmail.com
SMTP_PASS=iispstgsnsrdauro
SMTP_FROM_NAME=jadapi
SMTP_FROM_EMAIL=indianshahishere@gmail.com
```

These are for your application. Uptime Kuma uses its own configuration (set via web UI as shown above).
