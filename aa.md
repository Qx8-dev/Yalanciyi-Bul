FreeResponseCorrectAnswers = ["Cold", "7", "Blue and Yellow"];
MultipleChoiceCorrectAnswers = [2, 1, 3]; // 0-indexed
document.addEventListener('DOMContentLoaded', function() {
    let frtextinput = document.querySelectorAll('.frtextinput');
    let frstatustext = document.querySelectorAll('.frstatus');
    let mcstatustext = document.querySelectorAll('.mcstatus');
    let mcbuttons = document.querySelectorAll('.mcbutton');

    function checkMultipleChoiceQuestion(whichbutton) {
        let whichquestion = 0;
        if (whichbutton > 3){ //needed for the situation whichbutton equals 1
            whichquestion = Math.floor(whichbutton/ 4);
        }
        console.log(whichbutton + " question : " + whichquestion)
        if (whichbutton % 4 == MultipleChoiceCorrectAnswers[whichquestion]) {
            mcbuttons[whichbutton].style.backgroundColor = "green";
            mcstatustext[whichquestion].innerHTML = "Correct!";
        }
        else {
            mcbuttons[whichbutton].style.backgroundColor = "red";
            mcstatustext[whichquestion].innerHTML = "Incorrect!";
        }
    }
    function checkFreeResponseQuestion(correctanswerindex) {
        let correctanswer = FreeResponseCorrectAnswers[correctanswerindex];
        if (frtextinput[correctanswerindex].value == correctanswer) {
            frtextinput[correctanswerindex].style.backgroundColor = "green";
            frstatustext[correctanswerindex].innerHTML = "Correct!";
        }
        else {
            frtextinput[correctanswerindex].style.backgroundColor = "red";
            frstatustext[correctanswerindex].innerHTML = "Incorrect!";
        }
    }
    let frbuttons = document.querySelectorAll(".frbutton");
    //console.log(`${buttonn}`);
    frbuttons.forEach(function(currentValue, currentIndex) {
        //console.log(`${currentValue}`);
        currentValue.addEventListener('click', function() { checkFreeResponseQuestion(currentIndex); });
        });
    mcbuttons.forEach(function(currentValue, currentIndex) {
        //console.log(`${currentValue}`);
        currentValue.addEventListener('click', function() { checkMultipleChoiceQuestion(currentIndex); });
        });
});



<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yalancıyı Bul!</title>
    <link rel="stylesheet" href="style.css">
    <style>

    </style>
</head>
<body>
    <div class="box">
        <h1>Yalancıyı Bul!</h1>
        <p id="mesaj">Yalancı hariç herkes gizli kelimeyi biliyor.<br>Amacınız yalancıyı bir kelimelik ipucular üzerinden ifşa etmek.<br>Oyun sonu oylama ile yalancıyı tahmin edeceksiniz.</p>
        <input type="text" id="isimKutusu" placeholder="Adını buraya yaz...">
        <button onclick="mesajiDegistir()">Sihri Gör</button>
    </div>
    <div class="box">
        <ul id="isimlistesi"></ul>
    </div>
    <script>
        let kayitliIsimler = [];
        if (localStorage.getItem("misafirler") != null){   
            kayitliIsimler = JSON.parse(localStorage.getItem("misafirler"));
        }
        let liste = document.getElementById("isimlistesi");
        
        for (let i = 0; i < kayitliIsimler.length; i++) {
            let isim = kayitliIsimler[i];
            let li = document.createElement("li");
            li.innerText = isim;
            li.onclick = function() {
                // 1. Önce sırasını bul (İçerideki parantez sadece ismi alır)
                let sira = kayitliIsimler.indexOf(li.innerText);
                
                // 2. O sıradan itibaren 1 tane sil (Dışarıdaki parantez adedi alır)
                kayitliIsimler.splice(sira, 1);
                
                // 3. Ekrandan kaldır
                li.remove();
                
                // 4. Güncel halini kaydet
                let JSONkayidi = JSON.stringify(kayitliIsimler);
                localStorage.setItem("misafirler", JSONkayidi);
            }

            liste.appendChild(li);
        }

        
        function mesajiDegistir() {
            let isimInput = document.getElementById("isimKutusu");
            let isim = isimInput.value;

            // 1. Doğrulama: İsim boşsa dur
            if (isim == "") {
                alert('Lütfen adını yaz!');
                return;
            }

            // 2. Yarat: Yeni bir liste maddesi oluştur
            let li = document.createElement("li");
            li.innerText = isim;

            // 3. Yapıştır: Listeyi bul ve içine ekle
            let liste = document.getElementById("isimlistesi");
            liste.appendChild(li);
            kayitliIsimler.push(isim);

            li.onclick = function() {
                // 1. Önce sırasını bul (İçerideki parantez sadece ismi alır)
                let sira = kayitliIsimler.indexOf(li.innerText);
                
                // 2. O sıradan itibaren 1 tane sil (Dışarıdaki parantez adedi alır)
                kayitliIsimler.splice(sira, 1);
                
                // 3. Ekrandan kaldır
                li.remove();
                
                // 4. Güncel halini kaydet
                let JSONkayidi = JSON.stringify(kayitliIsimler);
                localStorage.setItem("misafirler", JSONkayidi);
            }

            let JSONkayidi = JSON.stringify(kayitliIsimler);
            localStorage.setItem("misafirler", JSONkayidi);

            // 4. Temizlik: Kutuyu boşalt
            isimInput.value = "";
        }
    </script>
</body>
</html>

        <input type="text" id="isimKutusu" placeholder="Adını buraya yaz...">
