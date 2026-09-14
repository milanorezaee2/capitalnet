/**
 * این اسکریپت Email Confirmation را در Supabase غیرفعال می‌کند
 * اجرا: node scripts/fix-supabase-email-confirm.cjs YOUR_ACCESS_TOKEN
 *
 * برای گرفتن Access Token:
 * 1. به https://supabase.com/dashboard/account/tokens بروید
 * 2. یک token جدید بسازید
 * 3. دستور زیر را اجرا کنید:
 *    node scripts/fix-supabase-email-confirm.cjs <token>
 */

const https = require('https');

const PROJECT_REF = 'qfslyvnfnfatqzmchsqx';
const token = process.argv[2];

if (!token) {
  console.error('❌ لطفاً Access Token را وارد کنید:');
  console.error('   node scripts/fix-supabase-email-confirm.cjs YOUR_TOKEN');
  console.error('\n📌 برای گرفتن token:');
  console.error('   https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

const body = JSON.stringify({ mailer_autoconfirm: true });

const options = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${PROJECT_REF}/config/auth`,
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
};

console.log('🔧 در حال غیرفعال کردن Email Confirmation...');

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      const result = JSON.parse(data);
      if (result.mailer_autoconfirm === true) {
        console.log('✅ Email Confirmation با موفقیت غیرفعال شد!');
        console.log('   کاربران از این به بعد بدون نیاز به تأیید ایمیل می‌توانند وارد شوند.');
      } else {
        console.log('⚠️  پاسخ:', data);
      }
    } else if (res.statusCode === 401) {
      console.error('❌ Token نامعتبر است. لطفاً یک token جدید بسازید.');
    } else if (res.statusCode === 403) {
      console.error('❌ دسترسی رد شد. مطمئن شوید Owner یا Admin پروژه هستید.');
    } else {
      console.error(`❌ خطا (${res.statusCode}):`, data);
    }
  });
});

req.on('error', (e) => console.error('❌ خطای شبکه:', e.message));
req.write(body);
req.end();
