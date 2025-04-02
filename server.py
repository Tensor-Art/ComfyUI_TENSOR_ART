from . import TA_SettingsManger
from server import PromptServer
from aiohttp import web
import json
import os

@PromptServer.instance.routes.patch("/tensorart/settings")
async def settings(request):
    data = await request.json()
    baseUrl = data.get("baseUrl")
    apiKey = data.get("apiKey")

    if baseUrl is not None:
        TA_SettingsManger.instance.set_setting("baseUrl", baseUrl)

    if apiKey is not None:
        TA_SettingsManger.instance.set_setting("apiKey", apiKey)

    return web.json_response({"status": "success", "message": "Settings updated successfully"})



