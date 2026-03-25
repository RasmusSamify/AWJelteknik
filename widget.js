(function () {
  if (document.getElementById('awj-widget-container')) return;

  // ═══════════════════════════════════════════════════════════════
  //  ⚙️  KONFIGURATION — Byt ut dessa värden
  // ═══════════════════════════════════════════════════════════════
  var ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/XXXXX/XXXXX/';
  var CALENDLY_URL       = 'https://calendly.com/awj-elteknik';
  var ZAPIER_CHATBOT_ID  = 'LÄGG_IN_DITT_ZAPIER_CHATBOT_ID_HÄR';
  // ═══════════════════════════════════════════════════════════════

  // Load Zapier chatbot
  var zapierScript = document.createElement('script');
  zapierScript.type = 'module';
  zapierScript.src = 'https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js';
  document.head.appendChild(zapierScript);

  // Load fonts
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
  document.head.appendChild(link);

  // ═══════════════════════════════════════════════════════════════
  //  🎨 CSS — VIT/CLEAN DESIGN
  // ═══════════════════════════════════════════════════════════════
  var style = document.createElement('style');
  style.textContent = `
    #awj-widget-container * { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important; 
      box-sizing: border-box; 
    }

    #awj-launcher {
      position: fixed; bottom: 24px; right: 24px;
      width: 64px; height: 64px; border-radius: 50%;
      background: #fff; border: 2px solid #e5e5e5; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 9999;
    }
    #awj-launcher:hover { 
      transform: translateY(-3px); 
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      border-color: #000;
    }
    #awj-launcher.open .awj-chat { display: none; }
    #awj-launcher.open .awj-close { display: block !important; }

    #awj-widget {
      position: fixed; bottom: 100px; right: 24px;
      width: 400px; height: 640px; border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
      background: #fff; display: flex; flex-direction: column; overflow: hidden;
      transform: scale(0.92) translateY(16px); opacity: 0; pointer-events: none;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); z-index: 9998;
    }
    #awj-widget.visible { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }
    #awj-widget.expanded { width: 480px; height: 720px; bottom: 24px; }
    @media (max-width: 580px) {
      #awj-widget { width: calc(100vw - 16px); right: 8px; }
      #awj-widget.expanded { width: calc(100vw - 16px); height: calc(100dvh - 100px); }
    }

    .awj-header { 
      background: #fff; padding: 18px 20px; display: flex; align-items: center; 
      justify-content: space-between; flex-shrink: 0; border-bottom: 1px solid #f0f0f0;
    }
    .awj-header-left { display: flex; align-items: center; }
    .awj-back { 
      background: #f8f8f8; border: 1px solid #e5e5e5; cursor: pointer; 
      width: 32px; height: 32px; border-radius: 50%; display: none; 
      align-items: center; justify-content: center; color: #1a1a1a; 
      font-size: 18px; transition: all 0.2s; flex-shrink: 0; margin-right: 12px; font-weight: 600;
    }
    .awj-back.show { display: flex; }
    .awj-back:hover { background: #000; color: #fff; border-color: #000; }
    .awj-logo { display: flex; align-items: center; gap: 10px; }
    .awj-logo-img { height: 28px; width: auto; }
    .awj-divider { width: 1px; height: 28px; background: #e5e5e5; margin: 0 14px; }
    .awj-header-sub { display: flex; flex-direction: column; }
    .awj-title { 
      font-size: 10px; font-weight: 700; color: #666; 
      letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 3px;
    }
    .awj-status { display: flex; align-items: center; gap: 5px; }
    .awj-dot { 
      width: 6px; height: 6px; border-radius: 50%; background: #10b981;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .awj-status-text { 
      font-size: 9px; font-weight: 600; color: #10b981; 
      letter-spacing: 0.08em; text-transform: uppercase;
    }

    .awj-progress { height: 3px; background: #f0f0f0; flex-shrink: 0; }
    .awj-progress-fill { height: 100%; background: #000; transition: width 0.4s ease; }

    .awj-content { flex: 1; overflow: hidden; position: relative; }
    .awj-screen { 
      position: absolute; top: 0; right: 0; bottom: 0; left: 0; 
      overflow-y: auto; -webkit-overflow-scrolling: touch; background: #fafafa; 
      display: none; flex-direction: column;
    }
    .awj-screen.active { display: flex; }
    .awj-screen.slide-in { animation: slideIn 0.3s ease; }
    .awj-screen.slide-back { animation: slideBack 0.25s ease; }
    @keyframes slideIn { from { opacity: 0; transform: translateX(30px); } }
    @keyframes slideBack { from { opacity: 0; transform: translateX(-30px); } }

    .home-body { padding: 20px; }
    .home-greeting { 
      font-size: 13.5px; font-weight: 500; color: #1a1a1a; line-height: 1.65; 
      margin-bottom: 18px; background: #fff; border-radius: 14px; 
      padding: 16px 18px; border: 1px solid #e5e5e5;
    }
    .home-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .home-card { 
      background: #fff; border: 1.5px solid #e5e5e5; border-radius: 14px; 
      padding: 18px 16px; display: flex; flex-direction: column; align-items: center; 
      gap: 10px; cursor: pointer; text-align: center; 
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .home-card:hover { 
      border-color: #000; transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.08);
    }
    .home-card.wide { 
      grid-column: span 2; flex-direction: row; justify-content: flex-start; 
      gap: 16px; padding: 18px 20px; text-align: left; background: #000; border-color: #000;
    }
    .home-card.wide:hover { background: #1a1a1a; box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
    .home-card.wide .card-label { color: #fff; }
    .home-card.wide .card-sub { color: rgba(255,255,255,0.6); }
    .card-icon-wrap { 
      width: 46px; height: 46px; border-radius: 14px; background: #fafafa; 
      display: flex; align-items: center; justify-content: center;
      border: 1px solid #e5e5e5; flex-shrink: 0;
    }
    .home-card.wide .card-icon-wrap { 
      background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.15);
    }
    .card-icon { font-size: 24px; }
    .card-label { font-size: 13px; font-weight: 700; color: #000; }
    .card-sub { font-size: 11.5px; color: #666; font-weight: 500; }
    .wide-arrow { margin-left: auto; color: rgba(255,255,255,0.4); font-size: 24px; }

    .home-card.rot-card { background: #10b981; border-color: #10b981; }
    .home-card.rot-card:hover { background: #059669; }
    .home-card.rot-card .card-label { color: #fff; }
    .home-card.rot-card .card-sub { color: rgba(255,255,255,0.8); }
    .home-card.rot-card .card-icon-wrap { 
      background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.25);
    }
    .home-card.rot-card .wide-arrow { color: rgba(255,255,255,0.5); }

    .inner-body { padding: 20px; flex: 1; }
    .inner-title { font-size: 15px; font-weight: 800; color: #000; margin-bottom: 6px; }
    .inner-sub { font-size: 12.5px; color: #666; margin-bottom: 18px; line-height: 1.5; }

    .step-indicator { display: flex; gap: 8px; align-items: center; margin-bottom: 20px; }
    .step-dot { width: 8px; height: 8px; border-radius: 50%; background: #e5e5e5; transition: all 0.3s; }
    .step-dot.done { background: #10b981; }
    .step-dot.active { background: #000; transform: scale(1.5); }
    .step-label { font-size: 10.5px; color: #666; margin-left: 6px; font-weight: 700; text-transform: uppercase; }

    .chip-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
    .chip { 
      background: #fff; border: 1.5px solid #e5e5e5; border-radius: 14px; 
      padding: 14px 12px; text-align: center; cursor: pointer; 
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .chip:hover { border-color: #000; background: #fafafa; transform: translateY(-2px); }
    .chip.selected { border-color: #000; background: #000; }
    .chip.selected .chip-label { color: #fff; }
    .chip.selected .chip-sub { color: rgba(255,255,255,0.7); }
    .chip-icon { font-size: 24px; margin-bottom: 8px; }
    .chip-label { font-size: 12px; font-weight: 700; color: #000; }
    .chip-sub { font-size: 10.5px; color: #666; margin-top: 3px; }

    .section-label { 
      font-size: 11px; font-weight: 800; color: #666; 
      text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;
    }

    .awj-input-wrap { position: relative; margin-bottom: 16px; }
    .awj-input-wrap svg { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); }
    .awj-input { 
      width: 100%; padding: 14px 18px 14px 46px; border: 1.5px solid #e5e5e5; 
      border-radius: 14px; font-size: 13.5px; color: #000; background: #fff; 
      outline: none; transition: all 0.2s;
    }
    .awj-input:focus { border-color: #000; box-shadow: 0 0 0 3px rgba(0,0,0,0.05); }
    .awj-input::placeholder { color: #999; }

    .rot-field { 
      background: #fff; border: 1.5px solid #e5e5e5; border-radius: 14px; 
      padding: 16px 18px; margin-bottom: 14px; transition: all 0.2s;
    }
    .rot-field:focus-within { border-color: #000; box-shadow: 0 0 0 3px rgba(0,0,0,0.05); }
    .rot-field-label { 
      font-size: 11.5px; font-weight: 700; color: #1a1a1a; 
      margin-bottom: 10px; display: flex; justify-content: space-between;
    }
    .rot-field-label span { color: #666; }
    .rot-slider { 
      width: 100%; height: 6px; background: #e5e5e5; 
      border-radius: 3px; outline: none; -webkit-appearance: none;
    }
    .rot-slider::-webkit-slider-thumb { 
      -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; 
      background: #000; cursor: pointer; border: 3px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .rot-slider::-moz-range-thumb { 
      width: 22px; height: 22px; border-radius: 50%; background: #000; 
      border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .rot-result-box { 
      background: #000; border-radius: 16px; padding: 20px; 
      margin: 18px 0; text-align: center;
    }
    .rot-result-label { 
      font-size: 11.5px; color: rgba(255,255,255,0.6); 
      margin-bottom: 10px; font-weight: 700; text-transform: uppercase;
    }
    .rot-result-amount { font-size: 36px; font-weight: 800; color: #fff; }
    .rot-result-sub { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 8px; }
    .rot-breakdown { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px; }
    .rot-stat { background: #fff; border-radius: 12px; padding: 14px 16px; border: 1px solid #e5e5e5; }
    .rot-stat-label { font-size: 10.5px; color: #666; font-weight: 700; text-transform: uppercase; }
    .rot-stat-val { font-size: 18px; font-weight: 800; color: #000; margin-top: 5px; }

    .awj-btn { 
      display: block; width: 100%; padding: 15px; border: none; border-radius: 14px; 
      font-size: 14px; font-weight: 800; cursor: pointer; text-align: center; 
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .awj-btn:hover { transform: translateY(-2px); }
    .awj-btn-primary { background: #000; color: #fff; }
    .awj-btn-primary:hover { background: #1a1a1a; box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
    .awj-btn-gold { background: #10b981; color: #fff; }
    .awj-btn-gold:hover { background: #059669; box-shadow: 0 8px 20px rgba(16,185,129,0.25); }
    .awj-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .case-card { background: #fff; border: 1px solid #e5e5e5; border-radius: 12px; margin-bottom: 12px; }
    .case-header { padding: 16px; display: flex; align-items: center; gap: 12px; }
    .case-badge { 
      width: 42px; height: 42px; border-radius: 12px; background: #fafafa; 
      border: 1px solid #e5e5e5; display: flex; align-items: center; 
      justify-content: center; font-size: 20px;
    }
    .case-title { font-size: 13px; font-weight: 800; color: #000; }
    .case-industry { font-size: 11px; color: #666; margin-top: 2px; }
    .case-steps { padding: 0 16px 16px; }
    .case-step { display: flex; padding: 8px 0; border-top: 1px solid #f0f0f0; }
    .case-step:first-child { border-top: none; }
    .case-arrow { color: #000; margin-right: 12px; font-weight: 600; }
    .case-step-text { font-size: 12px; color: #1a1a1a; line-height: 1.5; }
    .case-result { 
      display: flex; align-items: center; background: #f0fdf4; 
      border-radius: 10px; padding: 10px 14px; margin: 0 16px 16px;
    }
    .case-result-icon { margin-right: 10px; }
    .case-result-text { font-size: 11.5px; font-weight: 700; color: #166534; }

    .lead-summary { 
      display: flex; align-items: center; gap: 12px; background: #fff; 
      border: 1px solid #e5e5e5; border-radius: 12px; padding: 12px 14px; margin-bottom: 16px;
    }
    .lead-summary-chips { display: flex; gap: 7px; flex-wrap: wrap; flex: 1; }
    .lead-chip { 
      background: #fafafa; border: 1px solid #e5e5e5; border-radius: 20px; 
      padding: 5px 12px; font-size: 10.5px; font-weight: 700; color: #000;
    }
    .lead-edit { font-size: 11px; color: #000; cursor: pointer; font-weight: 700; white-space: nowrap; }
    .lead-edit:hover { opacity: 0.6; }

    .faq-item { border: 1px solid #e5e5e5; border-radius: 12px; margin-bottom: 10px; background: #fff; }
    .faq-q { 
      width: 100%; text-align: left; background: none; border: none; 
      padding: 14px 16px; cursor: pointer; display: flex; align-items: center; 
      justify-content: space-between; font-size: 13px; font-weight: 700; 
      color: #000; gap: 12px;
    }
    .faq-q:hover { background: #fafafa; }
    .faq-chevron { transition: transform 0.2s; color: #666; }
    .faq-item.open .faq-chevron { transform: rotate(180deg); }
    .faq-a { 
      display: none; padding: 0 16px 14px; font-size: 12px; 
      color: #1a1a1a; line-height: 1.65; border-top: 1px solid #f0f0f0; padding-top: 12px;
    }
    .faq-item.open .faq-a { display: block; }

    .price-toggle { display: flex; background: #f0f0f0; border-radius: 10px; padding: 4px; margin-bottom: 16px; }
    .price-toggle-btn { 
      flex: 1; padding: 8px; border: none; background: transparent; 
      border-radius: 8px; font-size: 12px; font-weight: 700; color: #666; cursor: pointer;
    }
    .price-toggle-btn.active { background: #000; color: #fff; }
    .price-set { display: none; }
    .price-set.active { display: block; }
    .price-card { background: #fff; border: 1px solid #e5e5e5; border-radius: 14px; padding: 16px; margin-bottom: 12px; }
    .price-card.featured { border-color: #000; border-width: 2px; }
    .price-badge { 
      display: inline-block; font-size: 9.5px; font-weight: 800; 
      background: #000; color: #fff; padding: 4px 10px; border-radius: 20px; margin-bottom: 10px;
    }
    .price-tier { font-size: 10px; font-weight: 800; color: #666; text-transform: uppercase; margin-bottom: 3px; }
    .price-name { font-size: 17px; font-weight: 800; color: #000; margin-bottom: 8px; }
    .price-amount { font-size: 20px; font-weight: 800; color: #000; }
    .price-amount span { font-size: 12px; font-weight: 500; color: #666; }
    .price-features { margin-top: 12px; display: flex; flex-direction: column; gap: 6px; }
    .price-feature { 
      font-size: 12px; color: #1a1a1a; display: flex; 
      align-items: flex-start; gap: 8px; line-height: 1.5;
    }
    .price-feature::before { content: '⚡'; font-size: 12px; }
    .price-cta { 
      display: block; width: 100%; margin-top: 14px; padding: 12px; 
      background: #000; color: #fff; border: none; border-radius: 10px; 
      font-size: 13px; font-weight: 800; cursor: pointer; text-align: center;
    }
    .price-cta:hover { background: #1a1a1a; }
    .price-card.featured .price-cta { background: #10b981; }
    .price-card.featured .price-cta:hover { background: #059669; }

    .contact-card { background: #fff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 16px; margin-bottom: 10px; }
    .contact-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .contact-av { 
      width: 42px; height: 42px; border-radius: 50%; background: #000; 
      display: flex; align-items: center; justify-content: center; 
      font-size: 16px; font-weight: 800; color: #fff;
    }
    .contact-name { font-size: 14px; font-weight: 800; color: #000; }
    .contact-role { font-size: 11px; color: #666; }
    .contact-links { display: flex; flex-direction: column; gap: 5px; }
    .contact-link { 
      display: flex; align-items: center; gap: 10px; font-size: 12.5px; 
      color: #1a1a1a; text-decoration: none; padding: 9px 10px; border-radius: 8px;
    }
    .contact-link:hover { background: #fafafa; }

    #awj-nudge-banner { 
      display: none; background: #000; border-radius: 12px; padding: 12px 14px; 
      margin: 0 0 12px; align-items: center; justify-content: space-between;
    }
    #awj-nudge-banner.show { display: flex; }
    .nudge-banner-text { font-size: 11.5px; color: #fff; font-weight: 600; line-height: 1.5; flex: 1; }
    .nudge-banner-btn { 
      background: #10b981; border: none; border-radius: 8px; padding: 7px 13px; 
      font-size: 11px; font-weight: 800; color: #fff; cursor: pointer; margin-left: 12px;
    }
    .nudge-banner-x { 
      color: rgba(255,255,255,0.4); font-size: 15px; cursor: pointer; 
      margin-left: 10px; background: none; border: none;
    }
    .nudge-banner-x:hover { color: #fff; }

    #awj-tooltip { 
      position: fixed; bottom: 100px; right: 24px; background: #000; color: #fff; 
      padding: 16px 20px 16px 16px; border-radius: 16px 16px 4px 16px; 
      font-size: 14px; font-weight: 600; line-height: 1.6; max-width: 280px; 
      cursor: pointer; box-shadow: 0 6px 24px rgba(0,0,0,0.2); opacity: 0; 
      transform: translateY(10px); transition: all 0.3s; z-index: 9999;
    }
    #awj-tooltip.show { opacity: 1; transform: translateY(0); }
    #awj-tooltip::after { 
      content: ''; position: absolute; bottom: -8px; right: 22px; 
      border-left: 8px solid transparent; border-right: 8px solid transparent; 
      border-top: 8px solid #000;
    }
    #awj-tooltip-close { 
      position: absolute; top: 8px; right: 10px; background: none; 
      border: none; color: rgba(255,255,255,0.4); cursor: pointer; font-size: 14px;
    }
    #awj-tooltip-close:hover { color: #fff; }

    .awj-footer { 
      padding: 12px 16px; border-top: 1px solid #e5e5e5; 
      display: flex; align-items: center; justify-content: center; background: #fff;
    }
    .awj-footer a { 
      font-size: 11px; color: #666; text-decoration: none; 
      display: flex; align-items: center; gap: 6px; font-weight: 600;
    }
    .awj-footer a:hover { opacity: 0.6; }
    .awj-pdot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; }

    .send-state { 
      display: flex; align-items: center; justify-content: center; 
      gap: 10px; padding: 12px; font-size: 12.5px; font-weight: 700; color: #10b981;
    }
    .send-spinner { 
      width: 16px; height: 16px; border-radius: 50%; 
      border: 2px solid rgba(16,185,129,0.3); border-top-color: #10b981; 
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);

  // ═══════════════════════════════════════════════════════════════
  //  📊 SERVICE DATA
  // ═══════════════════════════════════════════════════════════════
  var serviceData = {
    belysning: {
      label: 'Belysning & Ljusdesign', icon: '💡',
      cases: [{
        title: 'Smart hembelysning',
        steps: ['Kartläggning av befintlig belysning','Design av ljusplan med LED-lösningar','Installation av smarta switchar & dimmer','Integrering med app-styrning'],
        result: 'Sparar upp till 60% el + kontroll via mobil'
      }, {
        title: 'Fastighetsutemiljö',
        steps: ['Utvändig belysning för BRF/fastighet','Säkerhetsbelysning med rörelsesensorer','Landskap & trädgårdsbelysning','Tidsstyrning & energioptimering'],
        result: 'Ökad trygghet & 40% lägre driftskostnad'
      }]
    },
    smarta_hem: {
      label: 'Smarta Hem', icon: '🏠',
      cases: [{
        title: 'Heltäckande smart home-system',
        steps: ['Centraliserad styrning av belysning, värme & larm','Röststyrning via Google Home / Alexa','Automationer: morgonrutin, bortaläge','Energiövervakning & statistik'],
        result: 'Sparar 15-20% energi + maximal bekvämlighet'
      }, {
        title: 'ROT-smart paket',
        steps: ['Installation av smarta uttag & switchar','WiFi-förstärkning & nätverk','Integration med befintliga system','Utbildning & support'],
        result: '30% ROT-avdrag direkt på fakturan'
      }]
    },
    energi: {
      label: 'Energieffektivisering', icon: '🔋',
      cases: [{
        title: 'Fastighetsenergikartläggning',
        steps: ['Mätning av energiförbrukning','Identifiering av energiläckage','LED-uppgradering & rörelsestyrning','Installation av energimätare'],
        result: 'Upp till 50% lägre elräkning första året'
      }, {
        title: 'Solcellsinstallation',
        steps: ['Analys av tak & solläge','Dimensionering av system','Installation & nätanslutning','Övervakning & ROI-rapportering'],
        result: 'Breakeven ca 8-10 år, 25 års livslängd'
      }]
    },
    entreprad: {
      label: 'Entreprenad & ROT', icon: '🏗️',
      cases: [{
        title: 'Totalrenovering lägenhet',
        steps: ['Omdragning av el enligt elsäkerhetskrav','Installation av gruppcentral','Ny belysning kök, badrum & vardagsrum','ROT-avdrag hanteras av oss'],
        result: 'Säkrare el + 30% kostnadsminskning via ROT'
      }, {
        title: 'BRF stamrenovering',
        steps: ['Projektering & offert till styrelse','Etappvis renovering per våningsplan','Uppgradering till moderna elsystem','Garantier & dokumentation'],
        result: 'Modern elsäkerhet i hela fastigheten'
      }]
    },
    foretag: {
      label: 'Företag & Fastighet', icon: '🏢',
      cases: [{
        title: 'Kontorselektrik & nätverk',
        steps: ['Planering av eluttag & datanät','Installation strukturerad kabling','Belysningsstyrning & närvarodetektering','Nödbelysning & säkerhet enligt BBR'],
        result: 'Komplett IT-infrastruktur på plats'
      }, {
        title: 'Serviceavtal fastighetsdrift',
        steps: ['Regelbundna elbesiktningar','Akut jour 24/7','Förebyggande underhåll','Fast månadskostnad'],
        result: 'Inga elfel utan varning — trygg drift'
      }]
    },
    sakerhet: {
      label: 'Säkerhet & Larm', icon: '🔒',
      cases: [{
        title: 'Komplett larmsystem',
        steps: ['Rörelsedetektorer & dörrkontakter','App-styrning & notiser','Koppling till larmcentral (valfritt)','Kameraövervakning inomhus/utomhus'],
        result: 'Fullständig trygghet dygnet runt'
      }, {
        title: 'Brandskydd & utrymning',
        steps: ['Installation brandvarnare & CO-varnare','Utrymningsbelysning enligt BBR','Serviceavtal för årlig kontroll','Dokumentation & attest'],
        result: 'Uppfyller alla myndighetskrav'
      }]
    },
    ovrigt: {
      label: 'Annat Eljobb', icon: '⚡',
      cases: [{
        title: 'Akuta elarbeten',
        steps: ['Felavhjälpning & felsökning','Byte av säkringar & jordfelsbrytare','Akutjour inom 2 timmar','Certifierad elektriker'],
        result: 'Snabb hjälp när det behövs'
      }, {
        title: 'Laddbox för elbil',
        steps: ['Dimensionering av laddeffekt (3,7-22 kW)','Installation & inkoppling','App-styrning & laddstatistik','ROT-avdrag 30%'],
        result: 'Ladda bilen hemma — enkelt & billigt'
      }]
    }
  };

  // ═══════════════════════════════════════════════════════════════
  //  💾 STATE
  // ═══════════════════════════════════════════════════════════════
  var leadData = {
    service: null,
    propertyType: null,
    rotLaborCost: 15000,
    rotMaterialCost: 8000,
    email: '',
    phone: ''
  };

  var currentScreen = 'home';
  var progressValue = 0;
  var nudgeState = {
    timeoutShown: false,
    scrollShown: false,
    exitShown: false,
    scrollTriggered: false,
    dwellStartTime: null
  };

  // ═══════════════════════════════════════════════════════════════
  //  🏗️ HTML STRUCTURE
  // ═══════════════════════════════════════════════════════════════
  var container = document.createElement('div');
  container.id = 'awj-widget-container';
  container.innerHTML = `
    <div id="awj-launcher">
      <svg class="awj-chat" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <svg class="awj-close" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display: none;">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </div>

    <div id="awj-widget">
      <div class="awj-header">
        <div class="awj-header-left">
          <div class="awj-back">←</div>
          <div class="awj-logo">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 40'%3E%3Ctext x='10' y='28' font-family='Arial, sans-serif' font-size='24' font-weight='800' fill='%23000'%3EAWJ%3C/text%3E%3C/svg%3E" class="awj-logo-img" alt="AWJ">
          </div>
          <div class="awj-divider"></div>
          <div class="awj-header-sub">
            <div class="awj-title">ELTEKNIK AB</div>
            <div class="awj-status">
              <div class="awj-dot"></div>
              <div class="awj-status-text">ONLINE NU</div>
            </div>
          </div>
        </div>
      </div>

      <div class="awj-progress">
        <div class="awj-progress-fill" style="width: 0%"></div>
      </div>

      <div class="awj-content">
        <!-- HOME SCREEN -->
        <div class="awj-screen active" data-screen="home">
          <div class="home-body">
            <div id="awj-nudge-banner">
              <div class="nudge-banner-text">👋 Hej! Behöver du hjälp med el? Vi ger dig ett fast pris på 2 minuter.</div>
              <button class="nudge-banner-btn">Starta här</button>
              <button class="nudge-banner-x">×</button>
            </div>

            <div class="home-greeting">
              Hej! 👋 Vi hjälper dig med allt från <strong>belysning & smarta hem</strong> till <strong>ROT-arbeten & företagslösningar</strong>. Vad kan vi hjälpa dig med idag?
            </div>

            <div class="home-grid">
              <div class="home-card" data-action="qualify">
                <div class="card-icon-wrap"><div class="card-icon">⚡</div></div>
                <div>
                  <div class="card-label">Få Offert</div>
                  <div class="card-sub">2 min · Fast pris</div>
                </div>
              </div>

              <div class="home-card rot-card" data-action="rot">
                <div class="card-icon-wrap"><div class="card-icon">💰</div></div>
                <div>
                  <div class="card-label">ROT-kalkyl</div>
                  <div class="card-sub">Räkna ut ditt avdrag</div>
                </div>
              </div>

              <div class="home-card" data-action="faq">
                <div class="card-icon-wrap"><div class="card-icon">💬</div></div>
                <div>
                  <div class="card-label">Vanliga Frågor</div>
                  <div class="card-sub">Snabba svar</div>
                </div>
              </div>

              <div class="home-card" data-action="pricing">
                <div class="card-icon-wrap"><div class="card-icon">💵</div></div>
                <div>
                  <div class="card-label">Priser</div>
                  <div class="card-sub">Se vad det kostar</div>
                </div>
              </div>

              <div class="home-card wide" data-action="chat">
                <div class="card-icon-wrap"><div class="card-icon">🤖</div></div>
                <div>
                  <div class="card-label">Chatta med Oss</div>
                  <div class="card-sub">Få hjälp direkt av vår AI-assistent</div>
                </div>
                <div class="wide-arrow">→</div>
              </div>

              <div class="home-card" data-action="contact">
                <div class="card-icon-wrap"><div class="card-icon">📞</div></div>
                <div>
                  <div class="card-label">Kontakt</div>
                  <div class="card-sub">Ring eller mejla oss</div>
                </div>
              </div>

              <div class="home-card" data-action="calendly">
                <div class="card-icon-wrap"><div class="card-icon">📅</div></div>
                <div>
                  <div class="card-label">Boka Möte</div>
                  <div class="card-sub">Välj tid som passar</div>
                </div>
              </div>
            </div>
          </div>

          <div class="awj-footer">
            <a href="https://awjelteknik.se" target="_blank">
              <div class="awj-pdot"></div>
              Powered by AWJ Elteknik
            </a>
          </div>
        </div>

        <!-- QUALIFY SCREEN -->
        <div class="awj-screen" data-screen="qualify">
          <div class="inner-body">
            <div class="step-indicator">
              <div class="step-dot active"></div>
              <div class="step-dot"></div>
              <div class="step-dot"></div>
              <span class="step-label">Steg 1/3</span>
            </div>

            <div class="inner-title">Vilken typ av eljobb?</div>
            <div class="inner-sub">Välj det som passar bäst så kan vi ge dig rätt information</div>

            <div class="chip-grid">
              <div class="chip" data-service="belysning">
                <div class="chip-icon">💡</div>
                <div class="chip-label">Belysning</div>
                <div class="chip-sub">& Ljusdesign</div>
              </div>
              <div class="chip" data-service="smarta_hem">
                <div class="chip-icon">🏠</div>
                <div class="chip-label">Smarta Hem</div>
                <div class="chip-sub">Automation</div>
              </div>
              <div class="chip" data-service="energi">
                <div class="chip-icon">🔋</div>
                <div class="chip-label">Energi</div>
                <div class="chip-sub">Effektivisering</div>
              </div>
              <div class="chip" data-service="entreprad">
                <div class="chip-icon">🏗️</div>
                <div class="chip-label">ROT-arbete</div>
                <div class="chip-sub">Renovering</div>
              </div>
              <div class="chip" data-service="foretag">
                <div class="chip-icon">🏢</div>
                <div class="chip-label">Företag</div>
                <div class="chip-sub">& Fastighet</div>
              </div>
              <div class="chip" data-service="sakerhet">
                <div class="chip-icon">🔒</div>
                <div class="chip-label">Säkerhet</div>
                <div class="chip-sub">& Larm</div>
              </div>
              <div class="chip" data-service="ovrigt">
                <div class="chip-icon">⚡</div>
                <div class="chip-label">Annat</div>
                <div class="chip-sub">Eljobb</div>
              </div>
            </div>

            <button class="awj-btn awj-btn-primary" id="qualify-next" disabled>Nästa →</button>
          </div>
        </div>

        <!-- PROPERTY TYPE SCREEN -->
        <div class="awj-screen" data-screen="property">
          <div class="inner-body">
            <div class="step-indicator">
              <div class="step-dot done"></div>
              <div class="step-dot active"></div>
              <div class="step-dot"></div>
              <span class="step-label">Steg 2/3</span>
            </div>

            <div class="inner-title">Typ av boende?</div>
            <div class="inner-sub">Detta hjälper oss att ge rätt prisuppskattning</div>

            <div class="chip-grid">
              <div class="chip" data-property="villa">
                <div class="chip-icon">🏡</div>
                <div class="chip-label">Villa</div>
                <div class="chip-sub">Enskilt hus</div>
              </div>
              <div class="chip" data-property="lagenhet">
                <div class="chip-icon">🏢</div>
                <div class="chip-label">Lägenhet</div>
                <div class="chip-sub">Bostadsrätt</div>
              </div>
              <div class="chip" data-property="radhus">
                <div class="chip-icon">🏘️</div>
                <div class="chip-label">Radhus</div>
                <div class="chip-sub">Kedjehus</div>
              </div>
              <div class="chip" data-property="foretag">
                <div class="chip-icon">🏗️</div>
                <div class="chip-label">Företag</div>
                <div class="chip-sub">Kontor/Lokal</div>
              </div>
            </div>

            <button class="awj-btn awj-btn-primary" id="property-next" disabled>Nästa →</button>
          </div>
        </div>

        <!-- ROT CALCULATOR SCREEN -->
        <div class="awj-screen" data-screen="rot">
          <div class="inner-body">
            <div class="step-indicator">
              <div class="step-dot done"></div>
              <div class="step-dot done"></div>
              <div class="step-dot active"></div>
              <span class="step-label">Steg 3/3</span>
            </div>

            <div class="inner-title">ROT-avdragskalkylator</div>
            <div class="inner-sub">Räkna ut ditt ROT-avdrag (30% på arbetskostnad)</div>

            <div class="rot-field">
              <div class="rot-field-label">
                Arbetskostnad (kr)
                <span id="rot-labor-val">15 000 kr</span>
              </div>
              <input type="range" class="rot-slider" id="rot-labor" min="5000" max="100000" step="1000" value="15000">
            </div>

            <div class="rot-field">
              <div class="rot-field-label">
                Materialkostnad (kr)
                <span id="rot-material-val">8 000 kr</span>
              </div>
              <input type="range" class="rot-slider" id="rot-material" min="0" max="50000" step="1000" value="8000">
            </div>

            <div class="rot-result-box">
              <div class="rot-result-label">Ditt ROT-avdrag (30%)</div>
              <div class="rot-result-amount" id="rot-saving">4 500 kr</div>
              <div class="rot-result-sub">Du betalar bara <span id="rot-pay">18 500 kr</span></div>
            </div>

            <div class="rot-breakdown">
              <div class="rot-stat">
                <div class="rot-stat-label">Totalkostnad</div>
                <div class="rot-stat-val" id="rot-total">23 000 kr</div>
              </div>
              <div class="rot-stat">
                <div class="rot-stat-label">Efter ROT</div>
                <div class="rot-stat-val" id="rot-final">18 500 kr</div>
              </div>
            </div>

            <button class="awj-btn awj-btn-gold" id="rot-next">Se Tidigare Projekt →</button>
          </div>
        </div>

        <!-- CASES SCREEN -->
        <div class="awj-screen" data-screen="cases">
          <div class="inner-body">
            <div class="lead-summary">
              <div class="lead-summary-chips">
                <div class="lead-chip" id="summary-service">💡 Belysning</div>
                <div class="lead-chip" id="summary-property">🏡 Villa</div>
              </div>
              <div class="lead-edit">Redigera</div>
            </div>

            <div class="inner-title">Tidigare projekt</div>
            <div class="inner-sub">Vi har hjälpt andra kunder med liknande jobb</div>

            <div id="cases-container"></div>

            <button class="awj-btn awj-btn-primary" id="cases-next">Få Offert →</button>
          </div>
        </div>

        <!-- CONTACT FORM SCREEN -->
        <div class="awj-screen" data-screen="contact-form">
          <div class="inner-body">
            <div class="inner-title">Få din offert</div>
            <div class="inner-sub">Vi kontaktar dig inom 24h med fast pris</div>

            <div class="section-label">KONTAKTUPPGIFTER</div>

            <div class="awj-input-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input type="email" class="awj-input" id="contact-email" placeholder="din@email.se" required>
            </div>

            <div class="awj-input-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <input type="tel" class="awj-input" id="contact-phone" placeholder="070-123 45 67" required>
            </div>

            <button class="awj-btn awj-btn-gold" id="submit-lead">Skicka Offertförfrågan →</button>
            <div id="send-status"></div>
          </div>
        </div>

        <!-- FAQ SCREEN -->
        <div class="awj-screen" data-screen="faq">
          <div class="inner-body">
            <div class="inner-title">Vanliga Frågor</div>
            <div class="inner-sub">Snabba svar på det ni brukar undra</div>

            <div class="faq-item">
              <button class="faq-q">
                Hur snabbt kan ni komma ut?
                <span class="faq-chevron">▼</span>
              </button>
              <div class="faq-a">
                Vi erbjuder akutjour inom 2 timmar för akuta elfel. För planerade arbeten bokar vi normalt inom 1-2 veckor beroende på omfattning.
              </div>
            </div>

            <div class="faq-item">
              <button class="faq-q">
                Vad kostar en elbesiktning?
                <span class="faq-chevron">▼</span>
              </button>
              <div class="faq-a">
                En grundläggande elbesiktning för villa kostar från 3 500 kr. För lägenhet från 2 500 kr. Priset inkluderar besiktning, protokoll och attest.
              </div>
            </div>

            <div class="faq-item">
              <button class="faq-q">
                Hur funkar ROT-avdraget?
                <span class="faq-chevron">▼</span>
              </button>
              <div class="faq-a">
                Du får 30% av arbetskostnaden (max 50 000 kr/person/år) direkt avdraget på fakturan. Vi hanterar alla papperen åt dig — du behöver bara godkänna.
              </div>
            </div>

            <div class="faq-item">
              <button class="faq-q">
                Är ni auktoriserade elektriker?
                <span class="faq-chevron">▼</span>
              </button>
              <div class="faq-a">
                Ja, alla våra elektriker är auktoriserade av Elsäkerhetsverket. Vi utfärdar alltid el-attest och följer gällande elsäkerhetskrav.
              </div>
            </div>

            <div class="faq-item">
              <button class="faq-q">
                Har ni garanti på arbetet?
                <span class="faq-chevron">▼</span>
              </button>
              <div class="faq-a">
                Vi ger 2 års garanti på allt elarbete och 5 år på installerade komponenter (enligt tillverkarens villkor). Vi står för kvaliteten!
              </div>
            </div>
          </div>
        </div>

        <!-- PRICING SCREEN -->
        <div class="awj-screen" data-screen="pricing">
          <div class="inner-body">
            <div class="inner-title">Priser & Paket</div>
            <div class="inner-sub">Fasta priser — inga dolda kostnader</div>

            <div class="price-toggle">
              <button class="price-toggle-btn active" data-tab="hemma">Hemma</button>
              <button class="price-toggle-btn" data-tab="foretag">Företag</button>
            </div>

            <div class="price-set active" data-set="hemma">
              <div class="price-card">
                <div class="price-tier">START</div>
                <div class="price-name">Elbesiktning</div>
                <div class="price-amount">2 500 kr <span>/ besiktning</span></div>
                <div class="price-features">
                  <div class="price-feature">Komplett genomgång av elsystemet</div>
                  <div class="price-feature">Elsäkerhetsprotokoll</div>
                  <div class="price-feature">Attest för försäljning</div>
                </div>
                <button class="price-cta" onclick="document.querySelector('[data-action=\\'calendly\\']').click()">Boka Besiktning</button>
              </div>

              <div class="price-card featured">
                <div class="price-badge">POPULÄRAST</div>
                <div class="price-tier">PAKET</div>
                <div class="price-name">Smart Hem Basic</div>
                <div class="price-amount">12 900 kr <span>/ installation</span></div>
                <div class="price-features">
                  <div class="price-feature">10 smarta uttag & switchar</div>
                  <div class="price-feature">Central hub + app-styrning</div>
                  <div class="price-feature">Installation & utbildning</div>
                  <div class="price-feature">30% ROT-avdrag</div>
                </div>
                <button class="price-cta" onclick="document.querySelector('[data-action=\\'qualify\\']').click()">Beställ Paket</button>
              </div>

              <div class="price-card">
                <div class="price-tier">PREMIUM</div>
                <div class="price-name">Totalrenovering El</div>
                <div class="price-amount">Från 45 000 kr <span>/ projekt</span></div>
                <div class="price-features">
                  <div class="price-feature">Ny elcentral & gruppcentral</div>
                  <div class="price-feature">Omdragning av ledningar</div>
                  <div class="price-feature">LED-belysning hela hemmet</div>
                  <div class="price-feature">30% ROT-avdrag direkt</div>
                </div>
                <button class="price-cta" onclick="document.querySelector('[data-action=\\'qualify\\']').click()">Få Offert</button>
              </div>
            </div>

            <div class="price-set" data-set="foretag">
              <div class="price-card">
                <div class="price-tier">AKUT</div>
                <div class="price-name">Jour & Felavhjälpning</div>
                <div class="price-amount">1 200 kr <span>/ timme</span></div>
                <div class="price-features">
                  <div class="price-feature">Utryckning inom 2 timmar</div>
                  <div class="price-feature">Tillgänglig 24/7</div>
                  <div class="price-feature">Certifierad elektriker</div>
                </div>
                <button class="price-cta" onclick="window.location.href='tel:0735779302'">Ring Nu</button>
              </div>

              <div class="price-card featured">
                <div class="price-badge">REKOMMENDERAT</div>
                <div class="price-tier">SERVICEAVTAL</div>
                <div class="price-name">Fastighetsservice</div>
                <div class="price-amount">2 900 kr <span>/ månad</span></div>
                <div class="price-features">
                  <div class="price-feature">Regelbundna elbesiktningar</div>
                  <div class="price-feature">Prioriterad jour</div>
                  <div class="price-feature">Förebyggande underhåll</div>
                  <div class="price-feature">Fast månadskostnad</div>
                </div>
                <button class="price-cta" onclick="document.querySelector('[data-action=\\'qualify\\']').click()">Teckna Avtal</button>
              </div>

              <div class="price-card">
                <div class="price-tier">PROJEKT</div>
                <div class="price-name">Nyinstallation</div>
                <div class="price-amount">Offert <span>/ projekt</span></div>
                <div class="price-features">
                  <div class="price-feature">Komplett elinstallation</div>
                  <div class="price-feature">Datanät & IT-infrastruktur</div>
                  <div class="price-feature">Projektering enligt BBR</div>
                  <div class="price-feature">Garantier & dokumentation</div>
                </div>
                <button class="price-cta" onclick="document.querySelector('[data-action=\\'qualify\\']').click()">Begär Offert</button>
              </div>
            </div>
          </div>
        </div>

        <!-- CONTACT SCREEN -->
        <div class="awj-screen" data-screen="contact">
          <div class="inner-body">
            <div class="inner-title">Kontakta Oss</div>
            <div class="inner-sub">Vi finns här för dig — ring, mejla eller boka möte</div>

            <div class="contact-card">
              <div class="contact-head">
                <div class="contact-av">K</div>
                <div>
                  <div class="contact-name">Kenny</div>
                  <div class="contact-role">Elektriker & Ägare</div>
                </div>
              </div>
              <div class="contact-links">
                <a href="tel:0735779302" class="contact-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  073-577 93 02
                </a>
              </div>
            </div>

            <div class="contact-card">
              <div class="contact-head">
                <div class="contact-av">R</div>
                <div>
                  <div class="contact-name">Robert</div>
                  <div class="contact-role">Elektriker</div>
                </div>
              </div>
              <div class="contact-links">
                <a href="tel:0709446968" class="contact-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  070-944 69 68
                </a>
              </div>
            </div>

            <div class="contact-card">
              <div class="contact-head">
                <div class="contact-av">📍</div>
                <div>
                  <div class="contact-name">Besöksadress</div>
                  <div class="contact-role">Älvsjö, Stockholm</div>
                </div>
              </div>
              <div class="contact-links">
                <a href="https://maps.google.com/?q=Blackensvägen+14,+125+32+Älvsjö" target="_blank" class="contact-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  Blackensvägen 14, 125 32 Älvsjö
                </a>
              </div>
            </div>

            <button class="awj-btn awj-btn-gold" onclick="document.querySelector('[data-action=\\'calendly\\']').click()">Boka Möte →</button>
          </div>
        </div>

        <!-- CHAT SCREEN -->
        <div class="awj-screen" data-screen="chat">
          <div style="flex: 1; display: flex; flex-direction: column;">
            <zapier-interfaces-chatbot-embed 
              is-popup="false" 
              chatbot-id="${ZAPIER_CHATBOT_ID}"
              height="100%"
              style="flex: 1;"
            ></zapier-interfaces-chatbot-embed>
          </div>
        </div>

      </div>
    </div>

    <div id="awj-tooltip">
      <button id="awj-tooltip-close">×</button>
      <div id="awj-tooltip-text"></div>
    </div>
  `;
  document.body.appendChild(container);

  // ═══════════════════════════════════════════════════════════════
  //  ⚙️ HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  function formatNumber(num) {
    return new Intl.NumberFormat('sv-SE').format(num);
  }

  function goToScreen(screenName, slideBack) {
    var screens = document.querySelectorAll('.awj-screen');
    screens.forEach(function(s) {
      s.classList.remove('active', 'slide-in', 'slide-back');
    });
    
    var targetScreen = document.querySelector('[data-screen="' + screenName + '"]');
    if (targetScreen) {
      targetScreen.classList.add('active');
      targetScreen.classList.add(slideBack ? 'slide-back' : 'slide-in');
      currentScreen = screenName;
      
      var backBtn = document.querySelector('.awj-back');
      if (screenName === 'home') {
        backBtn.classList.remove('show');
        updateProgress(0);
      } else {
        backBtn.classList.add('show');
      }
      
      if (screenName === 'chat') {
        document.getElementById('awj-widget').classList.add('expanded');
      } else {
        document.getElementById('awj-widget').classList.remove('expanded');
      }
    }
  }

  function updateProgress(percent) {
    progressValue = percent;
    document.querySelector('.awj-progress-fill').style.width = percent + '%';
  }

  function calculateROT() {
    var labor = parseInt(document.getElementById('rot-labor').value);
    var material = parseInt(document.getElementById('rot-material').value);
    var total = labor + material;
    var saving = Math.round(labor * 0.3);
    var finalPrice = total - saving;

    leadData.rotLaborCost = labor;
    leadData.rotMaterialCost = material;

    document.getElementById('rot-labor-val').textContent = formatNumber(labor) + ' kr';
    document.getElementById('rot-material-val').textContent = formatNumber(material) + ' kr';
    document.getElementById('rot-saving').textContent = formatNumber(saving) + ' kr';
    document.getElementById('rot-pay').textContent = formatNumber(finalPrice) + ' kr';
    document.getElementById('rot-total').textContent = formatNumber(total) + ' kr';
    document.getElementById('rot-final').textContent = formatNumber(finalPrice) + ' kr';
  }

  function renderCases() {
    var container = document.getElementById('cases-container');
    if (!leadData.service || !serviceData[leadData.service]) return;
    
    var cases = serviceData[leadData.service].cases;
    container.innerHTML = cases.map(function(c) {
      var stepsHTML = c.steps.map(function(step) {
        return '<div class="case-step"><div class="case-arrow">→</div><div class="case-step-text">' + step + '</div></div>';
      }).join('');
      
      return `
        <div class="case-card">
          <div class="case-header">
            <div class="case-badge">${serviceData[leadData.service].icon}</div>
            <div>
              <div class="case-title">${c.title}</div>
              <div class="case-industry">${serviceData[leadData.service].label}</div>
            </div>
          </div>
          <div class="case-steps">${stepsHTML}</div>
          <div class="case-result">
            <div class="case-result-icon">✅</div>
            <div class="case-result-text">${c.result}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  function updateLeadSummary() {
    var serviceChip = document.getElementById('summary-service');
    var propertyChip = document.getElementById('summary-property');
    
    if (leadData.service && serviceData[leadData.service]) {
      serviceChip.textContent = serviceData[leadData.service].icon + ' ' + serviceData[leadData.service].label;
    }
    
    var propertyLabels = {
      villa: '🏡 Villa',
      lagenhet: '🏢 Lägenhet',
      radhus: '🏘️ Radhus',
      foretag: '🏗️ Företag'
    };
    if (leadData.propertyType) {
      propertyChip.textContent = propertyLabels[leadData.propertyType] || leadData.propertyType;
    }
  }

  async function submitLead() {
    var email = document.getElementById('contact-email').value.trim();
    var phone = document.getElementById('contact-phone').value.trim();
    
    if (!email || !phone) {
      alert('Fyll i både e-post och telefonnummer');
      return;
    }

    leadData.email = email;
    leadData.phone = phone;

    var btn = document.getElementById('submit-lead');
    var statusDiv = document.getElementById('send-status');
    
    btn.disabled = true;
    statusDiv.innerHTML = '<div class="send-state"><div class="send-spinner"></div> Skickar...</div>';

    var payload = {
      email: leadData.email,
      phone: leadData.phone,
      service: serviceData[leadData.service] ? serviceData[leadData.service].label : leadData.service,
      property_type: leadData.propertyType,
      rot_labor_cost: leadData.rotLaborCost,
      rot_material_cost: leadData.rotMaterialCost,
      rot_saving: Math.round(leadData.rotLaborCost * 0.3),
      rot_total: leadData.rotLaborCost + leadData.rotMaterialCost,
      rot_pay: (leadData.rotLaborCost + leadData.rotMaterialCost) - Math.round(leadData.rotLaborCost * 0.3)
    };

    try {
      var response = await fetch(ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        statusDiv.innerHTML = '<div class="send-state" style="color: #10b981;">✓ Tack! Vi hör av oss inom 24h</div>';
        setTimeout(function() {
          window.open(CALENDLY_URL, '_blank');
        }, 1500);
      } else {
        throw new Error('Webhook failed');
      }
    } catch (error) {
      statusDiv.innerHTML = '<div class="send-state" style="color: #ef4444;">✗ Något gick fel. Ring oss istället!</div>';
      btn.disabled = false;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  🎯 EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════════
  
  // Launcher toggle
  document.getElementById('awj-launcher').addEventListener('click', function() {
    var widget = document.getElementById('awj-widget');
    var launcher = this;
    
    if (widget.classList.contains('visible')) {
      widget.classList.remove('visible');
      launcher.classList.remove('open');
    } else {
      widget.classList.add('visible');
      launcher.classList.add('open');
      hideTooltip();
      hideNudgeBanner();
    }
  });

  // Back button
  document.querySelector('.awj-back').addEventListener('click', function() {
    if (currentScreen === 'qualify') {
      goToScreen('home', true);
    } else if (currentScreen === 'property') {
      goToScreen('qualify', true);
      updateProgress(33);
    } else if (currentScreen === 'rot') {
      goToScreen('property', true);
      updateProgress(66);
    } else if (currentScreen === 'cases') {
      goToScreen('rot', true);
      updateProgress(66);
    } else if (currentScreen === 'contact-form') {
      goToScreen('cases', true);
    } else {
      goToScreen('home', true);
    }
  });

  // Home card actions
  document.querySelectorAll('.home-card').forEach(function(card) {
    card.addEventListener('click', function() {
      var action = this.dataset.action;
      
      if (action === 'qualify') {
        goToScreen('qualify');
        updateProgress(33);
      } else if (action === 'rot') {
        goToScreen('rot');
        updateProgress(100);
      } else if (action === 'faq') {
        goToScreen('faq');
      } else if (action === 'pricing') {
        goToScreen('pricing');
      } else if (action === 'contact') {
        goToScreen('contact');
      } else if (action === 'chat') {
        goToScreen('chat');
      } else if (action === 'calendly') {
        window.open(CALENDLY_URL, '_blank');
      }
    });
  });

  // Service selection
  document.querySelectorAll('[data-service]').forEach(function(chip) {
    chip.addEventListener('click', function() {
      document.querySelectorAll('[data-service]').forEach(function(c) {
        c.classList.remove('selected');
      });
      this.classList.add('selected');
      leadData.service = this.dataset.service;
      document.getElementById('qualify-next').disabled = false;
    });
  });

  // Qualify next
  document.getElementById('qualify-next').addEventListener('click', function() {
    if (leadData.service) {
      goToScreen('property');
      updateProgress(66);
    }
  });

  // Property selection
  document.querySelectorAll('[data-property]').forEach(function(chip) {
    chip.addEventListener('click', function() {
      document.querySelectorAll('[data-property]').forEach(function(c) {
        c.classList.remove('selected');
      });
      this.classList.add('selected');
      leadData.propertyType = this.dataset.property;
      document.getElementById('property-next').disabled = false;
    });
  });

  // Property next
  document.getElementById('property-next').addEventListener('click', function() {
    if (leadData.propertyType) {
      goToScreen('rot');
      updateProgress(100);
      calculateROT();
    }
  });

  // ROT sliders
  document.getElementById('rot-labor').addEventListener('input', calculateROT);
  document.getElementById('rot-material').addEventListener('input', calculateROT);

  // ROT next
  document.getElementById('rot-next').addEventListener('click', function() {
    updateLeadSummary();
    renderCases();
    goToScreen('cases');
  });

  // Cases next
  document.getElementById('cases-next').addEventListener('click', function() {
    goToScreen('contact-form');
  });

  // Lead summary edit
  document.querySelector('.lead-edit').addEventListener('click', function() {
    goToScreen('qualify', true);
    updateProgress(33);
  });

  // Submit lead
  document.getElementById('submit-lead').addEventListener('click', submitLead);

  // FAQ toggles
  document.querySelectorAll('.faq-q').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item = this.closest('.faq-item');
      item.classList.toggle('open');
    });
  });

  // Price toggle
  document.querySelectorAll('.price-toggle-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.price-toggle-btn').forEach(function(b) {
        b.classList.remove('active');
      });
      this.classList.add('active');
      
      var tab = this.dataset.tab;
      document.querySelectorAll('.price-set').forEach(function(set) {
        set.classList.remove('active');
      });
      document.querySelector('[data-set="' + tab + '"]').classList.add('active');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //  🔔 NUDGE SYSTEM
  // ═══════════════════════════════════════════════════════════════
  
  function showTooltip(message) {
    var tooltip = document.getElementById('awj-tooltip');
    var tooltipText = document.getElementById('awj-tooltip-text');
    tooltipText.textContent = message;
    tooltip.classList.add('show');
  }

  function hideTooltip() {
    document.getElementById('awj-tooltip').classList.remove('show');
  }

  function showNudgeBanner() {
    document.getElementById('awj-nudge-banner').classList.add('show');
  }

  function hideNudgeBanner() {
    document.getElementById('awj-nudge-banner').classList.remove('show');
  }

  // Tooltip click -> open widget
  document.getElementById('awj-tooltip').addEventListener('click', function() {
    hideTooltip();
    document.getElementById('awj-launcher').click();
  });

  // Tooltip close
  document.getElementById('awj-tooltip-close').addEventListener('click', function(e) {
    e.stopPropagation();
    hideTooltip();
  });

  // Nudge banner actions
  document.querySelector('.nudge-banner-btn').addEventListener('click', function() {
    hideNudgeBanner();
    goToScreen('qualify');
    updateProgress(33);
  });

  document.querySelector('.nudge-banner-x').addEventListener('click', function() {
    hideNudgeBanner();
  });

  // NUDGE TRIGGER 1: Timeout (30 seconds)
  setTimeout(function() {
    if (!nudgeState.timeoutShown && !document.getElementById('awj-widget').classList.contains('visible')) {
      showTooltip('💡 Behöver du hjälp med el? Vi fixar det!');
      nudgeState.timeoutShown = true;
    }
  }, 30000);

  // NUDGE TRIGGER 2: Scroll + Dwell
  var scrollHandler = function() {
    var scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    
    if (scrollPercent > 50 && !nudgeState.scrollTriggered) {
      nudgeState.scrollTriggered = true;
      nudgeState.dwellStartTime = Date.now();
    }
    
    if (nudgeState.scrollTriggered && !nudgeState.scrollShown) {
      var dwellTime = Date.now() - nudgeState.dwellStartTime;
      if (dwellTime > 8000) {
        if (!document.getElementById('awj-widget').classList.contains('visible')) {
          showNudgeBanner();
          nudgeState.scrollShown = true;
        }
      }
    }
  };
  window.addEventListener('scroll', scrollHandler);

  // NUDGE TRIGGER 3: Exit Intent
  var exitHandler = function(e) {
    if (e.clientY < 10 && !nudgeState.exitShown && !document.getElementById('awj-widget').classList.contains('visible')) {
      showTooltip('⚡ Vänta! Få fast pris på 2 minuter →');
      nudgeState.exitShown = true;
    }
  };
  document.addEventListener('mouseleave', exitHandler);

  // ═══════════════════════════════════════════════════════════════
  //  🚀 INITIALIZATION
  // ═══════════════════════════════════════════════════════════════
  
  // Initialize ROT calculator with default values
  calculateROT();

  console.log('✅ AWJ Elteknik Widget loaded successfully');
  console.log('📋 Remember to configure: ZAPIER_WEBHOOK_URL, CALENDLY_URL, ZAPIER_CHATBOT_ID');

})();
