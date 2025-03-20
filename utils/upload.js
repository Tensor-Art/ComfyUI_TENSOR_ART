export function useNodeFileInput(node3, options4) {
  const {
    accept: accept3,
    allow_batch = false,
    fileFilter = /* @__PURE__ */ () => true,
    onSelect
  } = options4;
  let fileInput2 = document.createElement("input");
  fileInput2.type = "file";
  fileInput2.accept = accept3 ?? "*";
  fileInput2.multiple = allow_batch;
  fileInput2.onchange = () => {
    if (fileInput2?.files?.length) {
      const files = Array.from(fileInput2.files).filter(fileFilter);
      if (files.length) onSelect(files);
    }
  };
  const useChainCallback = function (originalCallback, ...callbacks) {
      return  (...args) => {
        originalCallback?.(...args);
        callbacks.forEach((callback) => callback(...args));
      };
  }
  node3.onRemoved = useChainCallback(node3.onRemoved, () => {
    if (fileInput2) {
      fileInput2.onchange = null;
      fileInput2 = null;
    }
  });
  return {
    openFileSelection: /* @__PURE__ */ () => fileInput2?.click()
  };
}

export const uploadFile = async (file, putUrl, headers) => {
     try {
        const response = await fetch(putUrl, {
            method: "PUT",
            headers: headers,
            body: file,
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("HTTP request failed:", error);
        throw error;
    }
}