// Misafir defteri sayfası. Fotoğraf galerisinden ayrı duruyor: davetli
// etkinlik sayfasındaki düğmeyle buraya geliyor, buradan da geri dönüyor.
// Etkinliği ikisi de ?slug=... ile taşıyor.

const CIHAZ_ANAHTARI = 'cihaz_jetonu';

function cihazJetonu() {
    // Sınır kişi başı işlesin diye tarayıcıda kalıcı bir jeton tutuyoruz.
    // Silinebilir olduğu için güvenlik değil, nezaket sınırı.
    try {
        let jeton = localStorage.getItem(CIHAZ_ANAHTARI);
        if (!jeton) {
            jeton = (crypto.randomUUID?.() || String(Math.random()).slice(2))
                .replace(/-/g, '')
                .slice(0, 32);
            localStorage.setItem(CIHAZ_ANAHTARI, jeton);
        }
        return jeton;
    } catch (err) {
        return null; // gizli sekmede depolama kapalı olabilir; sunucu IP'ye düşer
    }
}

function getSlugFromUrl() {
    return new URLSearchParams(window.location.search).get('slug');
}

async function etkinligiYukle(slug) {
    const titleEl = document.getElementById('eventTitle');
    const statusEl = document.getElementById('eventStatus');

    try {
        const response = await fetch(`${API_BASE_URL}/events/${encodeURIComponent(slug)}`);
        if (!response.ok) {
            setHeadingText(titleEl, 'Etkinlik bulunamadı');
            statusEl.textContent = 'Bu bağlantı geçerli bir etkinliğe ait değil.';
            document.getElementById('notlarBolum').hidden = true;
            return false;
        }
        const event = await response.json();
        setHeadingText(titleEl, event.name);
        statusEl.textContent = 'Misafir Defteri';
        return true;
    } catch (err) {
        statusEl.textContent = 'Sunucuya bağlanılamadı.';
        return false;
    }
}

function geriBaglantilariKur(slug) {
    const adres = `etkinlik.html?slug=${encodeURIComponent(slug)}`;
    document.getElementById('geriUst').href = adres;
    document.getElementById('geriAlt').href = adres;
}

const NOT_SAYFA_BOYU = 20;
let notOfset = 0;
let notToplam = 0;

function notKarti(not) {
    const kart = document.createElement('article');
    kart.className = 'not-kart';

    const metin = document.createElement('p');
    metin.className = 'not-govde';
    metin.textContent = not.body;
    kart.appendChild(metin);

    const alt = document.createElement('p');
    alt.className = 'not-imza';
    alt.textContent = not.author_name;
    kart.appendChild(alt);

    return kart;
}

function notlariCiz(liste, ekle) {
    const kap = document.getElementById('notListesi');
    if (!ekle) kap.innerHTML = '';
    liste.forEach((not) => kap.appendChild(notKarti(not)));

    const dahaFazla = document.getElementById('notDahaFazla');
    const kalan = notToplam - notOfset;
    dahaFazla.hidden = kalan <= 0;
    if (kalan > 0) dahaFazla.textContent = `${kalan} not daha`;
}

async function notlariYukle(slug, ekle = false) {
    const durum = document.getElementById('notDurum');

    try {
        const response = await fetch(
            `${API_BASE_URL}/events/${encodeURIComponent(slug)}/notes`
            + `?limit=${NOT_SAYFA_BOYU}&offset=${ekle ? notOfset : 0}`,
        );
        if (!response.ok) {
            durum.textContent = ekle ? 'Sonraki notlar alınamadı.' : '';
            return;
        }

        const liste = await response.json();
        const toplam = Number(response.headers.get('X-Total-Count'));
        notToplam = Number.isFinite(toplam) && toplam > 0 ? toplam : liste.length;
        notOfset = (ekle ? notOfset : 0) + liste.length;

        notlariCiz(liste, ekle);
        durum.textContent = notToplam === 0 ? 'Henüz not yok. İlk notu sen bırak.' : '';
    } catch (err) {
        durum.textContent = ekle ? 'Sonraki notlar alınamadı.' : '';
    }
}

async function notuGonder(event, slug) {
    event.preventDefault();

    const mesaj = document.getElementById('notMesaj');
    const btn = document.getElementById('notGonder');
    const ad = document.getElementById('notAd').value.trim();
    const metin = document.getElementById('notMetin').value.trim();

    if (!document.getElementById('notKvkkOnay').checked) {
        mesaj.textContent = 'Not bırakmak için aydınlatma metnini onaylaman gerekiyor.';
        return;
    }
    if (ad.length < 2 || metin.length < 2) {
        mesaj.textContent = 'Adını ve birkaç kelimelik bir not yaz.';
        return;
    }

    btn.disabled = true;
    mesaj.textContent = 'Gönderiliyor...';

    const jeton = cihazJetonu();
    try {
        const response = await fetch(`${API_BASE_URL}/events/${encodeURIComponent(slug)}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(jeton ? { 'X-Cihaz': jeton } : {}),
            },
            body: JSON.stringify({
                author_name: ad,
                body: metin,
                kvkk_onay: true,
                kvkk_surum: KVKK_SURUM,
            }),
        });

        if (response.status === 201) {
            mesaj.textContent = 'Notun alındı, onaylandıktan sonra burada görünecek.';
            document.getElementById('notForm').reset();
            document.getElementById('notKvkkOnay').checked = false;
            return; // düğme onay kutusu tekrar işaretlenene kadar kapalı kalsın
        }
        if (response.status === 429) {
            mesaj.textContent = 'Saatlik not sınırına ulaşıldı, birazdan tekrar dene.';
        } else if (response.status === 422) {
            mesaj.textContent = 'Ad en fazla 60, not en fazla 600 karakter olabilir.';
        } else if (response.status === 400) {
            mesaj.textContent = 'Sunucu onayı doğrulayamadı, sayfayı yenileyip tekrar dene.';
        } else if (response.status === 404) {
            mesaj.textContent = 'Bu etkinlik bulunamadı; bağlantı geçersiz olabilir.';
        } else {
            mesaj.textContent = 'Sunucuda bir sorun var, notunda bir hata yok. Biraz sonra dene.';
        }
    } catch (err) {
        mesaj.textContent = 'Sunucuya bağlanılamadı.';
    }

    btn.disabled = false;
}

function notlariKur(slug) {
    document.getElementById('notForm')
        .addEventListener('submit', (event) => notuGonder(event, slug));
    document.getElementById('notDahaFazla')
        .addEventListener('click', () => notlariYukle(slug, true));
    notlariYukle(slug);
}

document.addEventListener('DOMContentLoaded', async () => {
    const slug = getSlugFromUrl();

    if (!slug) {
        setHeadingText(document.getElementById('eventTitle'), 'Etkinlik belirtilmedi');
        document.getElementById('eventStatus').textContent =
            'Bağlantıda ?slug=... parametresi eksik.';
        document.getElementById('notlarBolum').hidden = true;
        return;
    }

    geriBaglantilariKur(slug);

    // Etkinlik yoksa not formunu hiç kurmuyoruz; boşuna doldurtmayalım.
    if (await etkinligiYukle(slug)) {
        kvkkKapisiKur('notKvkkOnay', 'notGonder', 'notKvkkAc');
        notlariKur(slug);
    }
});
