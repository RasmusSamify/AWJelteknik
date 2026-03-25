(function () {
  if (document.getElementById('awj-widget-container')) return;

  // ─────────────────────────────────────────────
  //  ⚙️  KONFIGURATION — byt ut dessa värden
  // ─────────────────────────────────────────────
  var ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/XXXXX/XXXXX/'; // Lägg in er Zapier webhook
  var CALENDLY_URL       = 'https://calendly.com/awj-elteknik'; // Lägg in er Calendly-länk
  // ─────────────────────────────────────────────

  // Load Zapier chatbot script
  var zapierScript = document.createElement('script');
  zapierScript.type = 'module';
  zapierScript.src = 'https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js';
  document.head.appendChild(zapierScript);

  // Fonts
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
  document.head.appendChild(link);

  // ─── CSS ───────────────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = `
    #awj-widget-container * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important; box-sizing: border-box; }

    #awj-launcher {
      position: fixed; bottom: 24px; right: 24px;
      width: 64px; height: 64px; border-radius: 50%;
      background: #000; border: 2px solid #FFD700; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25), 0 0 0 0 rgba(255,215,0,0.4);
      transition: transform 0.2s, box-shadow 0.2s;
      z-index: 9999;
      overflow: hidden;
      animation: awjPulse 2s ease-in-out infinite;
    }
    @keyframes awjPulse {
      0%, 100% { box-shadow: 0 4px 20px rgba(0,0,0,0.25), 0 0 0 0 rgba(255,215,0,0.4); }
      50% { box-shadow: 0 4px 24px rgba(0,0,0,0.3), 0 0 0 8px rgba(255,215,0,0.1); }
    }
    #awj-launcher::after {
      content: '';
      position: absolute;
      top: -60%; left: -80%;
      width: 50%; height: 220%;
      background: linear-gradient(105deg, transparent 30%, rgba(255,215,0,0.15) 50%, transparent 70%);
      transform: skewX(-15deg);
      animation: awjShimmer 3s ease-in-out infinite;
    }
    @keyframes awjShimmer { 0%,70%{left:-80%} 85%{left:140%} 100%{left:140%} }
    @keyframes awjBlink { 0%,100%{opacity:1} 50%{opacity:0} }
    #awj-launcher:hover { transform: scale(1.08); }
    #awj-launcher.open .awj-chat { display: none; }
    #awj-launcher.open .awj-close { display: block !important; }

    #awj-widget {
      position: fixed; bottom: 100px; right: 24px;
      width: 400px; height: 640px;
      border-radius: 16px;
      box-shadow: 0 10px 50px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,215,0,0.2);
      background: #fff;
      display: flex; flex-direction: column;
      overflow: hidden;
      transform: scale(0.92) translateY(16px);
      opacity: 0; pointer-events: none;
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease, width 0.3s ease, height 0.3s ease, bottom 0.3s ease;
      z-index: 9998;
    }
    #awj-widget.visible { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }
    #awj-widget.expanded { width: 480px; height: 720px; bottom: 24px; }
    @media (max-width: 580px) {
      #awj-widget { width: calc(100vw - 16px); right: 8px; }
      #awj-widget.expanded { width: calc(100vw - 16px); height: calc(100dvh - 100px); right: 8px; }
    }

    /* HEADER */
    .awj-header { 
      background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); 
      padding: 16px 18px; 
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      flex-shrink: 0;
      border-bottom: 2px solid #FFD700;
    }
    .awj-header-left { display: flex; align-items: center; }
    .awj-back { 
      background: rgba(255,215,0,0.1); 
      border: 1px solid rgba(255,215,0,0.3); 
      cursor: pointer; 
      width: 32px; height: 32px; 
      border-radius: 50%; 
      display: none; 
      align-items: center; 
      justify-content: center; 
      color: #FFD700; 
      font-size: 18px; 
      transition: background 0.15s; 
      flex-shrink: 0; 
      margin-right: 12px;
      font-weight: 600;
    }
    .awj-back.show { display: flex; }
    .awj-back:hover { background: rgba(255,215,0,0.2); }
    .awj-logo { display: flex; align-items: center; gap: 10px; }
    .awj-logo-img { height: 28px; width: auto; filter: brightness(0) invert(1); }
    .awj-divider { width: 1px; height: 28px; background: rgba(255,215,0,0.3); margin: 0 14px; flex-shrink: 0; }
    .awj-header-sub { display: flex; flex-direction: column; }
    .awj-title { 
      font-size: 10px; 
      font-weight: 600; 
      color: rgba(255,215,0,0.9); 
      letter-spacing: 0.15em; 
      text-transform: uppercase; 
      line-height: 1.3;
      margin-bottom: 3px;
    }
    .awj-status { display: flex; align-items: center; gap: 5px; }
    .awj-dot { 
      width: 6px; height: 6px; 
      border-radius: 50%; 
      background: #4ade80;
      animation: awjBlink 2s ease-in-out infinite;
    }
    .awj-status-text { 
      font-size: 9px; 
      font-weight: 600; 
      color: rgba(255,255,255,0.7); 
      letter-spacing: 0.08em; 
      text-transform: uppercase;
    }

    /* PROGRESS BAR */
    .awj-progress { height: 3px; background: rgba(255,215,0,0.2); flex-shrink: 0; position: relative; overflow: hidden; }
    .awj-progress-fill { height: 100%; background: #FFD700; transition: width 0.4s ease; }

    /* SCREENS */
    .awj-content { flex: 1; overflow: hidden; position: relative; }
    .awj-screen { 
      position: absolute; 
      top: 0; right: 0; bottom: 0; left: 0; 
      overflow-y: auto; 
      -webkit-overflow-scrolling: touch; 
      background: #f8f8f8; 
      display: none; 
      flex-direction: column;
    }
    .awj-screen.active { display: flex; }
    .awj-screen.slide-in { animation: awjSlideIn 0.28s ease forwards; }
    .awj-screen.slide-back { animation: awjSlideBack 0.24s ease forwards; }
    @keyframes awjSlideIn   { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes awjSlideBack { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }

    /* HOME */
    .home-body { padding: 18px; }
    .home-greeting { 
      font-size: 13px; 
      font-weight: 500; 
      color: #1a1a1a; 
      line-height: 1.6; 
      margin-bottom: 16px; 
      background: #fff; 
      border-radius: 12px; 
      padding: 14px 16px; 
      border: 1px solid #e5e5e5;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .home-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .home-card { 
      background: #fff; 
      border: 1px solid #e5e5e5; 
      border-radius: 12px; 
      padding: 16px 14px; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      gap: 8px; 
      cursor: pointer; 
      text-align: center; 
      transition: all 0.2s; 
      position: relative;
      overflow: hidden;
    }
    .home-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: #FFD700;
      transform: scaleX(0);
      transition: transform 0.2s;
    }
    .home-card:hover::before { transform: scaleX(1); }
    .home-card:hover { 
      border-color: #FFD700; 
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255,215,0,0.2);
    }
    .home-card:active { transform: translateY(0) scale(0.98); }
    .home-card.wide { 
      grid-column: span 2; 
      flex-direction: row; 
      justify-content: flex-start; 
      gap: 14px; 
      padding: 16px 18px; 
      text-align: left; 
      background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); 
      border-color: #FFD700;
      border-width: 2px;
    }
    .home-card.wide::before { display: none; }
    .home-card.wide:hover { 
      background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255,215,0,0.3);
    }
    .home-card.wide .card-label { color: #fff; }
    .home-card.wide .card-sub { color: rgba(255,215,0,0.8); }
    .home-card.wide .card-icon-wrap { 
      width: 44px; height: 44px; 
      border-radius: 12px; 
      background: rgba(255,215,0,0.15); 
      border: 1px solid rgba(255,215,0,0.3);
      display: flex; 
      align-items: center; 
      justify-content: center; 
      flex-shrink: 0;
    }
    .home-card .card-icon-wrap { 
      width: 42px; height: 42px; 
      border-radius: 12px; 
      background: #f8f8f8; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      border: 1px solid #e5e5e5;
    }
    .card-icon { font-size: 22px; }
    .card-icon-wrap svg { stroke: #1a1a1a; }
    .home-card.wide .card-icon-wrap svg { stroke: #FFD700; }
    .card-label { font-size: 12.5px; font-weight: 700; color: #000; }
    .card-sub { font-size: 11px; color: #666; font-weight: 500; }
    .wide-arrow { margin-left: auto; color: #FFD700; font-size: 22px; font-weight: 300; }

    /* ROT CARD on home — special gradient */
    .home-card.rot-card { 
      grid-column: span 2; 
      flex-direction: row; 
      justify-content: flex-start; 
      gap: 14px; 
      padding: 16px 18px; 
      text-align: left; 
      background: linear-gradient(135deg, #1a5c1a 0%, #0f4a0f 100%); 
      border-color: #4ade80;
      border-width: 2px;
    }
    .home-card.rot-card::before { display: none; }
    .home-card.rot-card:hover { 
      background: linear-gradient(135deg, #0f4a0f 0%, #1a5c1a 100%);
      box-shadow: 0 6px 16px rgba(74,222,128,0.3);
    }
    .home-card.rot-card .card-label { color: #fff; }
    .home-card.rot-card .card-sub { color: rgba(74,222,128,0.9); }
    .home-card.rot-card .card-icon-wrap { 
      width: 44px; height: 44px; 
      border-radius: 12px; 
      background: rgba(74,222,128,0.2); 
      border: 1px solid rgba(74,222,128,0.4);
      display: flex; 
      align-items: center; 
      justify-content: center; 
      flex-shrink: 0;
    }
    .home-card.rot-card .card-icon-wrap svg { stroke: #fff; }
    .home-card.rot-card .wide-arrow { color: rgba(74,222,128,0.7); }

    /* INNER */
    .inner-body { padding: 18px; flex: 1; }
    .inner-title { font-size: 14px; font-weight: 800; color: #000; margin-bottom: 5px; letter-spacing: -0.01em; }
    .inner-sub { font-size: 12px; color: #666; margin-bottom: 16px; font-weight: 500; }

    /* STEP INDICATOR */
    .step-indicator { display: flex; gap: 7px; align-items: center; margin-bottom: 18px; }
    .step-dot { 
      width: 7px; height: 7px; 
      border-radius: 50%; 
      background: #e5e5e5; 
      transition: background 0.2s, transform 0.2s;
    }
    .step-dot.done { background: #4ade80; }
    .step-dot.active { background: #FFD700; transform: scale(1.4); }
    .step-label { font-size: 10px; color: #666; margin-left: 5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }

    /* QUALIFY — chip grid */
    .chip-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
    .chip-grid.three-col { grid-template-columns: 1fr 1fr 1fr; }
    .chip { 
      background: #fff; 
      border: 2px solid #e5e5e5; 
      border-radius: 12px; 
      padding: 12px 10px; 
      text-align: center; 
      cursor: pointer; 
      transition: all 0.2s;
      position: relative;
      overflow: hidden;
    }
    .chip::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: #FFD700;
      transform: scaleX(0);
      transition: transform 0.2s;
    }
    .chip:hover::before { transform: scaleX(1); }
    .chip:hover { border-color: #FFD700; background: #fffef5; }
    .chip.selected { 
      border-color: #FFD700; 
      background: #fffef5;
      box-shadow: 0 0 0 3px rgba(255,215,0,0.1);
    }
    .chip.selected::before { transform: scaleX(1); }
    .chip-icon { font-size: 22px; margin-bottom: 6px; }
    .chip-label { font-size: 11.5px; font-weight: 700; color: #000; }
    .chip-sub { font-size: 10px; color: #666; margin-top: 3px; font-weight: 500; }

    /* SECTION LABEL */
    .section-label { 
      font-size: 10.5px; 
      font-weight: 800; 
      color: #666; 
      text-transform: uppercase; 
      letter-spacing: 0.1em; 
      margin-bottom: 10px;
    }

    /* EMAIL/PHONE INPUT */
    .awj-input-wrap { position: relative; margin-bottom: 14px; }
    .awj-input-wrap svg { 
      position: absolute; 
      left: 14px; 
      top: 50%; 
      transform: translateY(-50%); 
      pointer-events: none;
    }
    .awj-input { 
      width: 100%; 
      padding: 13px 16px 13px 42px; 
      border: 2px solid #e5e5e5; 
      border-radius: 12px; 
      font-size: 13px; 
      font-family: 'Inter', sans-serif !important; 
      color: #000; 
      background: #fff; 
      outline: none; 
      -webkit-appearance: none; 
      appearance: none; 
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .awj-input:focus { 
      border-color: #FFD700; 
      box-shadow: 0 0 0 3px rgba(255,215,0,0.1);
    }
    .awj-input::placeholder { color: #999; }

    /* ROT CALCULATOR */
    .rot-field { 
      background: #fff; 
      border: 2px solid #e5e5e5; 
      border-radius: 12px; 
      padding: 14px 16px; 
      margin-bottom: 12px; 
      transition: border-color 0.2s;
    }
    .rot-field:focus-within { 
      border-color: #FFD700;
      box-shadow: 0 0 0 3px rgba(255,215,0,0.1);
    }
    .rot-field-label { 
      font-size: 11px; 
      font-weight: 700; 
      color: #1a1a1a; 
      margin-bottom: 8px; 
      display: flex; 
      justify-content: space-between; 
      align-items: center;
    }
    .rot-field-label span { font-size: 11px; color: #666; font-weight: 600; }
    .rot-slider { 
      width: 100%; 
      accent-color: #FFD700; 
      cursor: pointer; 
      -webkit-appearance: none; 
      appearance: none; 
      height: 5px; 
      background: #e5e5e5; 
      border-radius: 3px; 
      outline: none;
    }
    .rot-slider::-webkit-slider-thumb { 
      -webkit-appearance: none; 
      appearance: none; 
      width: 20px; 
      height: 20px; 
      border-radius: 50%; 
      background: #FFD700; 
      cursor: pointer; 
      box-shadow: 0 2px 6px rgba(255,215,0,0.4);
      border: 3px solid #fff;
    }
    .rot-slider::-moz-range-thumb { 
      width: 20px; 
      height: 20px; 
      border-radius: 50%; 
      background: #FFD700; 
      cursor: pointer; 
      border: 3px solid #fff; 
      box-shadow: 0 2px 6px rgba(255,215,0,0.4);
    }
    .rot-slider::-webkit-slider-runnable-track { 
      height: 5px; 
      border-radius: 3px; 
      background: #e5e5e5;
    }
    .rot-value { 
      font-size: 19px; 
      font-weight: 800; 
      color: #000; 
      margin-top: 5px; 
      letter-spacing: -0.03em;
    }
    .rot-result-box { 
      background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); 
      border: 2px solid #FFD700;
      border-radius: 14px; 
      padding: 18px; 
      margin: 16px 0; 
      text-align: center;
    }
    .rot-result-label { 
      font-size: 11px; 
      color: rgba(255,215,0,0.8); 
      margin-bottom: 8px; 
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .rot-result-amount { 
      font-size: 32px; 
      font-weight: 800; 
      color: #fff; 
      letter-spacing: -0.03em;
    }
    .rot-result-sub { 
      font-size: 11px; 
      color: rgba(255,255,255,0.6); 
      margin-top: 6px;
      font-weight: 500;
    }
    .rot-breakdown { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
    .rot-stat { 
      background: #fff; 
      border-radius: 10px; 
      padding: 12px 14px; 
      border: 1px solid #e5e5e5;
    }
    .rot-stat-label { 
      font-size: 10px; 
      color: #666; 
      font-weight: 700; 
      text-transform: uppercase; 
      letter-spacing: 0.07em;
    }
    .rot-stat-val { 
      font-size: 16px; 
      font-weight: 800; 
      color: #000; 
      margin-top: 4px;
      letter-spacing: -0.01em;
    }

    /* CASE */
    .case-card { 
      background: #fff; 
      border: 1px solid #e5e5e5; 
      border-radius: 12px; 
      margin-bottom: 12px; 
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .case-header { 
      padding: 16px 16px 12px; 
      display: flex; 
      align-items: center; 
      gap: 12px;
    }
    .case-badge { 
      width: 42px; 
      height: 42px; 
      border-radius: 12px; 
      background: #f8f8f8; 
      border: 1px solid #e5e5e5;
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-size: 20px; 
      flex-shrink: 0;
    }
    .case-title { font-size: 13px; font-weight: 800; color: #000; }
    .case-industry { font-size: 11px; color: #666; margin-top: 2px; font-weight: 500; }
    .case-steps { 
      padding: 0 16px 16px; 
      display: flex; 
      flex-direction: column;
    }
    .case-step { 
      display: flex; 
      align-items: flex-start; 
      padding: 8px 0; 
      border-top: 1px solid #f0f0f0;
    }
    .case-step:first-child { border-top: none; padding-top: 0; }
    .case-arrow { 
      font-size: 13px; 
      color: #FFD700; 
      flex-shrink: 0; 
      margin-top: 2px; 
      margin-right: 12px;
      font-weight: 600;
    }
    .case-step-text { 
      font-size: 12px; 
      color: #1a1a1a; 
      line-height: 1.5;
      font-weight: 500;
    }
    .case-result { 
      display: flex; 
      align-items: center; 
      background: #f0fdf4; 
      border-radius: 10px; 
      padding: 10px 14px; 
      margin: 0 16px 16px;
    }
    .case-result-icon { 
      font-size: 16px; 
      flex-shrink: 0; 
      margin-right: 10px;
    }
    .case-result-text { 
      font-size: 11.5px; 
      font-weight: 700; 
      color: #166534; 
      line-height: 1.5;
    }

    /* LEAD SUMMARY */
    .lead-summary { 
      display: flex; 
      align-items: center; 
      gap: 12px; 
      background: #fff; 
      border: 1px solid #e5e5e5; 
      border-radius: 12px; 
      padding: 12px 14px; 
      margin-bottom: 16px;
    }
    .lead-summary-chips { display: flex; gap: 7px; flex-wrap: wrap; flex: 1; }
    .lead-chip { 
      background: #f8f8f8; 
      border: 1px solid #e5e5e5;
      border-radius: 20px; 
      padding: 5px 12px; 
      font-size: 10.5px; 
      font-weight: 700; 
      color: #000;
    }
    .lead-edit { 
      font-size: 11px; 
      color: #FFD700; 
      cursor: pointer; 
      font-weight: 700; 
      white-space: nowrap; 
      flex-shrink: 0;
    }
    .lead-edit:hover { opacity: 0.7; }

    /* CTA BUTTON */
    .awj-btn { 
      display: block; 
      width: 100%; 
      padding: 14px; 
      border: none; 
      border-radius: 12px; 
      font-size: 13.5px; 
      font-weight: 800; 
      cursor: pointer; 
      text-align: center; 
      transition: all 0.2s; 
      letter-spacing: -0.01em;
    }
    .awj-btn:active { transform: scale(0.98); }
    .awj-btn-primary { 
      background: #000; 
      color: #FFD700;
      border: 2px solid #FFD700;
    }
    .awj-btn-primary:hover { 
      background: #1a1a1a;
      box-shadow: 0 4px 12px rgba(255,215,0,0.3);
    }
    .awj-btn-gold { 
      background: #FFD700; 
      color: #000;
    }
    .awj-btn-gold:hover { 
      background: #ffd000;
      box-shadow: 0 4px 12px rgba(255,215,0,0.4);
    }
    .awj-btn-outline { 
      background: transparent; 
      color: #000; 
      border: 2px solid #e5e5e5;
    }
    .awj-btn-outline:hover { 
      border-color: #FFD700; 
      background: #fffef5;
    }
    .awj-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* SENDING STATE */
    .send-state { 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      gap: 10px; 
      padding: 12px; 
      font-size: 12.5px; 
      font-weight: 700; 
      color: #4ade80;
    }
    .send-spinner { 
      width: 16px; 
      height: 16px; 
      border-radius: 50%; 
      border: 2px solid rgba(74,222,128,0.3); 
      border-top-color: #4ade80; 
      animation: awj-spin 0.7s linear infinite;
    }
    @keyframes awj-spin { to { transform: rotate(360deg); } }

    /* FAQ */
    .faq-item { 
      border: 1px solid #e5e5e5; 
      border-radius: 12px; 
      margin-bottom: 10px; 
      overflow: hidden; 
      background: #fff;
    }
    .faq-q { 
      width: 100%; 
      text-align: left; 
      background: none; 
      border: none; 
      padding: 14px 16px; 
      cursor: pointer; 
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      font-size: 13px; 
      font-weight: 700; 
      color: #000; 
      transition: background 0.15s; 
      gap: 12px;
    }
    .faq-q:hover { background: #f8f8f8; }
    .faq-chevron { 
      flex-shrink: 0; 
      transition: transform 0.2s; 
      color: #666; 
      font-size: 15px;
    }
    .faq-item.open .faq-chevron { transform: rotate(180deg); }
    .faq-a { 
      display: none; 
      padding: 0 16px 14px; 
      font-size: 12px; 
      font-weight: 500; 
      color: #1a1a1a; 
      line-height: 1.65; 
      border-top: 1px solid #f0f0f0; 
      padding-top: 12px;
    }
    .faq-item.open .faq-a { display: block; }

    /* PRICING */
    .price-toggle { 
      display: flex; 
      background: #f0f0f0; 
      border-radius: 10px; 
      padding: 4px; 
      margin-bottom: 16px; 
      gap: 4px;
    }
    .price-toggle-btn { 
      flex: 1; 
      padding: 8px; 
      border: none; 
      background: transparent; 
      border-radius: 8px; 
      font-size: 12px; 
      font-weight: 700; 
      color: #666; 
      cursor: pointer; 
      transition: all 0.2s;
    }
    .price-toggle-btn.active { 
      background: #000; 
      color: #FFD700;
    }
    .price-set { display: none; }
    .price-set.active { display: block; }
    .price-card { 
      background: #fff; 
      border: 1px solid #e5e5e5; 
      border-radius: 14px; 
      padding: 16px; 
      margin-bottom: 12px;
    }
    .price-card.featured { 
      border-color: #FFD700; 
      border-width: 2px;
      box-shadow: 0 4px 12px rgba(255,215,0,0.15);
    }
    .price-badge { 
      display: inline-block; 
      font-size: 9.5px; 
      font-weight: 800; 
      background: #FFD700; 
      color: #000; 
      padding: 4px 10px; 
      border-radius: 20px; 
      margin-bottom: 10px; 
      letter-spacing: 0.06em;
    }
    .price-tier { 
      font-size: 10px; 
      font-weight: 800; 
      color: #666; 
      text-transform: uppercase; 
      letter-spacing: 0.12em; 
      margin-bottom: 3px;
    }
    .price-name { 
      font-size: 17px; 
      font-weight: 800; 
      color: #000; 
      margin-bottom: 8px;
    }
    .price-amount { 
      font-size: 20px; 
      font-weight: 800; 
      color: #000; 
      letter-spacing: -0.02em;
    }
    .price-amount span { 
      font-size: 12px; 
      font-weight: 500; 
      color: #666;
    }
    .price-features { 
      margin-top: 12px; 
      display: flex; 
      flex-direction: column; 
      gap: 6px;
    }
    .price-feature { 
      font-size: 12px; 
      font-weight: 500; 
      color: #1a1a1a; 
      display: flex; 
      align-items: flex-start; 
      gap: 8px; 
      line-height: 1.5;
    }
    .price-feature::before { 
      content: '⚡'; 
      font-size: 12px; 
      flex-shrink: 0; 
      margin-top: 1px;
    }
    .price-cta { 
      display: block; 
      width: 100%; 
      margin-top: 14px; 
      padding: 12px; 
      background: #000; 
      color: #FFD700; 
      border: 2px solid #FFD700; 
      border-radius: 10px; 
      font-size: 13px; 
      font-weight: 800; 
      cursor: pointer; 
      text-align: center; 
      transition: all 0.2s;
    }
    .price-cta:hover { 
      background: #1a1a1a;
      box-shadow: 0 4px 12px rgba(255,215,0,0.3);
    }
    .price-card.featured .price-cta { 
      background: #FFD700; 
      color: #000;
      border-color: #FFD700;
    }
    .price-card.featured .price-cta:hover { 
      background: #ffd000;
      box-shadow: 0 4px 12px rgba(255,215,0,0.4);
    }

    /* CONTACT */
    .contact-card { 
      background: #fff; 
      border: 1px solid #e5e5e5; 
      border-radius: 12px; 
      padding: 16px; 
      margin-bottom: 10px;
    }
    .contact-head { 
      display: flex; 
      align-items: center; 
      gap: 12px; 
      margin-bottom: 12px;
    }
    .contact-av { 
      width: 42px; 
      height: 42px; 
      border-radius: 50%; 
      background: #000; 
      border: 2px solid #FFD700;
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-size: 16px; 
      font-weight: 800; 
      color: #FFD700; 
      flex-shrink: 0;
    }
    .contact-name { 
      font-size: 14px; 
      font-weight: 800; 
      color: #000;
    }
    .contact-role { 
      font-size: 11px; 
      color: #666;
      font-weight: 500;
    }
    .contact-links { 
      display: flex; 
      flex-direction: column; 
      gap: 5px;
    }
    .contact-link { 
      display: flex; 
      align-items: center; 
      gap: 10px; 
      font-size: 12.5px; 
      color: #1a1a1a; 
      text-decoration: none; 
      padding: 9px 10px; 
      border-radius: 8px; 
      transition: background 0.15s;
      font-weight: 500;
    }
    .contact-link:hover { 
      background: #f8f8f8; 
      color: #000;
    }

    /* CHAT */
    #awj-chat zapier-interfaces-chatbot-embed { 
      flex: 1; 
      width: 100% !important; 
      height: 100% !important; 
      border: none; 
      display: block;
    }

    /* NUDGE BANNER */
    #awj-nudge-banner { 
      display: none; 
      background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); 
      border: 2px solid #FFD700;
      border-radius: 12px; 
      padding: 12px 14px; 
      margin: 0 0 12px; 
      align-items: center; 
      justify-content: space-between;
    }
    #awj-nudge-banner.show { 
      display: flex; 
      animation: awjSlideIn 0.3s ease forwards;
    }
    .nudge-banner-text { 
      font-size: 11.5px; 
      color: #fff; 
      font-weight: 600; 
      line-height: 1.5; 
      flex: 1;
    }
    .nudge-banner-btn { 
      background: #FFD700; 
      border: none; 
      border-radius: 8px; 
      padding: 7px 13px; 
      font-size: 11px; 
      font-weight: 800; 
      color: #000; 
      cursor: pointer; 
      white-space: nowrap; 
      margin-left: 12px; 
      font-family: 'Inter', sans-serif !important; 
      transition: opacity 0.15s; 
      flex-shrink: 0;
    }
    .nudge-banner-btn:hover { opacity: 0.85; }
    .nudge-banner-x { 
      color: rgba(255,215,0,0.5); 
      font-size: 15px; 
      cursor: pointer; 
      margin-left: 10px; 
      background: none; 
      border: none; 
      line-height: 1; 
      padding: 0; 
      flex-shrink: 0;
    }
    .nudge-banner-x:hover { color: #FFD700; }

    /* TOOLTIP */
    #awj-tooltip { 
      position: fixed; 
      bottom: 100px; 
      right: 24px; 
      background: #000; 
      color: #fff; 
      padding: 16px 20px 16px 16px; 
      border-radius: 16px 16px 4px 16px; 
      border: 2px solid #FFD700;
      font-size: 14px; 
      font-weight: 600; 
      line-height: 1.6; 
      max-width: 280px; 
      cursor: pointer; 
      box-shadow: 0 6px 24px rgba(0,0,0,0.3), 0 0 0 4px rgba(255,215,0,0.1); 
      opacity: 0; 
      transform: translateY(10px) scale(0.95); 
      transition: opacity 0.3s ease, transform 0.3s ease; 
      z-index: 9999; 
      pointer-events: all;
    }
    #awj-tooltip.show { 
      opacity: 1; 
      transform: translateY(0) scale(1);
    }
    #awj-tooltip::after { 
      content: ''; 
      position: absolute; 
      bottom: -10px; 
      right: 22px; 
      border-left: 10px solid transparent; 
      border-right: 10px solid transparent; 
      border-top: 10px solid #FFD700;
    }
    #awj-tooltip-close { 
      position: absolute; 
      top: 8px; 
      right: 10px; 
      background: none; 
      border: none; 
      color: rgba(255,215,0,0.5); 
      cursor: pointer; 
      font-size: 14px; 
      line-height: 1; 
      padding: 0;
    }
    #awj-tooltip-close:hover { color: #FFD700; }

    /* FOOTER */
    .awj-footer { 
      padding: 12px 16px; 
      border-top: 1px solid #e5e5e5; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      flex-shrink: 0; 
      background: #fff;
    }
    .awj-footer a { 
      font-size: 11px; 
      color: #666; 
      text-decoration: none; 
      display: flex; 
      align-items: center; 
      gap: 6px; 
      font-weight: 600; 
      transition: opacity 0.15s;
    }
    .awj-footer a:hover { opacity: 0.6; }
    .awj-pdot { 
      width: 6px; 
      height: 6px; 
      border-radius: 50%; 
      background: #FFD700; 
      display: inline-block;
    }
  `;
  document.head.appendChild(style);

  // ─────────────────────────────────────────────────────────────────────────
  //  SERVICE DATA (AWJ-specific)
  // ─────────────────────────────────────────────────────────────────────────
  var serviceData = {
    belysning: {
      label: 'Belysning & Ljusdesign', icon: '💡',
      cases: [
        {
          title: 'Smart hembelysning',
          steps: [
            'Kartläggning av befintlig belysning',
            'Design av ljusplan med energieffektiva LED-lösningar',
            'Installation av smarta switchar & dimmer',
            'Integrering med app-styrning (Philips Hue, IKEA TRÅDFRI)'
          ],
          result: 'Sparar upp till 60% el + fullständig kontroll via mobil'
        },
        {
          title: 'Fastighetsutemiljö',
          steps: [
            'Utvändig belysning för BRF/fastighet',
            'Säkerhetsbelysning med rörelsesensorer',
            'Landskap & trädgårdsbelysning',
            'Tidsstyrning & energioptimering'
          ],
          result: 'Ökad trygghet & 40% lägre driftskostnad'
        }
      ]
    },
    smarta_hem: {
      label: 'Smarta Hem', icon: '🏠',
      cases: [
        {
          title: 'Heltäckande smart home-system',
          steps: [
            'Centraliserad styrning av belysning, värme & larm',
            'Röststyrning via Google Home / Alexa',
            'Automationer: morgonrutin, bortaläge, nattläge',
            'Energiövervakning & statistik'
          ],
          result: 'Sparar 15-20% energi + maximal bekvämlighet'
        },
        {
          title: 'ROT-smart paket',
          steps: [
            'Installation av smarta uttag & switchar',
            'WiFi-förstärkning & nätverk',
            'Integration med befintliga system',
            'Utbildning & support'
          ],
          result: '30% ROT-avdrag direkt på fakturan'
        }
      ]
    },
    energi: {
      label: 'Energieffektivisering', icon: '🔋',
      cases: [
        {
          title: 'Fastighetsenergikartläggning',
          steps: [
            'Mätning av energiförbrukning per enhet',
            'Identifiering av energiläckage',
            'LED-uppgradering & rörelsestyrning',
            'Installation av energimätare'
          ],
          result: 'Upp till 50% lägre elräkning första året'
        },
        {
          title: 'Solcellsinstallation',
          steps: [
            'Analys av tak & solläge',
            'Dimensionering av solcellssystem',
            'Installation & nätanslutning',
            'Övervakning & ROI-rapportering'
          ],
          result: 'Breakeven ca 8-10 år, 25 års livslängd'
        }
      ]
    },
    entreprad: {
      label: 'Entreprenad & ROT', icon: '🏗️',
      cases: [
        {
          title: 'Totalrenovering lägenhet',
          steps: [
            'Omdragning av el enligt nya elsäkerhetskrav',
            'Installation av gruppcentral & jordfelsbrytare',
            'Ny belysning i kök, badrum & vardagsrum',
            'ROT-avdrag hanteras av oss'
          ],
          result: 'Säkrare el + 30% kostnadsminskning via ROT'
        },
        {
          title: 'BRF stamrenovering',
          steps: [
            'Projektering & offert till styrelse',
            'Etappvis renovering per våningsplan',
            'Uppgradering till moderna elsystem',
            'Garantier & dokumentation'
          ],
          result: 'Modern elsäkerhet i hela fastigheten'
        }
      ]
    },
    foretag: {
      label: 'Företag & Fastighet', icon: '🏢',
      cases: [
        {
          title: 'Kontorselektrik & nätverk',
          steps: [
            'Planering av eluttag & datanät',
            'Installation strukturerad kabling (Cat6/7)',
            'Belysningsstyrning & närvarodetektering',
            'Nödbelysning & säkerhet enligt BBR'
          ],
          result: 'Komplett IT-infrastruktur på plats'
        },
        {
          title: 'Serviceavtal fastighetsdrift',
          steps: [
            'Regelbundna elbesiktningar',
            'Akut jour 24/7',
            'Förebyggande underhåll',
            'Fast månadskostnad'
          ],
          result: 'Inga elfel utan varning — trygg drift'
        }
      ]
    },
    sakerhet: {
      label: 'Säkerhet & Larm', icon: '🔒',
      cases: [
        {
          title: 'Komplett larmsystem',
          steps: [
            'Rörelsedetektorer & dörrkontakter',
            'App-styrning & notiser',
            'Koppling till larmcentral (valfritt)',
            'Kameraövervakning inomhus/utomhus'
          ],
          result: 'Fullständig trygghet dygnet runt'
        },
        {
          title: 'Brandskydd & utrymning',
          steps: [
            'Installation brandvarnare & koldioxidvarnare',
            'Utrymningsbelysning enligt BBR',
            'Serviceavtal för årlig kontroll',
            'Dokumentation & attest'
          ],
          result: 'Uppfyller alla myndighetskrav'
        }
      ]
    },
    ovrigt: {
      label: 'Annat Eljobb', icon: '⚡',
      cases: [
        {
          title: 'Akuta elarbeten',
          steps: [
            'Felavhjälpning & felsökning',
            'Byte av säkringar & jordfelsbrytare',
            'Akutjour inom 2 timmar',
            'Säker & certifierad elektriker'
          ],
          result: 'Snabb hjälp när det behövs som mest'
        },
        {
          title: 'Laddbox för elbil',
          steps: [
            'Dimensionering av laddeffekt (3,7-22 kW)',
            'Installation & inkoppling',
            'App-styrning & laddstatistik',
            'ROT-avdrag 30% på arbetet'
          ],
          result: 'Ladda bilen hemma — enkelt & billigt'
        }
      ]
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  HTML STRUKTUR
  // ─────────────────────────────────────────────────────────────────────────
  var wrap = document.createElement('div');
  wrap.id = 'awj-widget-container';
  wrap.style.cssText = 'position:fixed;bottom:0;right:0;width:0;height:0;overflow:visible;z-index:9997;';
  wrap.innerHTML = `
    <button id="awj-launcher" onclick="awjToggle()" aria-label="Öppna support">
      <svg class="awj-chat" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
      <svg class="awj-close" style="display:none" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>

    <div id="awj-widget">
      <div class="awj-header" id="awj-header">
        <div class="awj-header-left">
          <button class="awj-back" id="awj-back" onclick="awjGoHome()">‹</button>
          <div class="awj-logo">
            <img src="https://awjelteknik.se/wp-content/uploads/2023/10/AWJ_Elteknik_svart.png" alt="AWJ Elteknik" class="awj-logo-img" />
          </div>
          <div class="awj-divider"></div>
          <div class="awj-header-sub">
            <div class="awj-title" id="awj-header-title">Elektriker Stockholm</div>
            <div class="awj-status"><span class="awj-dot"></span><span class="awj-status-text">Online</span></div>
          </div>
        </div>
      </div>
      <div class="awj-progress" id="awj-progress" style="display:none"><div class="awj-progress-fill" id="awj-progress-fill" style="width:0%"></div></div>

      <div class="awj-content">

        <!-- HOME -->
        <div class="awj-screen active" id="awj-home">
          <div class="home-body">
            <div id="awj-nudge-banner">
              <span class="nudge-banner-text">Vill du se vad ROT-avdraget kan spara dig?</span>
              <button class="nudge-banner-btn" onclick="awjNudgeCTA()">Beräkna →</button>
              <button class="nudge-banner-x" onclick="awjHideNudgeBanner()">✕</button>
            </div>
            <div class="home-greeting">Välkommen! Hur kan vi hjälpa dig idag? Välj en tjänst eller chatta direkt med oss.</div>
            <div class="home-grid">
              <div class="home-card wide" onclick="awjNav('awj-chat','Chatta med oss')">
                <div class="card-icon-wrap"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></div>
                <div><div class="card-label">Chatta med oss</div><div class="card-sub">Svar direkt från elektriker</div></div>
                <div class="wide-arrow">›</div>
              </div>

              <!-- ROT CALCULATOR CARD -->
              <div class="home-card rot-card" onclick="awjStartFlow()">
                <div class="card-icon-wrap"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
                <div><div class="card-label">Beräkna ROT-avdrag</div><div class="card-sub">Se vad du sparar</div></div>
                <div class="wide-arrow">›</div>
              </div>

              <div class="home-card" onclick="awjNav('awj-faq','Vanliga frågor')">
                <div class="card-icon-wrap"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
                <div class="card-label">Vanliga frågor</div><div class="card-sub">Snabba svar</div>
              </div>
              <div class="home-card" onclick="awjNav('awj-booking','Boka besiktning')">
                <div class="card-icon-wrap"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                <div class="card-label">Boka besiktning</div><div class="card-sub">Kostnadsfri</div>
              </div>
              <div class="home-card" onclick="awjNav('awj-pricing','Priser')">
                <div class="card-icon-wrap"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></div>
                <div class="card-label">Priser</div><div class="card-sub">Från 995 kr</div>
              </div>
              <div class="home-card" onclick="awjNav('awj-contact','Kontakt')">
                <div class="card-icon-wrap"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
                <div class="card-label">Ring oss</div><div class="card-sub">073-577 93 02</div>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 1: QUALIFY (Tjänsteväljare) -->
        <div class="awj-screen" id="awj-qualify">
          <div class="inner-body">
            <div class="step-indicator">
              <div class="step-dot active" id="sdot-1"></div>
              <div class="step-dot" id="sdot-2"></div>
              <div class="step-dot" id="sdot-3"></div>
              <span class="step-label">Steg 1 av 3</span>
            </div>
            <div class="inner-title">Berätta vad du behöver</div>
            <div class="inner-sub">Vi anpassar beräkningen efter din typ av arbete</div>

            <div class="section-label">Typ av arbete</div>
            <div class="chip-grid" id="service-chips">
              <div class="chip" onclick="awjSelectChip('service','belysning',this)"><div class="chip-icon">💡</div><div class="chip-label">Belysning</div></div>
              <div class="chip" onclick="awjSelectChip('service','smarta_hem',this)"><div class="chip-icon">🏠</div><div class="chip-label">Smarta Hem</div></div>
              <div class="chip" onclick="awjSelectChip('service','energi',this)"><div class="chip-icon">🔋</div><div class="chip-label">Energi</div></div>
              <div class="chip" onclick="awjSelectChip('service','entreprad',this)"><div class="chip-icon">🏗️</div><div class="chip-label">Entreprenad</div></div>
              <div class="chip" onclick="awjSelectChip('service','foretag',this)"><div class="chip-icon">🏢</div><div class="chip-label">Företag</div></div>
              <div class="chip" onclick="awjSelectChip('service','sakerhet',this)"><div class="chip-icon">🔒</div><div class="chip-label">Säkerhet</div></div>
              <div class="chip" onclick="awjSelectChip('service','ovrigt',this)" style="grid-column: span 2;"><div class="chip-icon">⚡</div><div class="chip-label">Annat eljobb</div></div>
            </div>

            <div class="section-label" style="margin-top:14px;">Typ av bostad/fastighet</div>
            <div class="chip-grid" id="property-chips">
              <div class="chip" onclick="awjSelectChip('property','apartment',this)"><div class="chip-label">Lägenhet</div></div>
              <div class="chip" onclick="awjSelectChip('property','house',this)"><div class="chip-label">Villa</div></div>
              <div class="chip" onclick="awjSelectChip('property','brf',this)"><div class="chip-label">BRF</div></div>
              <div class="chip" onclick="awjSelectChip('property','commercial',this)"><div class="chip-label">Företag</div></div>
            </div>

            <div class="section-label" style="margin-top:14px;">Din kontaktinfo</div>
            <div class="awj-input-wrap">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input type="email" id="qualify-email" class="awj-input" placeholder="din@email.se" oninput="awjCheckQualify()" />
            </div>
            <div class="awj-input-wrap">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <input type="tel" id="qualify-phone" class="awj-input" placeholder="073-123 45 67" oninput="awjCheckQualify()" />
            </div>

            <button class="awj-btn awj-btn-primary" id="qualify-next-btn" onclick="awjQualifyNext()" disabled style="margin-top:16px;">Nästa →</button>
          </div>
        </div>

        <!-- STEP 2: ROT CALCULATOR -->
        <div class="awj-screen" id="awj-rot">
          <div class="inner-body">
            <div class="step-indicator">
              <div class="step-dot done"></div>
              <div class="step-dot active"></div>
              <div class="step-dot"></div>
              <span class="step-label">Steg 2 av 3</span>
            </div>
            <div class="inner-title">Beräkna ditt ROT-avdrag</div>
            <div class="inner-sub">Dra i reglagen — vi räknar automatiskt</div>

            <div class="rot-field">
              <div class="rot-field-label">Uppskattat arbetspris (exkl. moms) <span id="rot-labor-label">10 000 kr</span></div>
              <input type="range" class="rot-slider" id="rot-labor" min="2000" max="100000" step="1000" value="10000" oninput="awjCalcROT()">
            </div>
            <div class="rot-field">
              <div class="rot-field-label">Material & utrustning <span id="rot-material-label">5 000 kr</span></div>
              <input type="range" class="rot-slider" id="rot-material" min="0" max="50000" step="1000" value="5000" oninput="awjCalcROT()">
            </div>

            <div class="rot-result-box">
              <div class="rot-result-label">Du sparar med ROT-avdrag (30%)</div>
              <div class="rot-result-amount" id="rot-result">3 000 kr</div>
              <div class="rot-result-sub" id="rot-result-sub">ROT-avdrag dras direkt på fakturan</div>
            </div>

            <div class="rot-breakdown">
              <div class="rot-stat"><div class="rot-stat-label">Totalkostnad</div><div class="rot-stat-val" id="rot-total">15 000 kr</div></div>
              <div class="rot-stat"><div class="rot-stat-label">Du betalar</div><div class="rot-stat-val" id="rot-pay">12 000 kr</div></div>
            </div>

            <div style="background:#f0fdf4;border-radius:12px;padding:14px;margin-bottom:16px;border:1px solid #4ade80;">
              <div style="font-size:11px;font-weight:700;color:#166534;margin-bottom:6px;display:flex;align-items:center;gap:8px;">
                <span style="font-size:16px;">✅</span> ROT-avdrag gäller vid:
              </div>
              <div style="font-size:11px;color:#1a5c1a;line-height:1.6;">
                • Elarbeten i bostad (lägenhet/villa)<br>
                • Installation & ombyggnad<br>
                • Material ingår inte i avdrag
              </div>
            </div>

            <button class="awj-btn awj-btn-gold" onclick="awjRotNext()">Se exempel på elarbeten →</button>
          </div>
        </div>

        <!-- STEP 3: CASE EXAMPLES -->
        <div class="awj-screen" id="awj-case">
          <div class="inner-body">
            <div class="step-indicator">
              <div class="step-dot done"></div>
              <div class="step-dot done"></div>
              <div class="step-dot active"></div>
              <span class="step-label">Steg 3 av 3</span>
            </div>
            <div class="inner-title" id="case-title">Så här kan det se ut</div>
            <div class="inner-sub">Verkliga projekt vi gör för kunder</div>

            <div id="case-summary"></div>
            <div id="case-cards"></div>

            <div style="background:#000;border:2px solid #FFD700;border-radius:14px;padding:18px;margin-top:6px;">
              <div style="font-size:12px;color:rgba(255,215,0,0.8);margin-bottom:14px;line-height:1.6;font-weight:600;">
                Vi kontaktar dig inom 24 timmar för kostnadsfri besiktning och exakt offert.
              </div>
              <div id="case-cta-area">
                <button class="awj-btn awj-btn-gold" onclick="awjBookWithData()">Skicka in förfrågan →</button>
              </div>
            </div>
          </div>
        </div>

        <!-- CHAT -->
        <div class="awj-screen" id="awj-chat">
          <zapier-interfaces-chatbot-embed is-popup="false" chatbot-id="LÄGG_IN_DITT_ZAPIER_CHATBOT_ID_HÄR" height="100%" width="100%"></zapier-interfaces-chatbot-embed>
        </div>

        <!-- FAQ -->
        <div class="awj-screen" id="awj-faq">
          <div class="inner-body">
            <div class="inner-title">Vanliga frågor</div>
            <div class="faq-item"><button class="faq-q" onclick="awjFaq(this)">Vad kostar en elektriker i Stockholm? <svg class="faq-chevron" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button><div class="faq-a">Timpriset varierar mellan 750–1200 kr exkl. moms beroende på uppdragets omfattning. Vi ger alltid fast pris eller timpris + ROT-avdrag direkt i offerten.</div></div>
            <div class="faq-item"><button class="faq-q" onclick="awjFaq(this)">Hur fungerar ROT-avdraget? <svg class="faq-chevron" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button><div class="faq-a">Du får 30% avdrag på arbetskostnaden (inte material). Vi drar av direkt på fakturan och sköter allt mot Skatteverket. Avdraget gäller för dig som bor i Sverige och är skattskyldig här.</div></div>
            <div class="faq-item"><button class="faq-q" onclick="awjFaq(this)">Har ni jour & akutservice? <svg class="faq-chevron" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button><div class="faq-a">Ja, ring Kenny på 073-577 93 02 vid akuta elfel. Vi har jour 24/7 och kan oftast vara på plats inom 2 timmar i Stockholmsområdet.</div></div>
            <div class="faq-item"><button class="faq-q" onclick="awjFaq(this)">Vilka områden täcker ni? <svg class="faq-chevron" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button><div class="faq-a">Vi jobbar i hela Stockholms län — från innerstan till förorter som Lidingö, Nacka, Solna, Sundbyberg, Täby och Huddinge. Kontakta oss för andra orter.</div></div>
            <div class="faq-item"><button class="faq-q" onclick="awjFaq(this)">Är ni godkända & certifierade? <svg class="faq-chevron" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button><div class="faq-a">Ja, alla våra elektriker är auktoriserade enligt Elsäkerhetsverket. Vi utfärdar alltid elinstallationsrapport och elsäkerhetsintyg efter avslutade arbeten.</div></div>
            <div class="faq-item"><button class="faq-q" onclick="awjFaq(this)">Kan jag få offert innan jag bestämmer mig? <svg class="faq-chevron" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button><div class="faq-a">Absolut! Vi gör kostnadsfri besiktning och ger dig ett transparent prisförslag innan något arbete påbörjas. Inga dolda avgifter.</div></div>
            <div class="faq-item"><button class="faq-q" onclick="awjFaq(this)">Hur lång tid tar en elinstallation? <svg class="faq-chevron" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button><div class="faq-a">Mindre arbeten (uttag, strömbrytare) tar 1-2 timmar. Större projekt som stamrenovering eller smarta hem-installationer tar 2-5 dagar. Vi ger alltid en tidsplan i offerten.</div></div>
          </div>
        </div>

        <!-- BOOKING -->
        <div class="awj-screen" id="awj-booking">
          <div class="inner-body" style="display:flex;flex-direction:column;gap:14px;">
            <div class="inner-title">Boka besiktning</div>
            <div style="background:#fff;border:2px solid #FFD700;border-radius:14px;padding:20px;text-align:center;">
              <div style="width:52px;height:52px;border-radius:14px;background:#000;border:2px solid #FFD700;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
              <div style="font-size:15px;font-weight:800;color:#000;margin-bottom:8px;">Kostnadsfri besiktning</div>
              <div style="font-size:12px;color:#666;margin-bottom:18px;line-height:1.6;">Vi kommer hem till dig, kollar jobbet och ger fast prisförslag — helt utan kostnad.</div>
              <button onclick="awjOpenCalendlyPopup()" style="width:100%;padding:14px;background:#000;color:#FFD700;border:2px solid #FFD700;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;transition:all 0.2s;font-family:'Inter',sans-serif;" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='#000'">Välj tid →</button>
            </div>
            <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:16px;">
              <div style="font-size:11px;font-weight:800;color:#666;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">Vad händer sen?</div>
              <div style="display:flex;flex-direction:column;gap:10px;">
                <div style="display:flex;align-items:center;gap:12px;font-size:12px;color:#1a1a1a;font-weight:500;"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> Vi besiktigar & mäter upp arbetet</div>
                <div style="display:flex;align-items:center;gap:12px;font-size:12px;color:#1a1a1a;font-weight:500;"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> Du får offert med ROT-avdrag inkluderat</div>
                <div style="display:flex;align-items:center;gap:12px;font-size:12px;color:#1a1a1a;font-weight:500;"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> Inga dolda kostnader eller bindning</div>
              </div>
            </div>
          </div>
        </div>

        <!-- PRICING -->
        <div class="awj-screen" id="awj-pricing">
          <div class="inner-body">
            <div class="inner-title">Våra priser</div>
            <div class="price-toggle">
              <button class="price-toggle-btn active" onclick="awjPricingTab('service',this)">Service & Reparation</button>
              <button class="price-toggle-btn" onclick="awjPricingTab('projekt',this)">Projekt & Installation</button>
            </div>
            <div id="awj-price-service" class="price-set active">
              <div class="price-card"><div class="price-tier">Akut</div><div class="price-name">Jour & Akut</div><div class="price-amount">1 200 <span>kr / timme</span></div><div class="price-features"><div class="price-feature">Jour 24/7 hela veckan</div><div class="price-feature">På plats inom 2 timmar</div><div class="price-feature">Felavhjälpning & felsökning</div><div class="price-feature">ROT-avdrag 30% på arbetet</div></div><button class="price-cta" onclick="awjOpenCalendly()">Ring 073-577 93 02 →</button></div>
              <div class="price-card featured"><div class="price-badge">POPULÄRAST</div><div class="price-tier">Standard</div><div class="price-name">Service & Mindre jobb</div><div class="price-amount">995 <span>kr / timme</span></div><div class="price-features"><div class="price-feature">Elektriker inom 1-3 dagar</div><div class="price-feature">Uttag, strömbrytare, belysning</div><div class="price-feature">Felsökning & reparation</div><div class="price-feature">ROT-avdrag 30% direkt på fakturan</div></div><button class="price-cta" onclick="awjOpenCalendly()">Boka besiktning →</button></div>
              <div class="price-card"><div class="price-tier">Fastighet</div><div class="price-name">Serviceavtal</div><div class="price-amount">Offert <span>kontakta oss</span></div><div class="price-features"><div class="price-feature">Återkommande service & underhåll</div><div class="price-feature">Fast månadskostnad</div><div class="price-feature">Jour ingår</div><div class="price-feature">För BRF & företag</div></div><button class="price-cta" onclick="awjOpenCalendly()">Begär offert →</button></div>
            </div>
            <div id="awj-price-projekt" class="price-set">
              <div class="price-card"><div class="price-tier">Renovering</div><div class="price-name">ROT-projekt</div><div class="price-amount">Fast pris <span>per projekt</span></div><div class="price-features"><div class="price-feature">Omdragning el & ny elcentral</div><div class="price-feature">Kök, badrum, hela lägenheter</div><div class="price-feature">30% ROT-avdrag hanteras av oss</div><div class="price-feature">Elsäkerhetsintyg ingår</div></div><button class="price-cta" onclick="awjOpenCalendly()">Boka besiktning →</button></div>
              <div class="price-card featured"><div class="price-badge">REKOMMENDERAS</div><div class="price-tier">Premium</div><div class="price-name">Smarta hem & belysning</div><div class="price-amount">Fast pris <span>per projekt</span></div><div class="price-features"><div class="price-feature">Komplett smart home-lösning</div><div class="price-feature">LED-belysning & dimmer</div><div class="price-feature">App-styrning & automationer</div><div class="price-feature">30% ROT-avdrag</div></div><button class="price-cta" onclick="awjOpenCalendly()">Boka besiktning →</button></div>
              <div class="price-card"><div class="price-tier">Företag</div><div class="price-name">Näringsliv & Fastighet</div><div class="price-amount">Offert <span>kontakta oss</span></div><div class="price-features"><div class="price-feature">Kontorselektrik & belysning</div><div class="price-feature">Stamrenovering BRF</div><div class="price-feature">Nätverksinstallationer</div><div class="price-feature">Serviceavtal tillgängligt</div></div><button class="price-cta" onclick="awjOpenCalendly()">Begär offert →</button></div>
            </div>
          </div>
        </div>

        <!-- CONTACT -->
        <div class="awj-screen" id="awj-contact">
          <div class="inner-body">
            <div class="inner-title">Kontakta oss</div>
            <div class="contact-card">
              <div class="contact-head"><div class="contact-av">K</div><div><div class="contact-name">Kenny</div><div class="contact-role">Elektriker & VD</div></div></div>
              <div class="contact-links">
                <a href="tel:0735779302" class="contact-link"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>073-577 93 02</a>
                <a href="mailto:info@awjelteknik.se" class="contact-link"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>info@awjelteknik.se</a>
              </div>
            </div>
            <div class="contact-card">
              <div class="contact-head"><div class="contact-av">R</div><div><div class="contact-name">Robert</div><div class="contact-role">Elektriker</div></div></div>
              <div class="contact-links">
                <a href="tel:0709446968" class="contact-link"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>070-944 69 68</a>
              </div>
            </div>
            <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:16px;margin-top:4px;">
              <div style="font-size:11px;font-weight:800;color:#666;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">Besöksadress</div>
              <a href="https://maps.app.goo.gl/UzbLowJ9gzS4zm3M9" target="_blank" class="contact-link" style="padding:10px 12px;border:1px solid #e5e5e5;border-radius:8px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>Blackensvägen 14, 125 32 Älvsjö</a>
              <div style="margin-top:12px;padding-top:12px;border-top:1px solid #f0f0f0;">
                <a href="https://awjelteknik.se" target="_blank" class="contact-link" style="font-size:11.5px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>awjelteknik.se</a>
              </div>
            </div>
          </div>
        </div>

      </div><!-- /.awj-content -->

      <div class="awj-footer">
        <a href="https://awjelteknik.se" target="_blank">
          <span style="font-size:10.5px;font-weight:700;color:#999;letter-spacing:0.04em;">Powered By</span>
          <img src="https://awjelteknik.se/wp-content/uploads/2023/10/AWJ_Elteknik_svart.png" alt="AWJ Elteknik" style="height:20px;width:auto;display:block;" />
          <span class="awj-pdot"></span>
        </a>
      </div>
    </div><!-- /#awj-widget -->

    <div id="awj-tooltip" onclick="awjOpenFromTooltip()">
      <button id="awj-tooltip-close" onclick="event.stopPropagation();awjCloseTooltip()">✕</button>
      <span id="awj-tooltip-text"></span><span id="awj-tooltip-cursor" style="display:inline-block;width:1.5px;height:13px;background:rgba(255,215,0,0.9);margin-left:2px;vertical-align:middle;animation:awjBlink 0.8s step-end infinite;">​</span>
    </div>
  `;
  document.body.appendChild(wrap);

  // ─────────────────────────────────────────────────────────────────────────
  //  STATE
  // ─────────────────────────────────────────────────────────────────────────
  var leadData = { 
    service: null, 
    property: null, 
    email: '', 
    phone: '',
    rotLabor: 10000, 
    rotMaterial: 5000, 
    rotSaving: 0,
    rotTotal: 0,
    rotPay: 0
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  NAVIGATION
  // ─────────────────────────────────────────────────────────────────────────
  var expandScreens = ['awj-chat', 'awj-pricing', 'awj-qualify', 'awj-rot', 'awj-case'];

  function awjToggle() {
    document.getElementById('awj-widget').classList.toggle('visible');
    document.getElementById('awj-launcher').classList.toggle('open');
    awjCloseTooltip();
  }

  function awjSetTitle(text) {
    document.getElementById('awj-header-title').textContent = text;
  }

  function awjGoHome() {
    document.querySelectorAll('.awj-screen').forEach(function(s) { s.classList.remove('active','slide-in','slide-back'); });
    document.getElementById('awj-home').classList.add('active','slide-back');
    document.getElementById('awj-back').classList.remove('show');
    awjSetTitle('Elektriker Stockholm');
    document.getElementById('awj-widget').classList.remove('expanded');
    document.getElementById('awj-progress').style.display = 'none';
  }

  function awjNav(screenId, title) {
    document.querySelectorAll('.awj-screen').forEach(function(s) { s.classList.remove('active','slide-in'); });
    var el = document.getElementById(screenId);
    el.classList.add('active','slide-in');
    document.getElementById('awj-back').classList.add('show');
    awjSetTitle(title);
    document.getElementById('awj-widget').classList.toggle('expanded', expandScreens.indexOf(screenId) !== -1);
    document.getElementById('awj-progress').style.display = 'none';
  }

  function awjNavFlow(screenId, title, progressPct) {
    document.querySelectorAll('.awj-screen').forEach(function(s) { s.classList.remove('active','slide-in'); });
    document.getElementById(screenId).classList.add('active','slide-in');
    document.getElementById('awj-back').classList.add('show');
    awjSetTitle(title);
    document.getElementById('awj-widget').classList.toggle('expanded', expandScreens.indexOf(screenId) !== -1);
    var prog = document.getElementById('awj-progress');
    prog.style.display = 'block';
    document.getElementById('awj-progress-fill').style.width = progressPct + '%';
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  FLOW — START
  // ─────────────────────────────────────────────────────────────────────────
  function awjStartFlow() {
    leadData = { 
      service: null, 
      property: null, 
      email: '', 
      phone: '',
      rotLabor: 10000, 
      rotMaterial: 5000, 
      rotSaving: 0,
      rotTotal: 0,
      rotPay: 0
    };
    document.querySelectorAll('#service-chips .chip, #property-chips .chip').forEach(function(c){ c.classList.remove('selected'); });
    var emailEl = document.getElementById('qualify-email');
    var phoneEl = document.getElementById('qualify-phone');
    if (emailEl) emailEl.value = '';
    if (phoneEl) phoneEl.value = '';
    document.getElementById('qualify-next-btn').disabled = true;
    awjNavFlow('awj-qualify', 'ROT-kalkylator', 10);
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  STEP 1 — QUALIFY
  // ─────────────────────────────────────────────────────────────────────────
  function awjSelectChip(type, value, el) {
    var group = type === 'service' ? 'service-chips' : 'property-chips';
    document.querySelectorAll('#' + group + ' .chip').forEach(function(c){ c.classList.remove('selected'); });
    el.classList.add('selected');
    leadData[type] = value;
    awjCheckQualify();
  }

  function awjCheckQualify() {
    var email = (document.getElementById('qualify-email').value || '').trim();
    var phone = (document.getElementById('qualify-phone').value || '').trim();
    var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    var validPhone = phone.length >= 9;
    document.getElementById('qualify-next-btn').disabled = !(leadData.service && leadData.property && validEmail && validPhone);
  }

  function awjQualifyNext() {
    leadData.email = (document.getElementById('qualify-email').value || '').trim();
    leadData.phone = (document.getElementById('qualify-phone').value || '').trim();
    awjCalcROT();
    awjNavFlow('awj-rot', 'ROT-kalkylator', 45);
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  STEP 2 — ROT CALC
  // ─────────────────────────────────────────────────────────────────────────
  function awjCalcROT() {
    var labor = parseInt(document.getElementById('rot-labor').value);
    var material = parseInt(document.getElementById('rot-material').value);

    document.getElementById('rot-labor-label').textContent = labor.toLocaleString('sv-SE') + ' kr';
    document.getElementById('rot-material-label').textContent = material.toLocaleString('sv-SE') + ' kr';

    // ROT = 30% av arbetskostnaden (inte material)
    var rotSaving = Math.round(labor * 0.30);
    var total = labor + material;
    var pay = total - rotSaving;

    document.getElementById('rot-result').textContent = rotSaving.toLocaleString('sv-SE') + ' kr';
    document.getElementById('rot-result-sub').textContent = 'ROT-avdrag dras direkt på fakturan';
    document.getElementById('rot-total').textContent = total.toLocaleString('sv-SE') + ' kr';
    document.getElementById('rot-pay').textContent = pay.toLocaleString('sv-SE') + ' kr';

    leadData.rotLabor = labor;
    leadData.rotMaterial = material;
    leadData.rotSaving = rotSaving;
    leadData.rotTotal = total;
    leadData.rotPay = pay;
  }

  function awjRotNext() {
    awjBuildCaseScreen();
    awjNavFlow('awj-case', 'ROT-kalkylator', 90);
    awjSendToZapier();
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  STEP 3 — CASE SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  function awjBuildCaseScreen() {
    var data = serviceData[leadData.service] || serviceData['ovrigt'];

    // Summary chip bar
    var propertyLabel = {
      'apartment': 'Lägenhet',
      'house': 'Villa',
      'brf': 'BRF',
      'commercial': 'Företag'
    }[leadData.property] || leadData.property;

    var summaryHTML = '<div class="lead-summary"><div class="lead-summary-chips">'
      + '<span class="lead-chip">' + data.icon + ' ' + data.label + '</span>'
      + '<span class="lead-chip">🏠 ' + propertyLabel + '</span>'
      + '<span class="lead-chip">💰 ' + (leadData.rotSaving || 0).toLocaleString('sv-SE') + ' kr ROT</span>'
      + '</div><span class="lead-edit" onclick="awjStartFlow()">Ändra</span></div>';

    // Case cards
    var casesHTML = '';
    data.cases.forEach(function(c) {
      var stepsHTML = c.steps.map(function(s) {
        return '<div class="case-step"><span class="case-arrow">→</span><span class="case-step-text">' + s + '</span></div>';
      }).join('');
      casesHTML += '<div class="case-card">'
        + '<div class="case-header"><div class="case-badge">' + data.icon + '</div>'
        + '<div><div class="case-title">' + c.title + '</div><div class="case-industry">' + data.label + '</div></div></div>'
        + '<div class="case-steps">' + stepsHTML + '</div>'
        + '<div class="case-result"><span class="case-result-icon">✅</span><span class="case-result-text">' + c.result + '</span></div>'
        + '</div>';
    });

    document.getElementById('case-summary').innerHTML = summaryHTML;
    document.getElementById('case-cards').innerHTML = casesHTML;
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  ZAPIER WEBHOOK
  // ─────────────────────────────────────────────────────────────────────────
  async function awjSendToZapier() {
    if (!ZAPIER_WEBHOOK_URL || ZAPIER_WEBHOOK_URL.indexOf('XXXXX') !== -1) return;
    
    var data = serviceData[leadData.service] || serviceData['ovrigt'];
    var propertyLabel = {
      'apartment': 'Lägenhet',
      'house': 'Villa',
      'brf': 'BRF',
      'commercial': 'Företag'
    }[leadData.property] || leadData.property;

    var payload = {
      timestamp: new Date().toISOString(),
      source: window.location.href,
      email: leadData.email || '',
      phone: leadData.phone || '',
      service: data.label,
      service_key: leadData.service || '',
      property_type: propertyLabel,
      rot_labor_cost: leadData.rotLabor,
      rot_material_cost: leadData.rotMaterial,
      rot_saving: leadData.rotSaving,
      rot_total: leadData.rotTotal,
      rot_pay: leadData.rotPay
    };

    try {
      await fetch(ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true 
      });
      console.log('ROT-beräkning skickad till Zapier');
    } catch (err) {
      console.error('Kunde inte skicka till Zapier:', err);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  BOOK WITH DATA
  // ─────────────────────────────────────────────────────────────────────────
  function awjBookWithData() {
    var ctaArea = document.getElementById('case-cta-area');
    ctaArea.innerHTML = '<div class="send-state"><div class="send-spinner"></div>Skickar förfrågan…</div>';

    setTimeout(function() {
      ctaArea.innerHTML = '<button class="awj-btn awj-btn-gold" onclick="awjOpenCalendlyPopup()" style="margin-bottom:10px;">Boka besiktning →</button>'
        + '<div style="font-size:11px;color:rgba(255,215,0,0.6);text-align:center;margin-top:8px;">Vi har tagit emot din förfrågan</div>';
      awjOpenCalendlyPopup();
    }, 1400);
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  MISC HELPERS
  // ─────────────────────────────────────────────────────────────────────────
  function awjOpenCalendlyPopup() {
    if (!window.Calendly) {
      var s = document.createElement('script');
      s.src = 'https://assets.calendly.com/assets/external/widget.js';
      s.onload = function() {
        var l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = 'https://assets.calendly.com/assets/external/widget.css';
        document.head.appendChild(l);
        window.Calendly.initPopupWidget({ url: CALENDLY_URL });
      };
      document.head.appendChild(s);
    } else {
      window.Calendly.initPopupWidget({ url: CALENDLY_URL });
    }
  }

  function awjFaq(btn) { btn.closest('.faq-item').classList.toggle('open'); }

  function awjPricingTab(name, btn) {
    document.querySelectorAll('.price-set').forEach(function(s) { s.classList.remove('active'); });
    document.querySelectorAll('.price-toggle-btn').forEach(function(b) { b.classList.remove('active'); });
    document.getElementById('awj-price-' + name).classList.add('active');
    btn.classList.add('active');
  }

  function awjOpenCalendly() { awjOpenCalendlyPopup(); }

  function awjCloseTooltip() {
    var t = document.getElementById('awj-tooltip');
    if (t) { t.classList.remove('show'); setTimeout(function() { t.style.display = 'none'; }, 300); }
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  NUDGE SYSTEM
  // ─────────────────────────────────────────────────────────────────────────
  var awjNudgeShown = false;
  var awjWidgetOpened = false;
  var awjNudgeTimer = null;
  var awjScrollTimer = null;

  var awjNudges = [
    {
      trigger: 'time',
      delay: 30000,
      msg: 'Hej! Behöver du hjälp med elarbete?',
      action: null
    },
    {
      trigger: 'scroll',
      threshold: 0.5,
      delay: 8000,
      msg: 'Undrar du vad ROT-avdraget kan spara dig?',
      action: 'rot'
    },
    {
      trigger: 'exit',
      delay: 0,
      msg: 'Innan du går — beräkna ditt ROT-avdrag!',
      action: 'rot'
    }
  ];

  var awjActiveNudge = null;

  function awjShowNudge(nudge) {
    if (awjNudgeShown) return;
    awjNudgeShown = true;
    awjActiveNudge = nudge;
    var widgetOpen = document.getElementById('awj-widget').classList.contains('visible');
    if (widgetOpen) {
      awjShowNudgeBanner(nudge);
    } else {
      var t = document.getElementById('awj-tooltip');
      if (!t) return;
      t.style.display = '';
      t.classList.add('show');
      awjTypewriteTooltip(nudge.msg);
    }
  }

  function awjShowNudgeBanner(nudge) {
    var banner = document.getElementById('awj-nudge-banner');
    if (!banner) return;
    var textEl = banner.querySelector('.nudge-banner-text');
    if (textEl) textEl.textContent = nudge.msg || 'Vill du se vad ROT-avdraget kan spara dig?';
    banner.classList.add('show');
  }

  function awjHideNudgeBanner() {
    var banner = document.getElementById('awj-nudge-banner');
    if (banner) banner.classList.remove('show');
  }

  function awjNudgeCTA() {
    awjHideNudgeBanner();
    awjStartFlow();
  }

  function awjTypewriteTooltip(msg) {
    var el = document.getElementById('awj-tooltip-text');
    if (!el) return;
    el.textContent = '';
    var i = 0;
    function type() {
      if (i < msg.length) {
        el.textContent += msg[i];
        i++;
        setTimeout(type, 45 + Math.random() * 30);
      }
    }
    setTimeout(type, 350);
  }

  function awjOpenFromTooltip() {
    awjCloseTooltip();
    document.getElementById('awj-widget').classList.add('visible');
    document.getElementById('awj-launcher').classList.add('open');
    awjWidgetOpened = true;
    if (awjActiveNudge && awjActiveNudge.action === 'rot') {
      setTimeout(function() { awjStartFlow(); }, 400);
    } else if (awjActiveNudge) {
      setTimeout(function() { awjShowNudgeBanner(awjActiveNudge); }, 450);
    }
  }

  // Track widget open
  var origToggle = awjToggle;
  window.awjToggle = function() {
    origToggle();
    awjWidgetOpened = document.getElementById('awj-widget').classList.contains('visible');
  };

  // TRIGGER 1 — Time on page (30 sec)
  awjNudgeTimer = setTimeout(function() {
    awjShowNudge(awjNudges[0]);
  }, 30000);

  // TRIGGER 2 — Scroll depth (50%) + 8 sec dwell
  window.addEventListener('scroll', function() {
    if (awjNudgeShown || awjWidgetOpened) return;
    var scrollPct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    if (scrollPct >= 0.5 && !awjScrollTimer) {
      awjScrollTimer = setTimeout(function() {
        clearTimeout(awjNudgeTimer);
        awjShowNudge(awjNudges[1]);
      }, 8000);
    }
  }, { passive: true });

  // TRIGGER 3 — Exit intent
  document.addEventListener('mouseleave', function(e) {
    if (e.clientY <= 0 && !awjNudgeShown && !awjWidgetOpened) {
      clearTimeout(awjNudgeTimer);
      clearTimeout(awjScrollTimer);
      awjShowNudge(awjNudges[2]);
    }
  });

  // Initial tooltip — show after 0.7s
  setTimeout(function() {
    var t = document.getElementById('awj-tooltip');
    if (t) {
      t.classList.add('show');
      awjTypewriteTooltip('Hej! Behöver du hjälp med elarbete?');
    }
  }, 700);

  // Init ROT display
  awjCalcROT();

  // Expose globals
  window.awjToggle = awjToggle;
  window.awjGoHome = awjGoHome;
  window.awjNav = awjNav;
  window.awjStartFlow = awjStartFlow;
  window.awjSelectChip = awjSelectChip;
  window.awjCheckQualify = awjCheckQualify;
  window.awjQualifyNext = awjQualifyNext;
  window.awjCalcROT = awjCalcROT;
  window.awjRotNext = awjRotNext;
  window.awjBookWithData = awjBookWithData;
  window.awjFaq = awjFaq;
  window.awjPricingTab = awjPricingTab;
  window.awjOpenCalendly = awjOpenCalendly;
  window.awjOpenCalendlyPopup = awjOpenCalendlyPopup;
  window.awjCloseTooltip = awjCloseTooltip;
  window.awjTypewriteTooltip = awjTypewriteTooltip;
  window.awjShowNudgeBanner = awjShowNudgeBanner;
  window.awjHideNudgeBanner = awjHideNudgeBanner;
  window.awjNudgeCTA = awjNudgeCTA;
  window.awjOpenFromTooltip = awjOpenFromTooltip;
})();
