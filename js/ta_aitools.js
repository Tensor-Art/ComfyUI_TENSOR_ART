import {app} from '../../scripts/app.js'
import {api} from '../../scripts/api.js'
import { httpGet, httpPost } from "./utils/httpUtils.js";
import { useNodeFileInput, uploadFile } from "./utils/upload.js";
import { taMenu} from "./ta_menu.js"

const nodesList = {
    "TA_AIToolsNode": {},
}

// 存储每个节点的动态字段 widgets，以便后续清理
const nodeDynamicWidgets = new Map();

const getSettingNode = () => {
    return app.graph.findNodeByTitle("TA SettingsNode");
}

const findWidgetByName = (node, name) => {
    return node.widgets ? node.widgets.find((w) => w.name === name) : null;
};

const nodeName2Handler = {
    "TensorArt_LoadImage": loadImageHandler,
    "LoadImage": loadImageHandler,
}

function loadImageHandler(node, widget, baseUrl, apiKey) {
    console.log("loadImageHandler")
    let newWidget = node.addWidget("button", "➕📷"+widget.name, "upload", ()=> {
        const {openFileSelection} = useNodeFileInput(node, {
            accept: "image/png,image/jpeg,image/webp",
            onSelect: async (files) => {
                if (files.length !== 1) {
                    alert("Please select only one file");
                    return;
                }

                let file = files[0];
                const intervalId = setInterval(() => {
                    dialog("Uploading file, please wait...", true)
                }, 1000);
                let resourceId = null;
                try {
                  resourceId = await handleUpload(file, baseUrl, apiKey);
                  console.log("Upload completed with resource ID:", resourceId);
                } catch (error) {
                  console.error("Upload failed:", error);
                } finally {
                  clearInterval(intervalId);
                  app.ui.dialog.close();
                }
                if (resourceId) {
                    newWidget.value = resourceId;
                    widget.value = resourceId;
                    // 触发序列化更新
                    updateFieldData(node);
                }
             }
        })
        openFileSelection();
    });
    newWidget.once = true;
    return newWidget
}

function dialog(text, loading) {
    if (loading) {
        app.ui.dialog.show(`
        <div class="ta-dialog-container">
          <div class="ta-icon"></div>
          <div class="ta-loader"></div>
          <span class="ta-dialog-text">${text}</span>
        </div>
        `);
    } else {
        app.ui.dialog.show(`
        <div class="ta-dialog-container">
          <div class="ta-icon"></div>
          <span class="ta-dialog-text">${text}</span>
        </div>
        `);
    }
}

async function handleUpload(file, baseUrl, apiKey) {
    let resourceImgRes = await httpPost(baseUrl+"/v1/resource/image", apiKey, {})
    if (!resourceImgRes) {
        return;
    }
    let uploadFileRes = await uploadFile(file, resourceImgRes.putUrl, resourceImgRes.headers)
    if (uploadFileRes.Status !== "OK") {
        return;
    }
    return resourceImgRes.resourceId;
}

// 序列化所有动态字段到 fieldData
function updateFieldData(node) {
    const fieldDataWidget = findWidgetByName(node, "fieldData");
    if (!fieldDataWidget) return;

    const dynamicWidgets = nodeDynamicWidgets.get(node.id);
    if (!dynamicWidgets) return;

    const fieldInputs = dynamicWidgets.map(dw => ({
        nodeId: dw.nodeId,
        fieldName: dw.fieldName,
        fieldValue: dw.widget.value || ""
    }));

    fieldDataWidget.value = JSON.stringify(fieldInputs);
}

// 清理节点的动态 widgets
function clearDynamicWidgets(node) {
    const dynamicWidgets = nodeDynamicWidgets.get(node.id);
    if (!dynamicWidgets) return;

    for (const dw of dynamicWidgets) {
        // 删除 widget
        const idx = node.widgets.indexOf(dw.widget);
        if (idx > -1) {
            node.widgets.splice(idx, 1);
        }
        // 删除关联的 button widget (如果有)
        if (dw.buttonWidget) {
            const btnIdx = node.widgets.indexOf(dw.buttonWidget);
            if (btnIdx > -1) {
                node.widgets.splice(btnIdx, 1);
            }
        }
    }

    nodeDynamicWidgets.delete(node.id);
}

// 创建动态字段控件
function createDynamicFieldWidgets(node, fields, baseUrl, apiKey) {
    clearDynamicWidgets(node);

    const dynamicWidgets = [];

    for (const field of fields) {
        const fieldName = field.fieldName;
        const nodeId = field.nodeId;
        const defaultValue = field.fieldValue || "";

        // 创建 label widget 显示字段名
        const labelWidget = node.addWidget("text", `📋 ${fieldName}`, defaultValue, (v) => {
            updateFieldData(node);
        });

        // 设置 widget 类型和选项
        let inputStr = {};
        try {
            inputStr = JSON.parse(field.inputString || "{}");
        } catch (e) {}

        if (inputStr.options && inputStr.options.values) {
            labelWidget.type = "combo";
            labelWidget.options = inputStr.options;
        }

        const dw = {
            widget: labelWidget,
            nodeId: nodeId,
            fieldName: fieldName,
            buttonWidget: null
        };

        // 检查是否需要特殊处理（如图片上传）
        const handler = nodeName2Handler[field.nodeName];
        if (handler) {
            const btnWidget = handler(node, labelWidget, baseUrl, apiKey);
            if (btnWidget) {
                dw.buttonWidget = btnWidget;
            }
        }

        dynamicWidgets.push(dw);
    }

    nodeDynamicWidgets.set(node.id, dynamicWidgets);

    // 初始序列化
    updateFieldData(node);

    // 调整节点大小
    node.setSize(node.computeSize());
    node.setDirtyCanvas(true, true);
}

// 处理 aiToolsId 变化
async function onAiToolsIdChange(node, widget) {
    const aiToolsId = widget.value;
    if (!aiToolsId) {
        clearDynamicWidgets(node);
        const aiToolsNameWidget = findWidgetByName(node, "aiToolsName");
        if (aiToolsNameWidget) aiToolsNameWidget.value = "";
        updateFieldData(node);
        return;
    }

    let baseUrl = taMenu.getBaseUrl();
    let apiKey = taMenu.getApiKey();

    // Fallback: fetch from server settings if frontend settings are empty
    if (!baseUrl || !apiKey) {
        try {
            const resp = await api.fetchApi('/api/settings', { cache: 'no-store' });
            if (resp.status === 200) {
                const settings = await resp.json();
                baseUrl = baseUrl || settings['TensorArt.Settings.BaseUrl'] || '';
                apiKey = apiKey || settings['TensorArt.Settings.ApiKey'] || '';
            }
        } catch (e) {
            console.error("Failed to fetch settings from server:", e);
        }
    }

    if (!baseUrl || !apiKey) {
        console.error("Missing base url or api key");
        return;
    }

    try {
        const data = await httpGet(baseUrl + "/v1/workflows/" + aiToolsId, apiKey);

        // 更新 aiToolsName
        const aiToolsNameWidget = findWidgetByName(node, "aiToolsName");
        if (aiToolsNameWidget) {
            aiToolsNameWidget.value = data.name || "";
        }

        // 创建动态字段
        if (data.fields && data.fields.fieldAttrs) {
            createDynamicFieldWidgets(node, data.fields.fieldAttrs, baseUrl, apiKey);
        }
    } catch (error) {
        console.error("Failed to fetch workflow:", error);
    }
}

app.registerExtension({
    name: "tensorart-aitools",
    setup: function (){
    },
    nodeCreated(node) {
        if (node.comfyClass !== "TA_AIToolsNode") {
            return;
        }

        // 监听 aiToolsId widget 的变化
        const aiToolsIdWidget = findWidgetByName(node, "aiToolsId");
        if (!aiToolsIdWidget) return;

        // 拦截 value setter 来检测变化
        let originalValue = aiToolsIdWidget.value;
        Object.defineProperty(aiToolsIdWidget, 'value', {
            get() {
                return originalValue;
            },
            set(newVal) {
                const oldVal = originalValue;
                originalValue = newVal;
                // 延迟执行，确保 widget 值已更新
                setTimeout(() => {
                    if (newVal !== oldVal) {
                        onAiToolsIdChange(node, aiToolsIdWidget);
                    }
                }, 0);
            }
        });

        // 如果已经有 aiToolsId 值，立即加载
        if (aiToolsIdWidget.value) {
            setTimeout(() => {
                onAiToolsIdChange(node, aiToolsIdWidget);
            }, 100);
        }
    },
});
