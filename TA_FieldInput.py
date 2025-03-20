class TAFieldInputNode:
    def __init__(self):
        self.fieldInputs = []

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "nodeId": ("STRING", {"default": ""}),
                "fieldName": ("STRING", {"default": ""}),
                "fieldValue": ("STRING", {"default": ""}),
            },
            "optional": {
                "previousFieldInput": ("ARRAY", {"default": []}),  # 使其为可选，默认值为空列表
            }
        }

    RETURN_TYPES = ("ARRAY",)
    CATEGORY = "TensorArt"
    FUNCTION = "process"

    def process(self, nodeId, fieldName, fieldValue, previousFieldInput):
        self.fieldInputs = []
        if previousFieldInput:
            self.fieldInputs.extend(previousFieldInput)

        node_info = {"nodeId": nodeId, "fieldName": fieldName, "fieldValue": fieldValue}
        self.fieldInputs.append(node_info)

        return [self.fieldInputs]