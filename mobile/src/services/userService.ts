// services/userService.ts
// Profile enrichment, photo uploads, and social handles

import apiClient from "./apiClient";
import { ApiResponse, UserProfile, UserPhoto, SocialMediaHandle } from "../types";

export const userService = {
  // Update Profile Data (recalculates 100% completion score)
  updateProfile: async (userId: string, data: Partial<UserProfile>) => {
    const response = await apiClient.put<ApiResponse<{ user: UserProfile }>>(
      `/users/${userId}`,
      data,
    );
    return response.data;
  },

  // Upload Profile Photo (order: 1, 2, or 3)
  uploadPhoto: async (userId: string, imageUri: string, order: number) => {
    const formData = new FormData();
    const filename = imageUri.split("/").pop() || `photo_${order}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    // @ts-ignore: React Native FormData file signature
    formData.append("image", {
      uri: imageUri,
      name: filename,
      type,
    });
    formData.append("order", String(order));

    const response = await apiClient.post<ApiResponse<{ photo: UserPhoto }>>(
      `/users/${userId}/photos`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  // Social handles
  getSocials: async (userId: string) => {
    const response = await apiClient.get<ApiResponse<{ socials: SocialMediaHandle[] }>>(
      `/users/${userId}/socials`,
    );
    return response.data;
  },

  addSocial: async (
    userId: string,
    platform: "LinkedIn" | "Instagram" | "Facebook",
    handleOrUrl: string,
  ) => {
    const response = await apiClient.post<ApiResponse<{ social: SocialMediaHandle }>>(
      `/users/${userId}/socials`,
      { platform, handleOrUrl },
    );
    return response.data;
  },

  removeSocial: async (userId: string, socialId: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/users/${userId}/socials/${socialId}`,
    );
    return response.data;
  },

  // Churches public list
  getPublicChurches: async () => {
    const response = await apiClient.get<
      ApiResponse<{
        churches: Array<{
          id: string;
          officialName: string;
          aka?: string;
          churchModel: "PARENT_BRANCH" | "INDIVIDUAL_PARISH";
          state: string;
          city: string;
        }>;
      }>
    >("/churches/public");
    return response.data;
  },
};

export default userService;
