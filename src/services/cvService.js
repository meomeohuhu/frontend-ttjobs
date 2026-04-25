import { apiRequest } from "../lib/api.js";

/**
 * Service to handle User CV operations (builder data and file uploads)
 */
export const cvService = {
  /**
   * Fetch current user's profile which includes CV builder data
   */
  getMyCvProfile: async () => {
    return await apiRequest("/api/users/me");
  },

  /**
   * Update CV builder data in the user profile
   * @param {Object} data - { name, phone, cvRole, cvObjective, cvExperienceHighlights, skills }
   */
  updateCvProfile: async (data) => {
    return await apiRequest("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Upload a CV file from the computer to Cloudinary
   * @param {File} file - The PDF or DOC file object
   */
  uploadCvFile: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    // Note: apiRequest in lib/api.js expects JSON by default if body is an object, 
    // we might need to handle FormData specifically. 
    // Let's check api.js first.
    return await apiRequest("/api/users/me/cv", {
      method: "POST",
      body: formData,
      // Pass null to headers to let the browser set the Content-Type with boundary
      headers: {}, 
    });
  },

  /**
   * Delete the current CV file
   */
  deleteCvFile: async () => {
    return await apiRequest("/api/users/me/cv", {
      method: "DELETE",
    });
  }
};
