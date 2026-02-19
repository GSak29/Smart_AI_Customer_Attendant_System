export const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const cloudName = "di3pjyd4x";
    const uploadPreset = "Smart_Retail"; // Make sure this is an Unsigned upload preset in Cloudinary settings

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Image upload failed");
        }

        const data = await response.json();
        return data.secure_url; // Return the HTTPS URL of the uploaded image
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
    }
};
