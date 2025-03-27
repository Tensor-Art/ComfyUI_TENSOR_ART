import requests
from PIL import Image
from io import BytesIO
import torch
import numpy as np

class TAUploadImageNode:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "settings": ("STRUCT",),
                "image": ("IMAGE",),
            },
        }

    RETURN_TYPES = ("STRING",)
    CATEGORY = "TensorArt"
    FUNCTION = "process"

    def process(self, image: torch.Tensor, settings):
        if not settings:
            raise Exception("settings cannot be empty")

        if not isinstance(image, torch.Tensor):
            raise TypeError("image must be a torch.Tensor")

        image_np = image.detach().cpu().numpy()

        if image_np.ndim == 4:
            # 处理批量维度，例如 [B, C, H, W]
            print("Detected 4D tensor. Assuming shape [B, C, H, W]. Taking the first image in the batch.")
            image_np = image_np[0]
            print(f"Image shape after removing batch dimension: {image_np.shape}")

        if image_np.ndim == 3:
            if image_np.shape[0] in [1, 3, 4]:  # [C, H, W]
                image_np = np.transpose(image_np, (1, 2, 0))  # 转换为 [H, W, C]
                print(f"Transposed image shape to [H, W, C]: {image_np.shape}")
            elif image_np.shape[2] in [1, 3, 4]:  # [H, W, C]
                print(f"Image already in [H, W, C] format: {image_np.shape}")
            else:
                raise ValueError(f"Unsupported number of channels: {image_np.shape[2]}")
        elif image_np.ndim == 2:
            image_np = np.expand_dims(image_np, axis=-1)  # 转换为 [H, W, 1]
            print(f"Expanded grayscale image to [H, W, 1]: {image_np.shape}")
        else:
            raise ValueError(f"Unsupported image shape: {image_np.shape}")

            # 确定图像模式
        if image_np.shape[2] == 1:
            mode = "L"  # 灰度图像
            image_pil = Image.fromarray((image_np.squeeze(-1) * 255).astype(np.uint8), mode)
            print("Converted to PIL Image with mode 'L'")
        elif image_np.shape[2] == 3:
            mode = "RGB"  # RGB 图像
            image_pil = Image.fromarray((image_np * 255).astype(np.uint8), mode)
            print("Converted to PIL Image with mode 'RGB'")
        elif image_np.shape[2] == 4:
            mode = "RGBA"  # RGBA 图像
            image_pil = Image.fromarray((image_np * 255).astype(np.uint8), mode)
            print("Converted to PIL Image with mode 'RGBA'")
        else:
            raise ValueError(f"Unsupported number of channels: {image_np.shape[2]}")

        # 将 PIL 图像保存到 BytesIO 缓冲区
        buffer = BytesIO()
        image_pil.save(buffer, format='PNG')  # 可以根据需要选择 'JPEG' 或其他格式
        # 先获取缓冲区大小
        buffer_size = buffer.tell()
        # 然后重置指针到开头
        buffer.seek(0)
        print("Saved PIL Image to BytesIO buffer.")

        # 打印图像大小，以 MB 为单位
        buffer_size_mb = buffer_size / (1024 * 1024)
        print(f"Image size: {buffer_size_mb:.2f} MB")

        put_info = self.get_put_info(settings)
        print(f"Received PUT data {put_info}")
        self.upload_image(buffer, put_info)
        print("Uploaded image successfully.")

        return (put_info["resourceId"], )


    def get_put_info(self, settings):
        data = {}
        response = requests.post(f"{settings["baseUrl"]}/v1/resource/image", json=data, headers={
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': "Bearer " + settings["apiKey"]
        })

        if response.status_code != 200:
            raise Exception(f"Failed to get PUT URL: {response.text}")

        return response.json()

    def upload_image(self, buffer, put_info):
        headers = put_info["headers"]
        response = requests.put(put_info["putUrl"], data=buffer, headers=headers)
        if response.status_code != 200:
            raise Exception(f"Failed to upload image: {response.text}")

