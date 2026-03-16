from google.colab import drive
import pandas as pd
import numpy as np

drive.mount('/content/drive')

# Sesuaikan dengan path tempat kamu menyimpan file sebelumnya
path = '/content/drive/MyDrive/Colab Notebooks/bismillah lulus/'
file_input = path + 'dataset_heuristic.csv'

# Coba gunakan pemisah Tab (\t) karena tadi kita menyimpannya dengan format itu
# Jika masih error, kita tambahkan on_bad_lines untuk melewati baris yang rusak
try:
    df = pd.read_csv(file_input, sep='\t')
    print("Berhasil membaca dengan pemisah TAB")
except:
    df = pd.read_csv(file_input, sep=',')
    print("Berhasil membaca dengan pemisah KOMA")

# Jika tetap error karena ada baris yang formatnya berantakan di tengah (ParserError):
# df = pd.read_csv(file_input, sep='\t', on_bad_lines='skip')

print(f"Data Loaded: {len(df)} baris")
display(df.head())
#---
def create_sliding_windows(df, window_size=10, step_size=1):
    windowed_data = []

    # Kelompokkan berdasarkan conv_id agar chat tidak tercampur antar percakapan
    grouped = df.groupby('conv_id')

    print(f"Memproses {len(grouped)} percakapan...")

    for conv_id, group in grouped:
        # Urutkan berdasarkan line untuk menjaga kronologi
        group = group.sort_values('line')

        texts = group['text'].astype(str).tolist()
        labels = group['label'].tolist()

        # Jika jumlah pesan dalam satu percakapan kurang dari window_size
        if len(texts) <= window_size:
            combined_text = " [SEP] ".join(texts)
            # Label = 1 BILA DAN HANYA BILA ada indikasi grooming di akhir-akhir percakapan
            # Atau persentase groomingnya signifikan. Untuk mempermudah, kita pakai logika:
            # Jika ada label 1, ini window grooming.
            final_label = 1 if any(l == 1 for l in labels) else 0
            windowed_data.append([conv_id, combined_text, final_label])
        else:
            # Lakukan sliding window (geser satu per satu)
            for i in range(0, len(texts) - window_size + 1, step_size):
                window_texts = texts[i : i + window_size]
                window_labels = labels[i : i + window_size]

                # PERBAIKAN PENTING DI SINI:
                # Jika window ini HANYA memuat 1 label grooming di paling AWAL window, 
                # dan 9 sisanya normal, model akan sangat bingung.
                # Lebih baik kita labeli window ini sebagai Grooming JIKA label grooming 
                # muncul di paruh kedua window (menandakan eskalasi), ATAU ada lebih dari 1 
                # pesan grooming dalam window tersebut.
                
                grooming_count = sum(window_labels)
                
                if grooming_count >= 1:
                    final_label = 1
                else:
                    final_label = 0
                    
                combined_text = " [SEP] ".join(window_texts)
                windowed_data.append([conv_id, combined_text, final_label])

    return pd.DataFrame(windowed_data, columns=['conv_id', 'text', 'label'])

# Eksekusi dengan window 10 pesan, tapi STEP SIZE kita perbesar untuk data grooming
# Ini akan mencegah 1 pesan grooming digandakan menjadi 10 window grooming yang identik
df_windowed = create_sliding_windows(df, window_size=10, step_size=2)

print("\n✅ Proses Selesai!")
print(f"Total baris setelah windowing: {len(df_windowed)}")
print("-" * 30)
print("Distribusi Label Baru:")
print(df_windowed['label'].value_counts())
#---
import re
import string

def clean_text(text):
    # 1. Pastikan teks adalah string
    text = str(text)

    # 2. Ubah ke huruf kecil (Case Folding)
    text = text.lower()

    # 3. Hapus URL/Link (sering muncul di chat predator)
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)

    # 4. Hapus karakter non-ASCII (emoji, simbol aneh, karakter spesial)
    text = text.encode("ascii", "ignore").decode()

    # 5. Hapus tanda baca KECUALI kurung siku []
    # Penting: kita butuh [ ] agar token [SEP] tidak rusak
    punctuation_cleaned = string.punctuation.replace('[', '').replace(']', '')
    text = text.translate(str.maketrans('', '', punctuation_cleaned))

    # 6. Hapus spasi ganda atau spasi berlebih
    text = re.sub(r'\s+', ' ', text).strip()

    return text

# --- EKSEKUSI CLEANING ---
print("⏳ Sedang membersihkan teks... mohon tunggu sebentar.")

# Terapkan fungsi cleaning ke kolom text
df_windowed['text_clean'] = df_windowed['text'].apply(clean_text)

print("✅ Cleaning selesai!")

# Intip perbandingannya
display(df_windowed[['text', 'text_clean']].head())
#---
from sklearn.model_selection import train_test_split
from sklearn.utils import resample

# 1. Pilih kolom hasil cleaning
df_ready = df_windowed[['text_clean', 'label']].copy()

# 2. Split Data (80% Train, 20% Test)
# Stratify memastikan proporsi label 1 dan 0 tetap sama di kedua set
train_df, test_df = train_test_split(df_ready, test_size=0.2, random_state=42, stratify=df_ready['label'])

# 3. Balancing Data (Cek mana yang minoritas dan mayoritas)
label_counts = train_df['label'].value_counts()
print(f"Distribusi Label Awal Training:\n{label_counts}")

# Ambil label mayoritas dan minoritas secara dinamis
majority_label = label_counts.idxmax()
minority_label = label_counts.idxmin()

df_majority = train_df[train_df.label == majority_label]
df_minority = train_df[train_df.label == minority_label]

# Undersample class mayoritas
df_majority_downsampled = resample(df_majority,
                                 replace=False,
                                 n_samples=len(df_minority),
                                 random_state=42)

# Gabungkan hasil undersampling
train_balanced = pd.concat([df_majority_downsampled, df_minority]).sample(frac=1).reset_index(drop=True)

print(f"✅ Data Train Seimbang: {len(train_balanced)} baris")
print(f"✅ Data Test Asli: {len(test_df)} baris")
#---
!pip install -q transformers datasets torch accelerate

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
from datasets import Dataset, DatasetDict
import numpy as np

# Cek GPU (Wajib muncul "cuda")
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"✅ Menggunakan Device: {device}")
#---
# 1. Load Tokenizer
model_checkpoint = "bert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(model_checkpoint)

# 2. Fungsi Tokenisasi
def tokenize_function(examples):
    return tokenizer(examples["text_clean"], padding="max_length", truncation=True, max_length=128)

# 3. Ubah Pandas ke HuggingFace Dataset
# Kita bagi train_balanced sedikit untuk validation agar Trainer tidak error
df_train_sub = train_balanced.sample(frac=0.9, random_state=42)
df_val_sub = train_balanced.drop(df_train_sub.index)

raw_datasets = DatasetDict({
    "train": Dataset.from_pandas(df_train_sub),
    "validation": Dataset.from_pandas(df_val_sub),
    "test": Dataset.from_pandas(test_df)
})

# 4. Jalankan Tokenisasi
tokenized_datasets = raw_datasets.map(tokenize_function, batched=True)

# 5. Bersihkan kolom yang tidak perlu
tokenized_datasets = tokenized_datasets.remove_columns(["text_clean"])
if "__index_level_0__" in tokenized_datasets["train"].column_names:
    tokenized_datasets = tokenized_datasets.remove_columns(["__index_level_0__"])

tokenized_datasets.set_format("torch")
print("✅ Tokenisasi Selesai!")
#---
!pip install -q evaluate
import numpy as np
from evaluate import load

# Load library evaluasi
metric_acc = load("accuracy")
metric_f1 = load("f1")
metric_precision = load("precision")
metric_recall = load("recall")

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)

    # Hitung semua metrik
    acc = metric_acc.compute(predictions=predictions, references=labels)["accuracy"]
    f1 = metric_f1.compute(predictions=predictions, references=labels)["f1"]
    prec = metric_precision.compute(predictions=predictions, references=labels)["precision"]
    rec = metric_recall.compute(predictions=predictions, references=labels)["recall"]

    return {
        "accuracy": acc,
        "f1": f1,
        "precision": prec,
        "recall": rec
    }

# --- 1. Load Model (Tetap sama) ---
model = AutoModelForSequenceClassification.from_pretrained(model_checkpoint, num_labels=2).to(device)

# --- 2. Atur Parameter Training (5 Epoch) ---
training_args = TrainingArguments(
    output_dir="./results",
    eval_strategy="epoch",
    save_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=3,
    weight_decay=0.01,
    load_best_model_at_end=True,
    metric_for_best_model="f1", # Model terbaik ditentukan dari F1 tertinggi
    report_to="none"
)

# --- 3. Inisialisasi Trainer (Masukkan compute_metrics) ---
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["validation"],
    compute_metrics=compute_metrics # <--- PENTING: Masukkan fungsi metrik di sini
)

# --- 4. GAS TRAINING ---
print("🚀 Memulai Training BERT dengan Metrik Lengkap...")
trainer.train()
#---
import torch
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, classification_report
from torch.utils.data import DataLoader

def show_train_confusion_matrix(model, dataloader):
    model.eval()
    all_preds = []
    all_labels = []

    print("⏳ Menghitung prediksi pada data evaluasi...")

    with torch.no_grad():
        for batch in dataloader:
            # Pindahkan data ke GPU
            # Extract input_ids, attention_mask, and true labels from the batch
            input_ids = batch['input_ids'].to(model.device)
            attention_mask = batch['attention_mask'].to(model.device)
            true_labels = batch['label'].to(model.device) # Access 'label' key

            # Prepare inputs for the model (only input_ids and attention_mask needed for prediction)
            inputs = {
                'input_ids': input_ids,
                'attention_mask': attention_mask
            }
            outputs = model(**inputs)
            preds = torch.argmax(outputs.logits, dim=-1)

            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(true_labels.cpu().numpy())

    # 1. Hitung Confusion Matrix
    cm = confusion_matrix(all_labels, all_preds)

    # 2. Plotting
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Reds',
                xticklabels=['Normal', 'Grooming'],
                yticklabels=['Normal', 'Grooming'])
    plt.xlabel('Prediksi AI')
    plt.ylabel('Kenyataan (Ground Truth)')
    plt.title('Confusion Matrix Hasil Training')
    plt.show()

    # 3. Print Report
    print("\n--- PERFORMANCE REPORT ---")
    print(classification_report(all_labels, all_preds, target_names=['Normal', 'Grooming']))

# Jalankan fungsi ini
# Tambahkan ini untuk membuat val_dataloader
val_dataloader = DataLoader(
    tokenized_datasets["validation"],
    batch_size=16, # Sesuaikan dengan per_device_eval_batch_size dari TrainingArguments
    shuffle=False
)

show_train_confusion_matrix(model, val_dataloader)
#---
!pip install deep_translator
#---
  from deep_translator import GoogleTranslator
  import torch
  import torch.nn.functional as F

  # 1. Inisialisasi Translator
  translator = GoogleTranslator(source='id', target='en')

  def detect_grooming_indo_final(chat_history, window_size=10, threshold=0.3):
      results = []
      model.eval()

      print(f"🕵️ Menganalisis {len(chat_history)} chat dengan jendela {window_size}...\n")

      for i in range(len(chat_history)):
          # Ambil konteks sliding window
          start = max(0, i - window_size + 1)
          context_chunk = " [SEP] ".join(chat_history[start:i+1])

          # 2. Terjemahkan menggunakan deep_translator
          try:
              # Tetap gunakan trik penggantian kata untuk akurasi nuansa
              text_to_process = context_chunk.replace("berani", "vulgar/nude").replace("rahasia kita", "our secret, don't tell parents")
              translated = translator.translate(text_to_process)
          except Exception as e:
              print(f"Error translasi: {e}")
              translated = context_chunk

          # 3. Tokenisasi & Prediksi
          inputs = tokenizer(translated, return_tensors="pt", padding=True, truncation=True, max_length=512).to(model.device)

          with torch.no_grad():
              outputs = model(**inputs)
              probs = F.softmax(outputs.logits, dim=-1)

              # Ambil skor Grooming (Asumsi Label 1 = Grooming)
              prob_grooming = probs[0][1].item()

          # 4. Penentuan Label berdasarkan Threshold
          label = "GROOMING" if prob_grooming >= threshold else "NORMAL"

          results.append({
              'chat': chat_history[i],
              'label': label,
              'prob': prob_grooming
          })

      return results

  # --- DATA TES ---
  percakapan = [
    "Halo cantik, kamu kelihatan dewasa sekali hari ini.",
      "Lagi sendirian ya di rumah? Mama papa pergi?",
      "Aku mau kasih hadiah rahasia buat kamu.",
      "Tapi janji ya jangan bilang mama kalau kita chat.",
      "Ini rahasia antara kita berdua saja ya sayang.",
      "Jangan kasih tahu orang tua atau teman kamu.",
      "Aku kirim uang sekarang kalau kamu mau nurut.",
      "Coba kirim foto tanpa baju kamu ke aku sekarang.",
      "Nanti aku kasih kado yang lebih mahal lagi.",
      "Ingat, jangan sampai ada yang tahu rahasia ini."
  ]
  # Jalankan
  hasil = detect_grooming_indo_final(percakapan, window_size=10, threshold=0.3)

  # --- TAMPILKAN HASIL ---
  print(f"{'STATUS':<12} | {'SKOR':<6} | {'CHAT'}")
  print("-" * 70)
  for r in hasil:
      status = "🔴 GROOMING" if r['label'] == "GROOMING" else "🟢 NORMAL"
      print(f"{status:<12} | {r['prob']*100:>5.1f}% | {r['chat']}")
#---
  from deep_translator import GoogleTranslator
  import torch
  import torch.nn.functional as F

  # 1. Inisialisasi Translator
  translator = GoogleTranslator(source='id', target='en')

  def detect_grooming_indo_final(chat_history, window_size=10, threshold=0.3):
      results = []
      model.eval()

      print(f"🕵️ Menganalisis {len(chat_history)} chat dengan jendela {window_size}...\n")

      for i in range(len(chat_history)):
          # Ambil konteks sliding window
          start = max(0, i - window_size + 1)
          context_chunk = " [SEP] ".join(chat_history[start:i+1])

          # 2. Terjemahkan menggunakan deep_translator
          try:
              # Tetap gunakan trik penggantian kata untuk akurasi nuansa
              text_to_process = context_chunk.replace("berani", "vulgar/nude").replace("rahasia kita", "our secret, don't tell parents")
              translated = translator.translate(text_to_process)
          except Exception as e:
              print(f"Error translasi: {e}")
              translated = context_chunk

          # 3. Tokenisasi & Prediksi
          inputs = tokenizer(translated, return_tensors="pt", padding=True, truncation=True, max_length=512).to(model.device)

          with torch.no_grad():
              outputs = model(**inputs)
              probs = F.softmax(outputs.logits, dim=-1)

              # Ambil skor Grooming (Asumsi Label 1 = Grooming)
              prob_grooming = probs[0][1].item()

          # 4. Penentuan Label berdasarkan Threshold
          label = "GROOMING" if prob_grooming >= threshold else "NORMAL"

          results.append({
              'chat': chat_history[i],
              'label': label,
              'prob': prob_grooming
          })

      return results

  # --- DATA TES ---
  percakapan = [
    "Halo dek, salam kenal ya.",
    "Kakak punya hadiah lho buat kamu, tapi ini rahasia kita berdua aja ya.",
    "Jangan kasih tahu orang tua atau teman kamu dulu, biar seru.",
    "Di rumah lagi ada siapa dek? Mama papa lagi pergi ya?",
    "Kalau rumah sepi, kakak boleh ke sana sekarang?",
    "Kita main di kamar kamu aja biar gak ketahuan."
  ]
  # Jalankan
  hasil = detect_grooming_indo_final(percakapan, window_size=10, threshold=0.3)

  # --- TAMPILKAN HASIL ---
  print(f"{'STATUS':<12} | {'SKOR':<6} | {'CHAT'}")
  print("-" * 70)
  for r in hasil:
      status = "🔴 GROOMING" if r['label'] == "GROOMING" else "🟢 NORMAL"
      print(f"{status:<12} | {r['prob']*100:>5.1f}% | {r['chat']}")
#---
import torch
import re
import string
import torch.nn.functional as F
from deep_translator import GoogleTranslator

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    text = text.encode("ascii", "ignore").decode()
    punctuation_cleaned = string.punctuation.replace('[', '').replace(']', '')
    text = text.translate(str.maketrans('', '', punctuation_cleaned))
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def predict_single_sentence(sentence):
    # 1. Terjemahkan dari Indo ke Inggris (Wajib karena model dilatih pakai dataset Inggris)
    try:
        translated_text = GoogleTranslator(source='id', target='en').translate(sentence)
    except Exception as e:
        print(f"Error Translasi: {e}")
        translated_text = sentence # Fallback ke teks asli jika gagal

    # 2. Pastikan model dalam mode evaluasi
    model.eval()

    # 3. Bersihkan teks (Gunakan fungsi clean_text yang sudah ada di notebook sebelumnya)
    cleaned_sentence = clean_text(translated_text)

    # 4. Tokenisasi
    inputs = tokenizer(
        cleaned_sentence,
        return_tensors="pt",
        truncation=True,
        padding="max_length",
        max_length=128
    ).to(device)

    # 5. Prediksi (Inference)
    with torch.no_grad():
        outputs = model(**inputs)
        # Ambil probabilitas menggunakan Softmax
        probs = F.softmax(outputs.logits, dim=-1)

        # probs[0][1] adalah probabilitas Grooming/Danger
        danger_score = probs[0][1].item()
        normal_score = probs[0][0].item()

    # 6. Tentukan Status
    status = "🚨 BAHAYA (Predator)" if danger_score > 0.5 else "✅ AMAN (Normal)"

    print(f"Kalimat Input : '{sentence}'")
    print(f"Terjemahan    : '{translated_text}'")
    print(f"Skor Bahaya   : {danger_score:.4f} ({danger_score*100:.2f}%)")
    print(f"Skor Aman     : {normal_score:.4f} ({normal_score*100:.2f}%)")
    print(f"Kesimpulan    : {status}")
    print("-" * 50)

# --- CONTOH PENGGUNAAN ---
print("🔍 HASIL DETEKSI SETELAH PENAMBAHAN DATA SINTETIS:\n")

# Uji kalimat yang tadinya False Positive (Harusnya Aman)
predict_single_sentence("mau")

# Uji kalimat yang mengandung manipulasi (Harusnya Bahaya)
predict_single_sentence("Aku sayang kamu, tapi ini rahasia kita berdua ya jangan bilang mama")

# Uji kalimat santai lainnya
predict_single_sentence("Hati-hati di jalan ya sayang, kabari kalau sudah sampai")
#---
# Tentukan nama folder tempat menyimpan
save_directory = "modeltanggal11"

# Simpan Model
model.save_pretrained(save_directory)

# Simpan Tokenizer (sangat penting agar cara potong katanya tetap sama)
tokenizer.save_pretrained(save_directory)

print(f"✅ Model berhasil disimpan di folder: {save_directory}")
#---
from google.colab import drive
drive.mount('/content/drive')

# Simpan ke Drive
model.save_pretrained('/content/drive/MyDrive/Colab Notebooks/bismillah lulus/modeltanggal11')
tokenizer.save_pretrained('/content/drive/MyDrive/Colab Notebooks/bismillah lulus/modeltanggal11')