export function welcomeEmailHtml(name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're on the FitVerse waitlist</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
      background-color: #F5F5F7;
      color: #1D1D1F;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 560px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .header {
      background: #0A0A0A;
      padding: 40px 48px;
      text-align: center;
    }
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }
    .logo-icon {
      width: 36px;
      height: 36px;
      background: white;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: white;
      letter-spacing: -0.03em;
    }
    .body {
      padding: 48px;
    }
    .badge {
      display: inline-block;
      background: #F5F5F7;
      color: #6E6E73;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 6px 12px;
      border-radius: 100px;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1D1D1F;
      letter-spacing: -0.025em;
      line-height: 1.2;
      margin-bottom: 16px;
    }
    p {
      font-size: 15px;
      color: #6E6E73;
      line-height: 1.7;
      margin-bottom: 16px;
    }
    .highlight {
      color: #1D1D1F;
      font-weight: 500;
    }
    .divider {
      height: 1px;
      background: #F5F5F7;
      margin: 32px 0;
    }
    .features {
      display: grid;
      gap: 12px;
      margin-bottom: 32px;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: #F5F5F7;
      border-radius: 12px;
    }
    .feature-icon {
      font-size: 18px;
      flex-shrink: 0;
    }
    .feature-text {
      font-size: 14px;
      color: #1D1D1F;
      font-weight: 500;
      margin: 0;
    }
    .cta-section {
      text-align: center;
      padding: 32px;
      background: #0A0A0A;
      border-radius: 16px;
      margin-bottom: 32px;
    }
    .cta-text {
      color: white;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .cta-sub {
      color: rgba(255,255,255,0.5);
      font-size: 13px;
      margin: 0;
    }
    .footer {
      padding: 24px 48px;
      border-top: 1px solid #F5F5F7;
      text-align: center;
    }
    .footer p {
      font-size: 12px;
      color: #aeaeb2;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h3M13 10h3M10 4v3M10 13v3M6.5 6.5l2 2M11.5 11.5l2 2M11.5 6.5l-2 2M6.5 13.5l2-2" stroke="black" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="logo-text">FitVerse</span>
      </div>
    </div>

    <div class="body">
      <div class="badge">Waitlist Confirmed</div>
      <h1>Hey ${name}, you're in. 🎉</h1>
      <p>
        Welcome to the FitVerse waitlist. You're among the first to know when we launch — and we'll make sure it's worth the wait.
      </p>
      <p>
        We're building something that <span class="highlight">actually works</span> — an AI-powered fitness platform that connects your nutrition, workouts, and sleep into one intelligent system.
      </p>

      <div class="divider"></div>

      <p style="font-size: 13px; font-weight: 600; color: #1D1D1F; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.06em;">What's coming</p>
      <div class="features">
        <div class="feature-item">
          <span class="feature-icon">🤖</span>
          <p class="feature-text">AI Coach — adapts your plan in real time</p>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🥗</span>
          <p class="feature-text">Nutrition Tracker — 14M+ foods, Indian meals included</p>
        </div>
        <div class="feature-item">
          <span class="feature-icon">💪</span>
          <p class="feature-text">Workout Log — 5,000+ exercises, every rep tracked</p>
        </div>
        <div class="feature-item">
          <span class="feature-icon">😴</span>
          <p class="feature-text">Sleep Monitor — recovery is training too</p>
        </div>
      </div>

      <div class="cta-section">
        <p class="cta-text">We'll reach out the moment we launch.</p>
        <p class="cta-sub">No spam. Just the launch email when it's ready.</p>
      </div>

      <p style="font-size: 14px; color: #6E6E73;">
        — Team FitVerse
      </p>
    </div>

    <div class="footer">
      <p>© 2025 FitVerse · Made in India 🇮🇳</p>
      <p style="margin-top: 4px;">You received this because you joined our waitlist.</p>
    </div>
  </div>
</body>
</html>`;
}

export function welcomeEmailText(name: string): string {
  return `Hey ${name},

You're on the FitVerse waitlist. 🎉

We'll reach out the moment we launch. No spam — just the one email that matters.

What's coming:
- AI Coach — adapts your plan in real time
- Nutrition Tracker — 14M+ foods, Indian meals included  
- Workout Log — 5,000+ exercises, every rep tracked
- Sleep Monitor — recovery is training too

See you at launch.

— Team FitVerse

© 2025 FitVerse · Made in India`;
}
