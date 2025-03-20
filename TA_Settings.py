class TASettingsNode:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "baseUrl": ("STRING", {"default": "https://ap-east-1.tensorart.cloud"}),
                "apiKey": ("STRING", {"default": ""}),
            },
        }

    RETURN_TYPES = ("STRUCT",)
    CATEGORY = "TensorArt"
    FUNCTION = "process"

    def process(self,baseUrl, apiKey):
        return [{"baseUrl": baseUrl, "apiKey": apiKey}]