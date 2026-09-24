// Aydınlatma metni: TEK KAYNAK.
//
// Metin hem etkinlik (fotoğraf yükleme) hem not sayfasında gösteriliyor.
// İki HTML dosyasına kopyalansaydı biri güncellenip diğeri unutulurdu; bu
// yüzden diyaloğu buradan üretiyoruz. Metni değiştirirsen KVKK_SURUM'u da
// güncelle: sunucu rızayı bu sürümle birlikte kaydediyor, yani kimin hangi
// metne onay verdiği ancak böyle ayırt edilebiliyor.

const KVKK_SURUM = '2026-09-23';

const KVKK_GOVDE = `
    <h2>Kişisel Verilerin Korunması Aydınlatma Metni</h2>

        <p>
            Bu sayfa üzerinden yüklediğiniz fotoğraflar ve misafir defterine
            bıraktığınız notlar, 6698 sayılı Kişisel Verilerin Korunması Kanunu
            (KVKK) kapsamında kişisel veri niteliği taşıyabilir.
            Aşağıda bu verilerin kim tarafından, hangi amaçla ve nasıl işlendiği
            açıklanmaktadır.
        </p>


        <h3>İşlenen veriler</h3>
        <ul>
            <li>Yüklediğiniz fotoğraf ve fotoğrafın teknik bilgileri (dosya türü, boyut, yüklenme zamanı)</li>
            <li>İsteğe bağlı olarak yazdığınız ad</li>
            <li>Misafir defterine bıraktıysanız adınız ve not metniniz</li>
            <li>Kötüye kullanımı önlemek için IP adresi ve tarayıcınızda oluşturulan cihaz tanımlayıcısı</li>
        </ul>

        <h3>İşleme amacı ve hukuki sebep</h3>
        <p>
            Fotoğraflar ve notlar yalnızca ilgili etkinliğin sayfasında gösterilmek,
            etkinlik sahipleriyle paylaşılmak ve içerik denetimi yapılmak üzere işlenir.
            İşlemenin hukuki sebebi <strong>açık rızanızdır</strong> (KVKK m.5/1).
            Onay kutusunu işaretlemeden fotoğraf yükleyemez, not bırakamazsınız.
        </p>

        <p>
            &ldquo;Sadece etkinlik sahipleri görsün&rdquo; seçeneğini işaretlerseniz
            fotoğrafınız herkese açık galeride yayımlanmaz; yalnızca etkinlik
            sahiplerine iletilir.
        </p>

        <h3>Saklama süresi</h3>
        <p>
            Fotoğraflar ve notlar, etkinlik sahibi silinmesini isteyene kadar saklanır.
            Etkinlik silindiğinde ikisi de kalıcı olarak silinir.
        </p>

        <h3>Haklarınız</h3>
        <p>
            KVKK m.11 uyarınca kişisel verilerinizin işlenip işlenmediğini öğrenme,
            düzeltilmesini veya silinmesini isteme ve rızanızı geri alma haklarına
            sahipsiniz. Talepleriniz için etkinlik sahipleriyle iletişime geçebilirsiniz.
            Etkinlik sahipleri, talebiniz üzerine fotoğraflarınızı ve notunuzu kaldırır.
        </p>
`;

function kvkkDiyaloguEkle() {
    if (document.getElementById('kvkkKutu')) return;

    const kutu = document.createElement('dialog');
    kutu.className = 'kvkk-kutu';
    kutu.id = 'kvkkKutu';
    kutu.dataset.surum = KVKK_SURUM;
    kutu.innerHTML = `<article class="kvkk-icerik">${KVKK_GOVDE}
        <button type="button" class="pill pill-koyu" id="kvkkKapat">Kapat</button>
    </article>`;
    document.body.appendChild(kutu);

    document.getElementById('kvkkKapat').addEventListener('click', () => kutu.close());
    kutu.addEventListener('click', (e) => {
        if (e.target === kutu) kutu.close();
    });
}

/**
 * Onay kutusu işaretlenene kadar gönder düğmesini kapalı tutar ve
 * "aydınlatma metnini oku" düğmesini diyaloğa bağlar. Kullanıcı neden
 * gönderemediğini denemeden görsün diye; sunucudaki kontrol yine yerinde.
 */
function kvkkKapisiKur(onayId, gonderId, acId) {
    kvkkDiyaloguEkle();

    const onay = document.getElementById(onayId);
    const gonder = document.getElementById(gonderId);
    const durumuTazele = () => { gonder.disabled = !onay.checked; };
    onay.addEventListener('change', durumuTazele);
    durumuTazele();

    document.getElementById(acId).addEventListener('click', () => {
        document.getElementById('kvkkKutu').showModal();
    });
}
