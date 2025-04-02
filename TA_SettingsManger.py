import json
import os

class TASettingsManager:
    def __init__(self, file_path="ta_settings.json"):
        self.file_path = file_path

    def load_settings(self):
        if os.path.exists(self.file_path):
            with open(self.file_path, "r") as file:
                return json.load(file)
        else:
            return {}

    def save_settings(self):
        settings = {
            "baseUrl": self.baseUrl,
            "apiKey": self.apiKey
        }
        with open(self.file_path, "w") as file:
            json.dump(settings, file)

    def get_setting(self, key):
        settings = self.load_settings()
        return settings.get(key, None)

    def set_setting(self, key, value):
        settings = self.load_settings()
        settings[key] = value
        with open(self.file_path, "w") as file:
            json.dump(settings, file)

instance = TASettingsManager()
print(instance.get_setting("baseUrl"))