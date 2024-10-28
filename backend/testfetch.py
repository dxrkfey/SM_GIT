import requests
import cv2
import time
import os
from datetime import datetime

# The base URL of the camera API
base_url = "http://101.109.253.60:8999"
load_url = f"{base_url}/load.jsp"  # URL to fetch the updated video URL

# Counter to keep track of the captured frames
frame_count = 0
datenow = datetime.now()

# Directory to save captured frames
save_directory = f"history_pictures/{datenow.year}/{datenow.month}/{datenow.day}"
print(save_directory)

# Create the folder if it does not exist
if not os.path.exists(save_directory):
    os.makedirs(save_directory)

def get_video_url():
    """Fetch the video URL from the API (load.jsp)."""
    try:
        response = requests.get(load_url)
        if response.status_code == 200:
            # Assuming the response is a JSON string with a "videoname" key
            video_info = response.json()  # Assuming this returns a JSON object
            video_url = video_info.get("videoname", None)
            if video_url:
                return f"{base_url}/{video_url}"  # Construct full video URL
        else:
            print(f"Failed to fetch video URL, status code: {response.status_code}")
    except Exception as e:
        print(f"Error fetching video URL: {e}")
    return None

def capture_multiple_frames(video_url):
    """Capture five different frames from the video and save them."""
    cap = cv2.VideoCapture(video_url)
    
    if not cap.isOpened():
        print(f"Error: Cannot open video stream {video_url}")
        return

    # Number of frames to skip between captures (adjust as needed)

    ret, frame = cap.read()

    if ret:
        # Save each frame with a unique name
        # file_name = f"{datenow.day}.{datenow.hour}.jpg"
        file_name = f"{datenow.day}-{datenow.month}-{datenow.year}.{datenow.hour}h.jpg"
        frame_name = os.path.join(save_directory, file_name)
        cv2.imwrite(frame_name, frame)
        print(f"Frame saved as {file_name}")
    else:
        print(f"Failed to capture frame {file_name}")

    # Release the capture object
    cap.release()



# Main loop to continuously fetch updated video URLs and capture a single frame
while True:
    video_url = get_video_url()
    if video_url:
        print(f"Using video URL: {video_url}")
        capture_multiple_frames(video_url)
    else:
        print("Could not retrieve a valid video URL.")

    # Wait before checking for a new URL (adjust this interval as necessary)
    time.sleep(60)  # For example, wait 30 seconds before fetching the next URL
