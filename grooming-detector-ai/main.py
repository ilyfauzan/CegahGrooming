import torch
import torch.nn.functional as F
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from transformers import BertTokenizer, BertForSequenceClassification
from deep_translator import GoogleTranslator

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Konfigurasi Model
MODEL_PATH = "./"  # Diatur ke root untuk deployment Hugging Face
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print(f"🚀 Loading model from {MODEL_PATH}...")
tokenizer = BertTokenizer.from_pretrained(MODEL_PATH)
model = BertForSequenceClassification.from_pretrained(MODEL_PATH).to(device)
model.eval()

translator = GoogleTranslator(source='id', target='en')

chat_history: dict[str, list[str]] = {} # Ubah menjadi dictionary untuk menyimpan history per session_id
 
class ChatInput(BaseModel):
    text: str
    session_id: str = "default_session"
    mode: str = "single" # Tambahkan parameter mode (single atau window)
 
# --- HELPER: BERT INFERENCE ---
def get_bert_probability(text: str):
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512).to(device)
    with torch.no_grad():
        outputs = model(**inputs)
        # Ambil probabilitas kelas index 1 (Grooming)
        prob = F.softmax(outputs.logits, dim=-1)[0][1].item()
    return prob

# --- FUNGSI DETEKSI SINGLE (MURNI 1 PESAN) ---
def detect_grooming_single(text: str):
    prob_grooming = get_bert_probability(text)
    prob_normal = 1.0 - prob_grooming
    
    # Thresholding
    if prob_grooming >= 0.75:
        label = "GROOMING"
    elif prob_grooming >= 0.5:
        label = "WARNING"
    else:
        label = "NORMAL"
        
    return {
        'label': label,
        'conf_score': prob_grooming if label != "NORMAL" else prob_normal,
        'prob_grooming': prob_grooming,
        'prob_normal': prob_normal,
        'standalone_prob': prob_grooming,
        'context_prob': 0.0 # Tidak ada konteks di mode single
    }

# --- FUNGSI DETEKSI HYBRID (STANDALONE + CONTEXT) ---
def detect_grooming_hybrid(translated_history: list[str], window_size: int = 10):
    if not translated_history:
        return {'label': "NORMAL", 'conf_score': 0.0, 'prob_grooming': 0.0, 'prob_normal': 1.0}
 
    # 1. Ambil kalimat terbaru dan konteks
    latest_translated = str(translated_history[-1])
    start = max(0, len(translated_history) - window_size)
    context_chunk = " [SEP] ".join(translated_history[start:])
 
    # 2. Inperensi Standalone & Konteks via Helper
    prob_single = get_bert_probability(latest_translated)
    prob_context = get_bert_probability(context_chunk)
        
    # 3. HYBRID SCORING (50/50 Weight)
    final_prob_grooming = (0.5 * prob_single) + (0.5 * prob_context)
    final_prob_normal = 1.0 - final_prob_grooming
 
    # Thresholding
    if final_prob_grooming >= 0.75:
        label = "GROOMING"
    elif final_prob_grooming >= 0.5:
        label = "WARNING"
    else:
        label = "NORMAL"
 
    return {
        'label': label,
        'conf_score': final_prob_grooming if label != "NORMAL" else final_prob_normal,
        'prob_grooming': final_prob_grooming,
        'prob_normal': final_prob_normal,
        'standalone_prob': prob_single,
        'context_prob': prob_context
    }
 
@app.post("/predict")
async def predict(data: ChatInput):
    global chat_history
    session_id = data.session_id
    
    if session_id not in chat_history:
        chat_history[session_id] = []
        
    if not data.text.strip():
        return {"score": 0, "status": "NORMAL"}
    
    # 1. Cek apakah teks sudah bahasa Inggris (Simple check)
    def is_english(text):
        english_words = {"hello", "hi", "how", "are", "you", "my", "friend", "what", "is", "your"}
        words = set(text.lower().split())
        return len(words.intersection(english_words)) > 0

    try:
        if is_english(data.text):
            translated_text = data.text
        else:
            translated_text = translator.translate(data.text)
    except Exception as e:
        print(f"Translation error: {e}")
        translated_text = data.text

    # 2. Simpan hasil terjemahan ke history
    chat_history[session_id].append(translated_text)
    
    if len(chat_history[session_id]) > 10:
        chat_history[session_id] = chat_history[session_id][-10:] 
    
    # 3. Jalankan deteksi Otomatis (Uni-Mode)
    # Jika history hanya 1 (pesan baru pertama), gunakan Single. 
    # Jika > 1, gunakan Window (Hybrid).
    if len(chat_history[session_id]) > 1:
        hasil = detect_grooming_hybrid(chat_history[session_id])
        mode_label = "window"
    else:
        hasil = detect_grooming_single(translated_text)
        mode_label = "single"
    
    print(f"Session: {session_id} | Auto-Mode: {mode_label} | Input: {data.text} | Standalone: {hasil['standalone_prob']:.2f} | Context: {hasil['context_prob']:.2f} | Final: {hasil['label']}")
    
    return {
        "score": hasil['prob_grooming'],
        "status": hasil['label'],
        "confidence": hasil['conf_score'],
        "standalone_score": hasil['standalone_prob'],
        "context_score": hasil['context_prob'],
        "translated": translated_text,
        "mode_used": mode_label
    }
 
class ResetInput(BaseModel):
    session_id: str = "default_session"
 
@app.post("/reset")
async def reset(data: ResetInput):
    global chat_history
    session_id = data.session_id
    
    if session_id in chat_history:
        chat_history[session_id] = []
        return {"message": f"Chat history cleared for session {session_id}"}
    else:
         return {"message": "Session not found or already empty"}
         
@app.post("/reset_all")
async def reset_all():
    global chat_history
    chat_history = {}
    return {"message": "All chat history cleared"}
 
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)