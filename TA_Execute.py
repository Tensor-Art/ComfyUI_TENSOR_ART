import os
import requests
import json
import hashlib
import time
from PIL import Image
from io import BytesIO
import numpy as np
import torch
import comfy
import server
from . import TA_SettingsManger

class TAExecuteNode:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "input": ("STRUCT",),    # 输入的数据
            },
            "optional": {
                "runTimeout": ("INT", {"default": 1200}),
                "queryInterval": ("INT", {"default": 5}),
            },
        }

    RETURN_TYPES = ("IMAGE", "VIDEO")
    RETURN_NAMES = ("images", "videos")

    CATEGORY = "TensorArt"
    FUNCTION = "process"

    def process(self, input=None, runTimeout=600, queryInterval=5):
        if not input:
            return
        settings = TA_SettingsManger.instance.load_settings()
        if settings["baseUrl"] == "":
            raise Exception("baseUrl cannot be empty")

        if settings["apiKey"] == "":
            raise Exception("apiKey cannot be empty")

        print(f"settings: {settings}, input: {input} creating job...")
        createJobResponse = self.create_ai_tools_job(settings, input)
        if 'job' in createJobResponse:
            job_dict = createJobResponse['job']
            job_id = job_dict.get('id')
        else:
            raise Exception(f"Job creation failed: {createJobResponse}")

        return self.process_output(self.get_job_result(job_id, settings, runTimeout, queryInterval))

    def create_ai_tools_job(self, settings, input):
        data = {
            "requestId": hashlib.md5(str(int(time.time())).encode()).hexdigest(),
            "templateId": input["aiToolsId"],
            "fields": {
                "fieldAttrs": input["fieldInputs"]
            }
        }

        response = requests.post(f"{settings["baseUrl"]}/v1/jobs/workflow/template", json=data, headers={
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': "Bearer " + settings["apiKey"]
        })

        return response.json()

    def get_job_result(self, job_id, settings, runTimeout=600, queryInterval=5):
        pbar = comfy.utils.ProgressBar(100)
        while True:
            pbar.update(1)
            time.sleep(queryInterval)
            runTimeout -= queryInterval
            if runTimeout <= 0:
                raise Exception("Job timeout")
            try:
                response = requests.get(f"{settings["baseUrl"]}/v1/jobs/{job_id}", headers={
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': "Bearer " + settings["apiKey"]
                }, timeout=5)
            except Exception as e:  # 捕获所有异常
                print(f"An error occurred: {e}. Retrying...")
                continue
            get_job_response_data = json.loads(response.text)
            if 'job' in get_job_response_data:
                job_dict = get_job_response_data['job']
                job_status = job_dict.get('status')
                if job_status == 'SUCCESS':
                    self.send_success_message()
                    return job_dict.get("successInfo")
                elif job_status == 'FAILED':
                    raise Exception(f"Job failed: {job_dict}")
                elif job_status == 'WAITING':
                    print(f"Job status: {job_status}. Waiting..., Job dict: {job_dict}")
                    waiting_info = job_dict.get("waitingInfo")
                    queue_rank = waiting_info.get("queueRank", 1)
                    queue_len = waiting_info.get("queueLen", 1)
                    self.send_waiting_message(queue_rank, queue_len)
                elif job_status == 'RUNNING':
                    print(f"Job status: {job_status}. Running...")
                    self.send_running_message()
                else:
                    print(f"Job status: {job_status}. Checking...")

    def download_image(self, image_url):
        print(f"Downloading image: {image_url}")
        response = requests.get(image_url)

        if response.status_code == 200:
            img = Image.open(BytesIO(response.content)).convert("RGB")
            img_array = np.array(img).astype(np.float32) / 255.0
            img_tensor = torch.from_numpy(img_array)
            return img_tensor
        else:
            raise Exception(f"Failed to download image: {image_url}")

    def download_video(self, video_url):
        print(f"Downloading video: {video_url}")
        response = requests.get(video_url, stream=True)
        if response.status_code == 200:
            output_dir = "output"
            if not os.path.exists(output_dir):
                os.makedirs(output_dir)

            video_filename = f"RH_output_video_{str(int(time.time()))}.mp4"
            video_path = os.path.join(output_dir, video_filename)

            with open(video_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=1024):
                    if chunk:
                        f.write(chunk)

            return video_path
        else:
            raise Exception(f"Failed to download video: {video_url}")

    def process_output(self, result):
        print(f"Processing result: {result}")
        if not result:
            return

        image_urls = []
        video_urls = []

        for key in result:
          if key == "images":
              for img in result[key]:
                  image_urls.append(img["url"])
          if key == "videos":
              for video in result[key]:
                  video_urls.append(video["url"])


        image_data_list = []
        if image_urls:
            for url in image_urls:
                image_tensor = self.download_image(url)
                image_data_list.append(image_tensor)

        video_data_list = []
        if video_urls:
            for url in video_urls:
                video_path = self.download_video(url)
                video_data_list.append(video_path)

        self.send_end_message()
        return image_data_list, video_data_list

    def send_end_message(self):
        server.PromptServer.instance.send_sync("ta_execute", {"status": "END"}, server.PromptServer.instance.client_id)

    def send_waiting_message(self, cur, total):
        server.PromptServer.instance.send_sync("ta_execute", {"status": "WAITING", "cur": cur, "total": total}, server.PromptServer.instance.client_id)

    def send_running_message(self):
        server.PromptServer.instance.send_sync("ta_execute", {"status": "RUNNING"}, server.PromptServer.instance.client_id)

    def send_success_message(self):
        server.PromptServer.instance.send_sync("ta_execute", {"status": "SUCCESS"}, server.PromptServer.instance.client_id)

