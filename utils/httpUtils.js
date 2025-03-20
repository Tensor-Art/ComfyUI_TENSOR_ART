export const httpGet = async (url,apiKey, options = {}) => {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            ...options, // 允许传入额外的配置
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("HTTP request failed:", error);
        throw error;
    }
};

export const httpPost = async (url, apiKey, data, options = {}) => {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                ...options.headers,
            },
            body: JSON.stringify(data),
            ...options,
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("HTTP request failed:", error);
        throw error;
    }
};

