from .TA_AITools import TAAIToolsNode
from .TA_Execute import TAExecuteNode
from .TA_UploadImage import TAUploadImageNode
from . import TA_Websocket
from . import TA_SettingsManger
from . import server

WEB_DIRECTORY = "js"

NODE_CLASS_MAPPINGS = {
    "TA_AIToolsNode": TAAIToolsNode,
    "TA_ExecuteNode": TAExecuteNode,
    "TA_UploadImageNode": TAUploadImageNode,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "TA_AIToolsNode": "TA AIToolsNode",
    "TA_ExecuteNode": "TA ExecuteNode",
    "TA_UploadImageNode": "TA UploadImageNode"
}


__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS",]