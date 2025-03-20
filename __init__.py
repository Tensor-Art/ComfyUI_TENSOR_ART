from .TA_Settings import TASettingsNode
from .TA_AITools import TAAIToolsNode
from .TA_Execute import TAExecuteNode

WEB_DIRECTORY = "js"

NODE_CLASS_MAPPINGS = {
    "TA_SettingsNode": TASettingsNode,
    "TA_AIToolsNode": TAAIToolsNode,
    "TA_ExecuteNode": TAExecuteNode,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "TA_SettingsNode": "TA SettingsNode",
    "TA_AIToolsNode": "TA AIToolsNode",
    "TA_ExecuteNode": "TA ExecuteNode"
}


__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS",]