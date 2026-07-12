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

MODEL_PATH = "./modelfinal"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print(f"🚀 Loading model from {MODEL_PATH}...")
tokenizer = BertTokenizer.from_pretrained(MODEL_PATH)
tokenizer.add_special_tokens({'additional_special_tokens': ['[UTT]']})

model = BertForSequenceClassification.from_pretrained(MODEL_PATH).to(device)
model.resize_token_embeddings(len(tokenizer))
model.eval()

translator = GoogleTranslator(source='id', target='en')

chat_history: dict[str, list[str]] = {}

class ChatInput(BaseModel):
    text: str
    session_id: str = "default_session"

def detect_grooming_hybrid(translated_history: list[str], window_size: int = 10):
    if not translated_history:
        return {'label': "NORMAL", 'conf_score': 0.0, 'prob_grooming': 0.0, 'prob_normal': 1.0}

    latest_translated = str(translated_history[-1])

    start = max(0, len(translated_history) - window_size)
    context_chunk = " [UTT] ".join(translated_history[start:])
    print(f"DEBUG: Joined Context [UTT] -> {context_chunk}")

    inputs_single = tokenizer(latest_translated, return_tensors="pt", padding=True, truncation=True, max_length=256).to(device)
    inputs_context = tokenizer(context_chunk, return_tensors="pt", padding=True, truncation=True, max_length=256).to(device)

    with torch.no_grad():
        out_single = model(**inputs_single)
        S_stand = F.softmax(out_single.logits, dim=-1)[0][1].item()

        out_context = model(**inputs_context)
        S_context = F.softmax(out_context.logits, dim=-1)[0][1].item()

    S_final = (0.5 * S_stand) + (0.5 * S_context)
    # THRESHOLD OPTIMAL (dari grid search 2D pada validation set, F1-Macro = 0.8293)
    if S_final >= 0.475:
        label = "GROOMING"
    elif S_final >= 0.40:
        label = "WARNING"
    else:
        label = "NORMAL"

    conf_score = S_final

    return {
        'label': label,
        'conf_score': conf_score,
        'prob_grooming': S_final,
        'prob_normal': final_prob_normal,
        'standalone_prob': S_stand,
        'context_prob': S_context
    }

@app.post("/predict")
async def predict(data: ChatInput):
    global chat_history
    session_id = data.session_id

    if session_id not in chat_history:
        chat_history[session_id] = []

    if not data.text.strip():
        return {"score": 0, "status": "NORMAL"}

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

    chat_history[session_id].append(translated_text)

    if len(chat_history[session_id]) > 10:
        chat_history[session_id] = chat_history[session_id][-10:]

    mode_label = "window" if len(chat_history[session_id]) > 1 else "single"

    hasil = detect_grooming_hybrid(chat_history[session_id])

    print(f"Session: {session_id} | Mode: {mode_label} | Input: {data.text} | Standalone: {hasil['standalone_prob']:.2f} | Context: {hasil['context_prob']:.2f} | Final: {hasil['label']}")

    return {
        "status": hasil['label'],
        "score": hasil['conf_score'],
        "grooming_raw": hasil['prob_grooming'],
        "normal_raw": hasil['prob_normal'],
        "translated": translated_text,
        "standalone_score": hasil['standalone_prob'],
        "context_score": hasil['context_prob'],
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
