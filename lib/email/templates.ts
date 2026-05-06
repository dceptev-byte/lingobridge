const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lingobridge.chillfivillage.com'

const BASE_STYLE = `
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background: #f8fafc;
  margin: 0;
  padding: 0;
`

const CARD_STYLE = `
  max-width: 480px;
  margin: 40px auto;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
`

const HEADER_STYLE = `
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  padding: 36px 32px 28px;
  text-align: center;
`

const BODY_STYLE = `
  padding: 32px;
  color: #334155;
  line-height: 1.6;
`

const BTN_STYLE = `
  display: inline-block;
  background: #4f46e5;
  color: #ffffff !important;
  text-decoration: none;
  font-weight: 700;
  font-size: 16px;
  padding: 14px 32px;
  border-radius: 12px;
  margin-top: 24px;
`

const FOOTER_STYLE = `
  text-align: center;
  padding: 20px 32px;
  font-size: 12px;
  color: #94a3b8;
  border-top: 1px solid #f1f5f9;
`

// ── Welcome email ─────────────────────────────────────────────────────────────

interface WelcomeData {
  displayName: string | null
  email: string
  nativeLang: 'VI' | 'HI' | 'EN'
}

export function welcomeEmail(data: WelcomeData): { subject: string; html: string } {
  const isVi = data.nativeLang === 'VI'
  const name = data.displayName ?? data.email.split('@')[0]

  const subject = isVi
    ? `Chào mừng đến Lingobridge, ${name}! 🌉`
    : `Lingobridge में आपका स्वागत है, ${name}! 🌉`

  const headline = isVi ? 'Chào mừng đến Lingobridge!' : 'Lingobridge में आपका स्वागत है!'
  const tagline  = isVi ? 'Kết nối ngôn ngữ, kết nối văn hóa.' : 'भाषाओं को जोड़ो, संस्कृतियों को जोड़ो।'

  const p1 = isVi
    ? `Xin chào <strong>${name}</strong>, chúng tôi rất vui khi bạn tham gia! Hành trình học tiếng Hindi của bạn bắt đầu từ hôm nay.`
    : `नमस्ते <strong>${name}</strong>, आपका स्वागत है! आज से आपकी वियतनामी भाषा सीखने की यात्रा शुरू होती है।`

  const p2 = isVi
    ? 'Mỗi ngày chỉ cần <strong>5–10 phút</strong> luyện tập là đủ để xây dựng chuỗi ngày học và tiến bộ đều đặn.'
    : 'हर दिन सिर्फ <strong>5–10 मिनट</strong> अभ्यास से आप लगातार प्रगति कर सकते हैं।'

  const btnText = isVi ? 'Bắt đầu học ngay →' : 'अभी सीखना शुरू करें →'
  const footer  = isVi ? 'Bạn nhận được email này vì đã đăng ký tài khoản Lingobridge.' : 'आपने Lingobridge अकाउंट बनाया इसलिए यह ईमेल मिला।'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${BASE_STYLE}">
  <div style="${CARD_STYLE}">
    <div style="${HEADER_STYLE}">
      <div style="font-size:40px;margin-bottom:8px;">🌉</div>
      <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:0 0 4px;">${headline}</h1>
      <p style="color:#c7d2fe;font-size:14px;margin:0;">${tagline}</p>
    </div>
    <div style="${BODY_STYLE}">
      <p style="font-size:16px;margin:0 0 16px;">${p1}</p>
      <p style="font-size:15px;margin:0 0 8px;">${p2}</p>
      <div style="text-align:center;">
        <a href="${APP_URL}/home" style="${BTN_STYLE}">${btnText}</a>
      </div>
    </div>
    <div style="${FOOTER_STYLE}">${footer}</div>
  </div>
</body>
</html>`

  return { subject, html }
}

// ── Streak reminder email ─────────────────────────────────────────────────────

interface StreakReminderData {
  displayName: string | null
  email: string
  streakCurrent: number
  nativeLang: 'VI' | 'HI' | 'EN'
}

export function streakReminderEmail(data: StreakReminderData): { subject: string; html: string } {
  const isVi = data.nativeLang === 'VI'
  const name = data.displayName ?? data.email.split('@')[0]
  const streak = data.streakCurrent

  const subject = isVi
    ? `🔥 ${streak} ngày streak — đừng để mất, ${name}!`
    : `🔥 ${streak} दिन की स्ट्रीक — इसे बचाएं, ${name}!`

  const headline = isVi
    ? `Chuỗi ${streak} ngày của bạn đang chờ!`
    : `आपकी ${streak} दिन की स्ट्रीक इंतज़ार कर रही है!`

  const p1 = isVi
    ? `Này <strong>${name}</strong>, bạn chưa học hôm nay. Chỉ cần <strong>một bài học ngắn</strong> để giữ chuỗi <strong>${streak} ngày</strong> của bạn!`
    : `नमस्ते <strong>${name}</strong>, आपने आज अभी तक नहीं पढ़ा। अपनी <strong>${streak} दिन</strong> की स्ट्रीक बचाने के लिए बस <strong>एक छोटा पाठ</strong> पूरा करें!`

  const urgency = isVi
    ? '⏰ Chuỗi ngày sẽ đặt lại vào nửa đêm. Hãy học ngay!'
    : '⏰ स्ट्रीक आधी रात को रीसेट होगी। अभी पढ़ें!'

  const btnText = isVi ? `Giữ chuỗi ${streak} ngày →` : `${streak} दिन की स्ट्रीक बचाएं →`
  const footer  = isVi ? 'Bạn có thể hủy đăng ký nhận nhắc nhở tại trang hồ sơ.' : 'प्रोफ़ाइल पेज से रिमाइंडर अनसब्सक्राइब करें।'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${BASE_STYLE}">
  <div style="${CARD_STYLE}">
    <div style="background:linear-gradient(135deg,#f59e0b 0%,#ef4444 100%);padding:36px 32px 28px;text-align:center;">
      <div style="font-size:48px;margin-bottom:8px;">🔥</div>
      <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0;">${headline}</h1>
    </div>
    <div style="${BODY_STYLE}">
      <p style="font-size:16px;margin:0 0 16px;">${p1}</p>
      <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:12px;padding:14px 18px;margin-bottom:8px;">
        <p style="margin:0;font-size:14px;color:#92400e;">${urgency}</p>
      </div>
      <div style="text-align:center;">
        <a href="${APP_URL}/home" style="${BTN_STYLE};background:#f59e0b;">${btnText}</a>
      </div>
    </div>
    <div style="${FOOTER_STYLE}">${footer}</div>
  </div>
</body>
</html>`

  return { subject, html }
}
