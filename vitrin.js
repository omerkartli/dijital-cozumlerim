// Ana sayfa: çözüm filtresi, telefon çerçevesinde demo penceresi, WhatsApp'a giden proje formu.
const DEMOLAR = {
    davetiye: { baslik: 'Dijital Davetiye', sayfa: 'davetiye.html', aciklama: 'Zarf açılır, geri sayım canlı akar. Davetli isimleri kurgusaldır.' },
    cicekci: { baslik: 'Çiçekçi Sitesi', sayfa: 'cicekci.html', aciklama: 'Ürün kataloğu ve sipariş formu. Form bu demoda mesaj göndermez.' },
    guzellik: { baslik: 'Güzellik Merkezi Sitesi', sayfa: 'guzellik.html', aciklama: 'Hizmet kataloğu ve saat seçmeli randevu formu.' },
    kuafor: { baslik: 'Kadın Kuaförü Sitesi', sayfa: 'kuafor.html', aciklama: 'Uzmana göre saat seçmeli randevu formu.' },
};
const WA_NUMARA = '905545520912';

document.addEventListener('DOMContentLoaded', () => {
    const sekmeler = document.querySelectorAll('.vt-sekme');
    const kartlar = document.querySelectorAll('#urunGrid .product-card');
    sekmeler.forEach((sekme) => {
        sekme.addEventListener('click', () => {
            const filtre = sekme.dataset.filtre;
            sekmeler.forEach((s) => {
                const aktif = s === sekme;
                s.classList.toggle('is-aktif', aktif);
                s.setAttribute('aria-pressed', String(aktif));
            });
            kartlar.forEach((k) => {
                k.hidden = filtre !== 'hepsi' && k.dataset.kategori !== filtre;
            });
        });
    });

    const modal = document.getElementById('demoModal');
    const cerceve = document.getElementById('demoCerceve');
    const baslik = document.getElementById('demoBaslik');
    const aciklama = document.getElementById('demoAciklama');
    const tam = document.getElementById('demoTam');
    const demoDugmeleri = modal.querySelectorAll('.vt-demo-sekmeler button');
    let sonOdak = null;

    function demoGoster(anahtar) {
        const d = DEMOLAR[anahtar];
        if (!d) return;
        cerceve.src = d.sayfa;
        baslik.textContent = d.baslik;
        aciklama.textContent = d.aciklama;
        tam.href = d.sayfa;
        demoDugmeleri.forEach((b) => b.classList.toggle('is-aktif', b.dataset.demo === anahtar));
    }

    function modalAc(anahtar) {
        sonOdak = document.activeElement;
        demoGoster(anahtar);
        modal.hidden = false;
        document.body.classList.add('vt-kilit');
        document.getElementById('demoKapat').focus();
    }

    function modalKapat() {
        modal.hidden = true;
        cerceve.removeAttribute('src');
        document.body.classList.remove('vt-kilit');
        sonOdak?.focus();
    }

    document.querySelectorAll('#urunGrid [data-demo]').forEach((b) => {
        b.addEventListener('click', () => modalAc(b.dataset.demo));
    });
    demoDugmeleri.forEach((b) => b.addEventListener('click', () => demoGoster(b.dataset.demo)));
    document.getElementById('demoKapat').addEventListener('click', modalKapat);
    document.getElementById('demoIste').addEventListener('click', modalKapat);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modalKapat();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden) modalKapat();
    });

    document.getElementById('projeForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const f = new FormData(e.target);
        const ekler = f.getAll('ek');
        const satirlar = ['Merhaba, siteniz üzerinden yazıyorum.', `İstediğim: ${f.get('paket')}`];
        if (ekler.length) satirlar.push(`Ek istekler: ${ekler.join(', ')}`);
        if (f.get('ad').trim()) satirlar.push(`Ad / marka: ${f.get('ad').trim()}`);
        if (f.get('not').trim()) satirlar.push(`Not: ${f.get('not').trim()}`);
        const url = `https://wa.me/${WA_NUMARA}?text=${encodeURIComponent(satirlar.join('\n'))}`;
        window.open(url, '_blank', 'noopener');
    });
});
