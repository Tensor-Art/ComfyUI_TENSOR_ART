# ComfyUI_TENSOR_ART
该项目是实现了一套ComfyUI的自定义节点，实现了部分[TAMS](https://tams.tensor.art/)提供的API接口。

### 已经支持的功能
[TensorArt](https://tensor.art)网站的AITools使用。
- 自动识别aitools所需参数。
- 节点自动渲染所需参数，对于图片和Combo类型进行特殊渲染，方便使用。

### 使用步骤
1. 项目下载到本地ComfyUI ./custom_nodes文件夹中
```
git clone git@github.com:Tensor-Art/ComfyUI_TENSOR_ART.git
```
目录结构类似：
```
./ComfyUI/custom_nodes/ComfyUI_TENSOR_ART
```
重启Comfyui加载自定义节点

2. 注册应用并获取到ApiKey
进入[应用页面](https://tams.tensor.art/apps)创建应用，并生成密钥
![image](https://github.com/user-attachments/assets/ed5b1c98-7644-46cb-adc9-f797924372a7)
3. 获取当前的BaseUrl和ApiKey
![image](https://github.com/user-attachments/assets/a2a7c83d-a7ac-4184-bc57-0a5c34e3a6a9)
4. 创建Settings节点
创建TA Settings节点，并将第三步获取到的BaseUrl和ApiKey填入
![image](https://github.com/user-attachments/assets/7a8ee242-22d0-4499-9ebe-916b982db22a)
5. 创建AITools节点
创建TA AITools节点
![image](https://github.com/user-attachments/assets/e536412b-8f21-408c-b659-10edf5c0025f)
6. 进入TensorArt获取想要使用的AIToolsID
![image](https://github.com/user-attachments/assets/f3cac147-290f-43cc-8c91-4ef741095876)
7. 将AIToolsID输入到节点内容中
会自动获取AITools内容并渲染节点
![image](https://github.com/user-attachments/assets/124df587-0e60-4446-bdfa-85b18a563df8)
8. 创建ExecuteNode进行节点的LINK
![image](https://github.com/user-attachments/assets/5dfb2950-c47d-4ea8-a612-c82f1bd226ec)
9. 执行等待结果
![image](https://github.com/user-attachments/assets/50a13afe-1b53-4644-9ea3-27c1349859a5)

