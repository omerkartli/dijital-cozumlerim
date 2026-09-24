// Kişiye özel mektup sayfası: zarf -> çiçekler -> çağrı -> mektup.
// Müzik zarfa dokununca başlıyor; tarayıcılar sesli oynatmayı ancak bir
// kullanıcı hareketinden sonra kabul ediyor, zarfa dokunmak o hareket.

const VIDEO_ID = 'RMQ604HBLMc';   // Sedat Anar — Seyyah-ı Avare
const SES_SEVIYESI = 35;

const azHareket = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const sahne = document.getElementById('sahne');
const zarf = document.getElementById('zarf');
const yagmur = document.getElementById('cicekYagmuri');
const cagri = document.getElementById('cagri');
const notuOku = document.getElementById('notuOku');
const mektup = document.getElementById('mektup');
const muzikDugme = document.getElementById('muzikDugme');
const sesAcik = document.getElementById('sesAcik');
const sesKapali = document.getElementById('sesKapali');

let acildi = false;
const zamanlayicilar = [];

function bekle(ms, fn) {
    zamanlayicilar.push(setTimeout(fn, ms));
}

// --- Müzik ---

let oynatici = null;
let oynaticiHazir = false;
let baslamayiBekleyen = false;

// YouTube API hazır olunca kendisi bu adı arıyor.
window.onYouTubeIframeAPIReady = () => {
    oynatici = new YT.Player('muzikCerceve', {
        videoId: VIDEO_ID,
        playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            // Tek videoyu döngüye almanın yolu onu playlist olarak da vermek.
            loop: 1,
            playlist: VIDEO_ID,
        },
        events: {
            onReady: () => {
                oynaticiHazir = true;
                if (baslamayiBekleyen) muzigiBaslat();
            },
        },
    });
};

function muzigiBaslat() {
    // Zarfa dokunulduğunda oynatıcı henüz hazır olmayabilir; o zaman
    // hazır olduğunda kendiliğinden başlasın diye niyeti saklıyoruz.
    if (!oynaticiHazir || !oynatici) {
        baslamayiBekleyen = true;
        return;
    }

    try {
        oynatici.setVolume(SES_SEVIYESI);
        oynatici.playVideo();
        muzikDugme.hidden = false;
    } catch (err) {
        // Müzik açılmazsa sayfanın geri kalanı yine çalışmalı.
        muzikDugme.hidden = true;
    }
}

function sesiDegistir() {
    if (!oynaticiHazir || !oynatici) return;

    const susturulmus = oynatici.isMuted();
    if (susturulmus) {
        oynatici.unMute();
    } else {
        oynatici.mute();
    }

    // susturulmus, tıklamadan önceki durum: sessizdiyse artık ses açık.
    sesAcik.classList.toggle('gizli', !susturulmus);
    sesKapali.classList.toggle('gizli', susturulmus);
    muzikDugme.setAttribute('aria-label', susturulmus ? 'Müziği sessize al' : 'Müziği aç');
    muzikDugme.setAttribute('title', susturulmus ? 'Müziği sessize al' : 'Müziği aç');
}

// --- Çiçekler ---

// Her motifin kendi çerçevesi var; <use> ile çağıran svg'nin viewBox'ı
// buna eşit olmazsa çiçek kayık ve küçük çizilir.
const MOTIFLER = [
    { id: '#m-gul', kutu: '-34 -34 68 68', oran: 1 },
    { id: '#m-papatya', kutu: '-46 -46 92 92', oran: 1 },
    { id: '#m-gonca', kutu: '-22 -40 44 74', oran: 0.62 },
    { id: '#m-yaprak', kutu: '-4 -14 44 28', oran: 1.5 },
    { id: '#m-dal', kutu: '-26 -96 52 104', oran: 0.52 },
];

function araliktaSayi(en, boy) {
    return en + Math.random() * (boy - en);
}

function cicekleriUcur(adet = 26) {
    // Çiçekler zarfın ağzından çıkmalı; sahne ekranın ortasında olmayabilir,
    // o yüzden kaynağı patlama anında zarfın yerinden ölçüyoruz.
    const kutu = zarf.getBoundingClientRect();
    yagmur.style.setProperty('--kaynak-x', `${kutu.left + kutu.width / 2}px`);
    yagmur.style.setProperty('--kaynak-y', `${kutu.top + kutu.height * 0.46}px`);

    const parca = document.createDocumentFragment();

    for (let i = 0; i < adet; i += 1) {
        const kutu = document.createElement('span');
        kutu.className = 'cicek';

        // Her çiçek kendi yönünü taşıyor: yatayda savrulma, tepe noktası,
        // sonunda düştüğü yer, dönüş açısı, boy ve zamanlama.
        const yon = Math.random() < 0.5 ? -1 : 1;
        kutu.style.setProperty('--x', `${araliktaSayi(40, 300) * yon}px`);
        kutu.style.setProperty('--tepe', `${-araliktaSayi(180, 420)}px`);
        kutu.style.setProperty('--dus', `${araliktaSayi(120, 460)}px`);
        kutu.style.setProperty('--donus', `${araliktaSayi(90, 520) * yon}deg`);
        const boy = Math.round(araliktaSayi(30, 68));
        kutu.style.setProperty('--boy', `${boy}px`);
        kutu.style.setProperty('--sure', `${araliktaSayi(2.1, 3.4).toFixed(2)}s`);
        kutu.style.setProperty('--gecikme', `${araliktaSayi(0, 0.55).toFixed(2)}s`);

        const motif = MOTIFLER[Math.floor(Math.random() * MOTIFLER.length)];
        // Dar motifler (yaprak, dal) kare kutuda küçük kalıyor; oranla dengeliyoruz.
        kutu.style.setProperty('--en', `${boy * motif.oran}px`);

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttribute('href', motif.id);
        svg.setAttribute('viewBox', motif.kutu);
        svg.appendChild(use);
        kutu.appendChild(svg);

        parca.appendChild(kutu);
    }

    yagmur.appendChild(parca);

    // Uçuş bitince kutular DOM'da birikmesin.
    bekle(4200, () => { yagmur.innerHTML = ''; });
}

// --- Perdeler ---

function gorunurYap(oge) {
    oge.hidden = false;
    // display:none -> görünür geçişi işlensin diye reflow zorla.
    // requestAnimationFrame kullanmıyoruz: sekme arka plandayken hiç
    // tetiklenmiyor ve perde opacity:0 takılı kalıyor. davetiye.js de
    // aynı sebeple bu yolu seçmiş.
    void oge.offsetHeight;
    oge.classList.add('is-icinde');
}

function zarfiAc() {
    if (acildi) return;
    acildi = true;

    muzigiBaslat();

    // Hareket azaltma açıkken zarf ve çiçek gösterisini atlayıp doğrudan
    // çağrıya geçiyoruz; davetiye sayfası da aynı yolu izliyor.
    if (azHareket) {
        sahne.classList.add('is-gitti');
        gorunurYap(cagri);
        return;
    }

    sahne.classList.add('is-acik');                              // mühür söner, kapak açılır
    bekle(520, () => sahne.classList.add('is-kapak-arkada'));    // kapak çiçeklerin arkasına
    bekle(560, () => cicekleriUcur());                           // çiçekler fışkırır
    bekle(1700, () => sahne.classList.add('is-gitti'));          // zarf sahneden çekilir
    bekle(2050, () => gorunurYap(cagri));
}

function mektubuAc() {
    if (azHareket) {
        cagri.hidden = true;
        gorunurYap(mektup);
        return;
    }

    cagri.classList.remove('is-icinde');

    bekle(450, () => {
        cagri.hidden = true;
        gorunurYap(mektup);
    });
}

zarf.addEventListener('click', zarfiAc);
notuOku.addEventListener('click', mektubuAc);
muzikDugme.addEventListener('click', sesiDegistir);
