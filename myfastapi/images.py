import dotenv
from openai import OpenAI

dotenv.load_dotenv()


client = OpenAI()

response = client.responses.create(
    model="gpt-4.1-mini",
    input=[{
        "role": "user",
        "content": [
            { "type": "input_text", "text": "What's in this image" },
            {
                "type": "input_image",
                "image_url": "https://images.pexels.com/photos/6796608/pexels-photo-6796608.jpeg"
            }
        ]
    }]
)

print(response.output_text)