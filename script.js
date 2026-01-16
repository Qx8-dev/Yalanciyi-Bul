document.addEventListener('DOMContentLoaded', function() {
    //alert("siteloaded");
    const yazibuton = document.getElementById('bilgiYazisi'); // ID'yi buraya yazdık
    const modal = document.getElementById('gameExplanationModal');
    const kapat = document.getElementById('kapatButonu');

    // Yazıya tıklayınca aç
    yazibuton.addEventListener('click', () => {
        modal.showModal();
    });

    // Kapat butonuna basınca kapat
    kapat.addEventListener('click', () => {
        modal.close();
    });
});