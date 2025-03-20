INPUT_LIM = 9

class TAAIToolsNode:
    def __init__(self):
        self.fieldInputs = []

    @classmethod
    def INPUT_TYPES(cls):
        inputs = {
            "required": {
                "aiToolsId": ("STRING", {"default": ""}),
                "aiToolsName": ("STRING", {"default": ""}),
            },
            "optional": {},
        }

        for i in range(1, INPUT_LIM+1):
            inputs["optional"][f"nodeId_{i}"] = ("STRING", {"default": "", "tooltip": f"nodeId {i}"})
            inputs["optional"][f"fieldName_{i}"] = ("STRING", {"default": "", "tooltip": f"fieldName {i}"})
            inputs["optional"][f"fieldValue_{i}"] = ("STRING", {})

        return inputs

    RETURN_TYPES = ("STRUCT",)
    CATEGORY = "TensorArt"
    FUNCTION = "process"

    def process(self, aiToolsId, **kwargs):
        self.fieldInputs = []
        if not aiToolsId:
            return {}

        for i in range(1, INPUT_LIM + 1):
            if not kwargs.get(f"nodeId_{i}"):
                continue

            node_info = {
                "nodeId": kwargs.get(f"nodeId_{i}"),
                "fieldName": kwargs.get(f"fieldName_{i}"),
                "fieldValue": kwargs.get(f"fieldValue_{i}")
            }

            if node_info["nodeId"] == "":
                continue
            self.fieldInputs.append(node_info)

        return [{"fieldInputs": self.fieldInputs, "aiToolsId": aiToolsId}]