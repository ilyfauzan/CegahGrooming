$word = New-Object -ComObject Word.Application
$word.Visible = $false
$docPath = 'c:\Users\FAUZAN\Documents\skripsidraft.docx'
$doc = $word.Documents.Open($docPath)
$selection = $word.Selection

# 1. Update Landasan Teori
$findText = "1.4 Landasan Teori"
$found = $word.Selection.Find.Execute($findText)
if ($found) {
    # Find the end of section (before Metodologi)
    $range = $word.Selection.Range
    $word.Selection.Find.Execute("BAB II  METODOLOGI PENELITIAN")
    $endRange = $word.Selection.Range.Start
    $range.End = $endRange
    
    $newContent = @"
1.4 Landasan Teori

1.4.1 Online Grooming
Online grooming didefinisikan sebagai upaya sistematis yang dilakukan oleh pelaku dewasa untuk membangun hubungan emosional dan kepercayaan dengan anak atau remaja melalui platform digital (media sosial, aplikasi pesan, atau game online) dengan tujuan eksploitasi seksual. Proses ini bersifat progresif dan manipulatif, yang menurut Buitrago et al. (2022) sering kali melibatkan tahapan pengumpulan informasi personal, pembentukan rahasia bersama, hingga fase isolasi sosial terhadap korban.

1.4.2 Natural Language Processing (NLP)
Pemrosesan Bahasa Alami atau Natural Language Processing (NLP) merupakan cabang kecerdasan buatan yang berfokus pada interaksi antara komputer dan bahasa manusia. Dalam konteks deteksi grooming, NLP digunakan untuk melakukan ekstraksi fitur semantik dari teks percakapan, memungkinkan sistem untuk mengenali pola linguistik yang mencurigakan melalui teknik-teknik seperti tokenization, lemmatization, dan vector representation.

1.4.3 Model BERT (Bidirectional Encoder Representations from Transformers)
BERT merupakan arsitektur deep learning berbasis Transformer yang dilatih untuk memahami konteks sebuah kata berdasarkan posisi kata-kata sebelum dan sesudahnya secara simultan (bidirectional). Keunggulan utama BERT terletak pada mekanisme Self-Attention, yang memungkinkannya menangkap nuansa bahasa yang halus dan hubungan dependensi jangka panjang dalam sebuah kalimat dengan akurasi yang lebih tinggi dibandingkan model tradisional.

1.4.4 Klasifikasi Teks Kontekstual
Klasifikasi teks dalam penelitian ini melampaui metode tradisional yang hanya berbasis kata kunci tunggal. Pendekatan kontekstual melibatkan analisis terhadap intensi di balik pesan, di mana label klasifikasi ditentukan tidak hanya oleh konten literal pesan tersebut, tetapi juga oleh bagaimana pesan tersebut berkontribusi pada narasi percakapan secara keseluruhan.

1.4.5 Mekanisme Sliding Window
Mekanisme Sliding Window diimplementasikan untuk mengatasi keterbatasan memori pada model bahasa besar serta untuk menangkap pola kronologis dalam percakapan. Dengan menganalisis blok pesan terakhir (misalnya 10 pesan), sistem dapat mendeteksi "eskalasi" atau perubahan suhu percakapan dari tahap normal menuju tahap manipulatif secara dinamis.

1.4.6 Machine Translation & Cross-Lingual Bridge
Dikarenakan keterbatasan dataset grooming dalam Bahasa Indonesia, skema Translation-Bridge digunakan untuk menerjemahkan input pengguna ke dalam Bahasa Inggris sebelum diproses oleh model BERT yang telah di-fine-tune pada dataset internasional. Metode ini memungkinkan pemanfaatan transfer data lintas bahasa untuk meningkatkan performa deteksi pada bahasa-bahasa dengan sumber daya rendah (low-resource languages).

1.4.7 Dataset PAN Sexual Predator Identification
Dataset PAN merupakan standarisasi dataset internasional yang berisi ribuan log percakapan nyata yang melibatkan predator seksual dan korban. Dataset ini menjadi fondasi utama dalam melatih model untuk mengenali perilaku predator, karena mencakup variasi pola interaksi mulai dari obrolan kasual hingga fase eksploitasi yang eksplisit.

1.4.8 Arsitektur Hybrid Scoring
Arsitektur Hybrid Scoring menggabungkan dua nilai probabilitas deteksi: skor dari pesan tunggal (standalone score) dan skor dari alur percakapan (context score). Penggabungan ini bertujuan untuk meminimalisir angka False Positive (salah deteksi) dan memastikan bahwa peringatan bahaya diberikan hanya jika terdapat konsistensi pola predator baik secara tekstual maupun situasional.

"@
    $range.Text = $newContent
}

# 2. Update Rumusan Masalah
$word.Selection.HomeKey(6) # Go to start
$foundRM = $word.Selection.Find.Execute("Rumusan Masalah")
if ($foundRM) {
    $rangeRM = $word.Selection.Range
    $word.Selection.Find.Execute("Tujuan Penelitian")
    $endRangeRM = $word.Selection.Range.Start
    $rangeRM.End = $endRangeRM
    
    $newRM = @"
Rumusan Masalah
Berdasarkan latar belakang tersebut, rumusan masalah penelitian ini adalah sebagai berikut:
1. Bagaimana merancang dan mengimplementasikan model bahasa BERT (Bidirectional Encoder Representations from Transformers) dengan mekanisme sliding window untuk membangun sistem deteksi dini online grooming yang mampu memahami alur percakapan secara kontekstual?
2. Sejauh mana efektivitas penggunaan metode Hybrid Scoring yang menggabungkan analisis kalimat tunggal (standalone) dan analisis konteks percakapan dalam meningkatkan akurasi identifikasi pola predator seksual dibandingkan dengan metode klasifikasi teks konvensional?
3. Bagaimana akurasi kategorisasi tingkat risiko (Normal, Warning, Danger) yang dihasilkan oleh sistem dalam memberikan peringatan dini yang presisi terhadap tahapan-tahapan modulasi perilaku predator seksual online?

"@
    $rangeRM.Text = $newRM
}

$doc.Save()
$doc.Close()
$word.Quit()
Write-Host "Update Complete!"
