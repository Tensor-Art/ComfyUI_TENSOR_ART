# ComfyUI_TENSOR_ART
**Read this in other languages: [English](README.md), [中文](README.zh.md)**

This project implements a set of custom nodes for ComfyUI, integrating some of the API interfaces provided by [TAMS](https://tams.tensor.art/).

### Supported Features
- Usage of AITools on the [TensorArt](https://tensor.art) website.
- Automatic recognition of parameters required by AITools.
- Nodes automatically render required parameters, with special rendering for images and combo types for ease of use.

### Usage Steps
1. **Download the Project Locally**
   - Clone the repository to the `./custom_nodes` folder of your local ComfyUI installation:
     ```
     git clone git@github.com:Tensor-Art/ComfyUI_TENSOR_ART.git
     ```
   - The directory structure should look like this:
     ```
     ./ComfyUI/custom_nodes/ComfyUI_TENSOR_ART
     ```
   - Restart ComfyUI to load the custom nodes.

2. **Register an Application and Obtain an API Key**
   - Go to the [application page](https://tams.tensor.art/apps) to create an application and generate a key.
     ![image](https://github.com/user-attachments/assets/ed5b1c98-7644-46cb-adc9-f797924372a7)

3. **Get the Current BaseUrl and API Key**
   - ![image](https://github.com/user-attachments/assets/a2a7c83d-a7ac-4184-bc57-0a5c34e3a6a9)

4. **Create a Settings Node**
Go to the settings page, find TensorArt.Settings, and enter the BaseUrl and ApiKey obtained in Step 3.
![image](https://github.com/user-attachments/assets/e14994ec-356b-4a93-81c6-8e73771dccec)

5. **Create an AITools Node**
   - Create a TA AITools node.
     ![image](https://github.com/user-attachments/assets/e536412b-8f21-408c-b659-10edf5c0025f)

6. **Get the AIToolsID from TensorArt**
   - ![image](https://github.com/user-attachments/assets/f3cac147-290f-43cc-8c91-4ef741095876)

7. **Enter the AIToolsID into the Node**
   - The node will automatically fetch the AITools content and render it.
     ![image](https://github.com/user-attachments/assets/124df587-0e60-4446-bdfa-85b18a563df8)

8. **Create an ExecuteNode to Link Nodes**
![image](https://github.com/user-attachments/assets/d6f90446-3a6c-4318-b0fd-04e6002a9a36)

9. **Execute and Wait for Results**
![image](https://github.com/user-attachments/assets/2d0afeea-05be-4bb3-94e6-f1ba75004600)
