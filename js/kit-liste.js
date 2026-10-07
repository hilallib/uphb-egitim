/* Tabloların İçinde · Başyapıtlarda Yolculuk: tek liste.
   Galeride listedeki BÜTÜN eserler görünür (yalnız üretilmiş olanlar listeye yazılır).
   kit: "yayinda" → "Kiti al" düğmesi + indirme; "yakinda" → "Kit yakında".
   youtube: video kimliği (youtube.com/watch?v=...). Kapak kitler/medya/NN-youtube.jpg (yerel kopya).
   video: 20 sn döngü videosu hazır olunca yolu yazılır. */
window.KITLER = [
  { no: 1, slug: "mona-lisa",         ad: "Mona Lisa",          ressam: "Leonardo da Vinci", yil: "yaklaşık 1503–1519", kit: "yayinda",
    sayfa: "/kitler/mona-lisa.html", zip: "/kitler/dosyalar/01-mona-lisa-kit.zip", youtube: "SSiKL_gqf3E", video: null },
  { no: 2, slug: "yildizli-gece",     ad: "Yıldızlı Gece",      ressam: "Vincent van Gogh",  yil: "1889",               kit: "yakinda", youtube: "BpclsF0lNCk" },
  { no: 3, slug: "inci-kupeli-kiz",   ad: "İnci Küpeli Kız",    ressam: "Johannes Vermeer",  yil: "yaklaşık 1665",      kit: "yakinda", youtube: "fqICAJ4u_c8" },
  { no: 4, slug: "ciglik",            ad: "Çığlık",             ressam: "Edvard Munch",      yil: "1893",               kit: "yakinda", youtube: "p1Rnawcqu90" },
  { no: 5, slug: "venusun-dogusu",    ad: "Venüs'ün Doğuşu",    ressam: "Sandro Botticelli", yil: "yaklaşık 1485",      kit: "yakinda", youtube: "SYr3i9gBHEY" },
  { no: 6, slug: "son-aksam-yemegi",  ad: "Son Akşam Yemeği",   ressam: "Leonardo da Vinci", yil: "1495–1498",          kit: "yakinda", youtube: "2mCI_xmKXZI" },
  { no: 7, slug: "ademin-yaratilisi", ad: "Âdem'in Yaratılışı", ressam: "Michelangelo",      yil: "yaklaşık 1512",      kit: "yakinda", youtube: null },
  { no: 8, slug: "atina-okulu",       ad: "Atina Okulu",        ressam: "Raffaello",         yil: "1509–1511",          kit: "yakinda", youtube: "AdZEipdZF40" }
];
