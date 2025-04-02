import {app} from '../../scripts/app.js'
import {api} from '../../scripts/api.js'
import { ComfyButtonGroup } from '../../scripts/ui/components/buttonGroup.js';

class TAMenu {
    name = "TensorArt.Menu";
    settingName = "TensorArt.Settings";

    baseUrlID = this.settingName + ".BaseUrl";
    apiKeyID = this.settingName + ".ApiKey";

    getBaseUrl = () => {
        return app.extensionManager.setting.get(this.baseUrlID);
    }

    getApiKey = () => {
        return app.extensionManager.setting.get(this.apiKeyID);
    }

    updateServer = async (settings) => {
        const resp = await api.fetchApi('/tensorart/settings', {
            method: 'PATCH',
            body: JSON.stringify(settings),
            cache: 'no-store',
        });
        if (resp.status === 200) {
            return await resp.text();
        }
        throw new Error(resp.statusText);
    }

    createSetting = () => {
        return [{
            id: this.baseUrlID,
            name: 'BaseUrl',
            category: [this.settingName, 'TAMS_Configuration', "baseUrl"],
            tooltip: 'Base URL for TAMS',
            type: 'string',
            defaultValue: "",
            onChange: (value) => {
                this.updateServer({"baseUrl": value}).then(r => {
                    console.log(r);
                })
            }
        }, {
            id: this.apiKeyID,
            name: 'ApiKey',
            category: [this.settingName, 'TAMS_Configuration', "apiKey"],
            tooltip: "API Key for TAMS",
            type: 'string',
            defaultValue: "",
            onChange: (value) => {
               this.updateServer({"apiKey": value}).then(r => {
                    console.log(r);
                })
            }
        }]
    }
    setup = () => {
        const settings = this.createSetting();
        for (const setting of settings) {
            app.ui.settings.addSetting(setting);
        }
        // this.buttonGroup = new ComfyButtonGroup();
        // app.menu?.settingsGroup.element.before(this.buttonGroup.element);
        // this.buttonGroup.element.appendChild(this.createButtonDiv());
    }

    // createButtonDiv = ()=> {
    //     const div = document.createElement('div');
    //     div.className = 'button-div';
    //     const button = document.createElement('button');
    //     button.textContent = 'Click Me';
    //     button.className = 'my-button';
    //     button.addEventListener('click', () => {
    //         alert('Button clicked!');
    //     });
    //     div.appendChild(button);
    //     return div;
    // }
}


export var taMenu = new TAMenu();
app.registerExtension({
    name: taMenu.name,
    setup: taMenu.setup,
});

