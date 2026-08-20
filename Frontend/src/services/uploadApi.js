import apiClient from "./apiClient";

export const uploadApi = {
    uploadImage: (file, folder = "shmart/products") => {
        const formData = new FormData();
        formData.append("image", file);
        return apiClient.post(`/uploads?folder=${folder}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};