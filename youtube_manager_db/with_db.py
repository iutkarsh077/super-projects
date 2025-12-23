import pymongo
from bson import ObjectId

client = pymongo.MongoClient("YOUR_DB_CONNECTION_URL", tlsAllowInvalidCertificates=True)

db = client["youtube_manager"]
video_collection = db["videos"]

def ListVideo():
    for videos in video_collection.find():
        print(videos)

def UpdateVideo(id, name, time):
    video_collection.update_one({"_id": ObjectId(id)}, {
        "$set": {
            "name": name,
            "time": time
        }
    })

def DeleteVideo(id):
    video_collection.delete_one({"_id": ObjectId(id)})

def AddVideo(name, time):
        video_collection.insert_one({"name": name, "time": time})

def main():
    while True:
        print("1. List all the videos ")
        print("2. Add a video ")
        print("3. Update a video ")
        print("4. Delete a video ")
        print("5. Exit ")
        choice = input("Enter your choice: ")
        match choice:
            case "1":
                ListVideo()
            case "2":
                name = input("Enter the video name: ")
                time = input("Enter the video time: ")
                AddVideo(name, time)
            case "3":
                id =  input("Enter the video id: ")
                name = input("Enter the video name: ")
                time = input("Enter the video time: ")
                UpdateVideo(id, name, time)
            case "4":
                id =  input("Enter the video id: ")
                DeleteVideo(id)
            case "5":
                break
            case _:
                print("Invalid Choice")


if __name__ == "__main__":
    main()