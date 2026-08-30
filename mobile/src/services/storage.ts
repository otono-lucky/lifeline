// services/storage.ts
// Encrypted token & session storage abstraction using expo-secure-store with web/fallback support

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "lifeline_jwt_token";

export const storage = {
  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        return await AsyncStorage.getItem(TOKEN_KEY);
      }
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.warn("[storage] Failed to get secure token, falling back to AsyncStorage:", error);
      return await AsyncStorage.getItem(TOKEN_KEY);
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        await AsyncStorage.setItem(TOKEN_KEY, token);
        return;
      }
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.warn("[storage] Failed to set secure token, falling back to AsyncStorage:", error);
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
  },

  async removeToken(): Promise<void> {
    try {
      if (Platform.OS === "web") {
        await AsyncStorage.removeItem(TOKEN_KEY);
        return;
      }
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.warn("[storage] Failed to delete secure token, falling back to AsyncStorage:", error);
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  },
};

export default storage;
