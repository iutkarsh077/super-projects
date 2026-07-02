import torch
from PIL import Image
from transformers import AutoProcessor, AutoModelForImageTextToText
import os

MODEL_NAME = "OpenGVLab/InternVL3-1B-hf"

token = os.environ.get("INTERN_VL3")

device = "cuda" if torch.cuda.is_available() else "cpu"

print("Loading processor...")
processor = AutoProcessor.from_pretrained(MODEL_NAME, token=token)

print("Loading model...")
model = AutoModelForImageTextToText.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16 if device == "cuda" else torch.float32,
).to(device)

image = Image.open("food.jpg").convert("RGB")

messages = [
    {
        "role": "user",
        "content": [
            {"type": "image"},
            {"type": "text", "text": "how much nutrients is there in this food"},
        ],
    }
]

prompt = processor.apply_chat_template(
    messages,
    add_generation_prompt=True,
)

inputs = processor(
    images=image,
    text=prompt,
    return_tensors="pt",
).to(device)

with torch.no_grad():
    output = model.generate(
        **inputs,
        max_new_tokens=256,
    )

response = processor.batch_decode(
    output,
    skip_special_tokens=True,
)[0]

print(response)