import {app} from '../../scripts/app.js'
import { httpGet, httpPost } from "./utils/httpUtils.js";
import { useNodeFileInput, uploadFile } from "./utils/upload.js";

let origProps = {};
let initialized = false;
let maxCount = 99
const HIDDEN_TAG = "tahide";

const nodesList = {
    "TA_AIToolsNode": {},
    "TA_SettingsNode": {},
}
const nodeWidgetHandlers = {
    "TA_AIToolsNode": {
        "aiToolsId": TAAIToolsNodeAiToolsIdHandler,
    },
}

const nodeCreateHandlers = {
    "TA_AIToolsNode": TAAIToolsNodeCreateHandler,
}

const getSettingNode = () => {
    return app.graph.findNodeByTitle("TA SettingsNode");
}

const findWidgetByName = (node, name) => {
    return node.widgets ? node.widgets.find((w) => w.name === name) : null;
};

const findInputIndexByName = (node, name) => {
    return node.inputs ? node.inputs.findIndex((input) => input.name === name) : -1;
}

const doesInputWithNameExist = (node, name) => {
    return node.inputs ? node.inputs.some((input) => input.name === name) : false;
};

const moveWidgetBehind = (node, widget, target) => {
    const index = node.widgets.indexOf(widget);
    if (index === -1) {
        return;
    }
    node.widgets.splice(index, 1);
    const targetIndex = node.widgets.indexOf(target);
    node.widgets.splice(targetIndex+1, 0, widget);
}

function handleWidgetVisibility(node, thresholdValue, widgetNamePrefix, maxCount) {
    for (let i = 1; i <= maxCount; i++) {
        const widget = findWidgetByName(node, `${widgetNamePrefix}${i}`);
        if (widget) {
            toggleWidget(node, widget, i <= thresholdValue);
        }
    }
}

function handleInputsVisibility(node, thresholdValue, inputNamePrefix, maxCount) {
    for (let i = 1; i <= maxCount; i++) {
        toggleInput(node, `${inputNamePrefix}${i}`,  i <= thresholdValue);
    }
}

function toggleInput(node, inputName, show = false) {
    let slot = findInputIndexByName(node, inputName);
    if (!node.graph) {
        return
    }
    if (slot !== -1) {
        let input = node.inputs[slot]
        // Store the original properties of the input if not already stored
        if (!origProps[input.name]) {
            origProps[input.name] = input;
        }

        if (!show) {
            node.removeInput(slot);
        }
    } else {
        if (show) {
            let input = origProps[inputName];
            if (input) {
                origProps[inputName] = null;
                node.addInput(input.name, input.type);
            }
        }
    }
}

// Toggle Widget + change size
function toggleWidget(node, widget, show = false, suffix = "") {
    if (!widget || doesInputWithNameExist(node, widget.name)) return;
    // Store the original properties of the widget if not already stored
    if (!origProps[widget.name]) {
        origProps[widget.name] = { origType: widget.type, origComputeSize: widget.computeSize, value: widget.value };
    }

    const origSize = node.size;
    // Set the widget type and computeSize based on the show flag
    widget.type = show ? origProps[widget.name].origType : HIDDEN_TAG + suffix;
    widget.computeSize = show ? origProps[widget.name].origComputeSize : () => [0, -4];
    widget.value = show ? origProps[widget.name].value : undefined;
    // Recursively handle linked widgets if they exist
    widget.linkedWidgets?.forEach(w => toggleWidget(node, w, ":" + widget.name, show));

    // Calculate the new height for the node based on its computeSize method
    const newHeight = node.computeSize()[1];
    node.setSize([node.size[0], newHeight]);
}

function TAAIToolsNodeCreateHandler(node) {
   resetAIToolsNode(node);
}

function resetAIToolsNode(node) {
    handleWidgetVisibility(node, 0, "fieldValue_", maxCount);
    handleWidgetVisibility(node, 0, "fieldName_", maxCount);
    handleWidgetVisibility(node, 0, "nodeId_", maxCount);
    findWidgetByName(node, "aiToolsName").value = "null";
    //clean once widget
    for (let i = node.widgets.length; i >= 0; i--) {
        if (node.widgets[i]?.once) {
            node.widgets.splice(i, 1);
        }
    }
}

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
                const resourceId = await handleUpload(file, baseUrl, apiKey)
                console.log(resourceId)
                if (resourceId) {
                    newWidget.value = resourceId;
                    widget.value = resourceId;
                }
             }
        })
        openFileSelection();
    });
    newWidget.once = true;
    return newWidget
}

async function TAAIToolsNodeAiToolsIdHandler(node, widget) {
    if (!initialized) {
        return;
    }

    resetAIToolsNode(node);
    let data = {};
    let baseUrl = "";
    let apiKey = "";
    try {
        let settingNode = getSettingNode();
        if (!settingNode) {
            throw new Error("Missing settingNode");
        }

        let aiToolsId = widget.value;
        if (!aiToolsId) {
            throw new Error("Missing aiToolsId");
        }
        baseUrl = findWidgetByName(settingNode, "baseUrl")?.value
        apiKey = findWidgetByName(settingNode, "apiKey")?.value
        if (!baseUrl || !apiKey) {
            throw new Error("Missing base url or api key");
        }

        data = await httpGet(baseUrl+"/v1/workflows/"+aiToolsId, apiKey);
    } catch (error) {
        console.log(error);
    } finally {
        console.log(data)
        console.log(node)
        findWidgetByName(node, "aiToolsName").value = data.name;
        handleWidgetVisibility(node, data.fields.fieldAttrs.length, "fieldValue_", maxCount);
        handleWidgetVisibility(node, data.fields.fieldAttrs.length, "fieldName_", maxCount);
        handleWidgetVisibility(node, data.fields.fieldAttrs.length, "nodeId_", maxCount);
        data.fields.fieldAttrs.forEach((field, index) => {
            let fieldValueWidget = findWidgetByName(node, `fieldValue_${index+1}`)
            let fieldNameWidget = findWidgetByName(node, `fieldName_${index+1}`)
            let nodeIdWidget = findWidgetByName(node, `nodeId_${index+1}`)
            let h = nodeName2Handler[field.nodeName]
            if (h) {
                let newWidget = h(node, fieldValueWidget, baseUrl, apiKey)
                if (newWidget) {
                    moveWidgetBehind(node, newWidget, fieldValueWidget);
                }
            } else {
                fieldValueWidget.value = field.fieldValue;
            }
            let inputStr = JSON.parse(field.inputString)
            if (inputStr.options && inputStr.options.values) {
                fieldValueWidget.options = inputStr.options;
                fieldValueWidget.type = "combo";
                console.log(fieldValueWidget);
            }
            fieldNameWidget.value = field.fieldName;
            fieldNameWidget.disabled = true;
            nodeIdWidget.value = field.nodeId
            nodeIdWidget.disabled = true;
            nodeIdWidget.hidden = true;
        })
        const newHeight = node.computeSize()[1];
        node.setSize([node.size[0], newHeight]);
        node.setDirtyCanvas(true, true);
    }
}

function widgetLogic(node, widget) {
    const handler = nodeWidgetHandlers[node.comfyClass]?.[widget.name];
    if (handler) {
        handler(node, widget);
    }
}

function createLogic(node) {
    const handler = nodeCreateHandlers[node.comfyClass];
    if (handler) {
        handler(node);
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
    alert("upload success")
    return resourceImgRes.resourceId;
}

app.registerExtension({
    name: "tensorart-aitools",
    nodeCreated(node) {
        if (!nodesList[node.comfyClass]) {
            return
        }
        createLogic(node);
        for (const w of node.widgets || []) {
            let widgetValue = w.value;
            let originalDescriptor = Object.getOwnPropertyDescriptor(w, 'value');
            if (!originalDescriptor) {
                originalDescriptor = Object.getOwnPropertyDescriptor(w.constructor.prototype, 'value');
            }

            Object.defineProperty(w, 'value', {
                get() {
                    return originalDescriptor && originalDescriptor.get
                        ? originalDescriptor.get.call(w)
                        : widgetValue;
                },
                set(newVal) {
                    if (originalDescriptor && originalDescriptor.set) {
                        originalDescriptor.set.call(w, newVal);
                    } else {
                        widgetValue = newVal;
                    }
                    widgetLogic(node, w);
                }
            });
        }
        setTimeout(() => {initialized = true;}, 500);
    },
});
