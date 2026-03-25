import json


class TAAIToolsNode:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "aiToolsId": ("STRING", {"default": ""}),
                "aiToolsName": ("STRING", {"default": ""}),
            },
            "optional": {
                "fieldData": ("STRING", {"default": "[]", "multiline": True}),
            },
        }

    RETURN_TYPES = ("STRUCT",)
    CATEGORY = "TensorArt"
    FUNCTION = "process"

    def process(self, aiToolsId, aiToolsName, fieldData="[]"):
        if not aiToolsId:
            return {}

        try:
            fieldInputs = json.loads(fieldData) if fieldData else []
        except json.JSONDecodeError:
            fieldInputs = []

        return [{"fieldInputs": fieldInputs, "aiToolsId": aiToolsId}]
