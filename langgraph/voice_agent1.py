from dotenv import load_dotenv
from openai import OpenAI
import speech_recognition as sr

load_dotenv()

client = OpenAI()


def main():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Adjusting for ambient noise... Please wait")
        recognizer.adjust_for_ambient_noise(source)
        recognizer.pause_threshold = 2
        print("Listening...")
        audio = recognizer.listen(source)
    
    try:
        text = recognizer.recognize_google(audio)
        print(f"You said: {text}")
    except sr.UnknownValueError:
        print("Could not understand audio")
    except sr.RequestError:
        print("Could not request results; check your internet connection")
        
main()