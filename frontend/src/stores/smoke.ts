import { defineStore } from "pinia";
import axios from "axios";
// Remove the @ts-ignore directive
import { 
  SmokeData, 
  SelectedSmoke, 
  FilterSmokeResponse, 
  LoadSmokeResponse 
} from '@/types/types';

interface SmokeState {
  selectedSmoke: SelectedSmoke | null;
  todayCount: number;          // Added property
  smokeStatus: number; // Added property
  percentageBlack: number | null;  // Added property

  filteredData: SmokeData[];
  totalRecords: number;
  longestSmokeEvent: SmokeData | null;
  totalSmokeTime: string;
  smokeTimePercentage: string;

  // User-related properties
  username: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  notificationTokens: string[];
  profilePicData: string;
}

const BASE_URL = "http://127.0.0.1:8000";

export const useSmokeStore = defineStore("smoke", {
  state: (): SmokeState => ({
    selectedSmoke: null,
    todayCount: 0,
    smokeStatus: 0,
    percentageBlack: null,
    filteredData: [],
    totalRecords: 0,
    longestSmokeEvent: null,
    totalSmokeTime: "00:00:00",
    smokeTimePercentage: "0.00%",

    // User-related properties
    username: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    notificationTokens: [],
    profilePicData: '',
  }),

  actions: {
    async loadSmoke(): Promise<void> {
      try {
        const response = await axios.get<LoadSmokeResponse>(`${BASE_URL}/smoke`);
        const { data, imageUrl, todayCount, smokeStatus, percentageBlack } = response.data;
        this.todayCount = todayCount;
        this.smokeStatus = smokeStatus;
        this.percentageBlack = percentageBlack;
        const selectedWithImage: SelectedSmoke = { ...data, imageUrl };
        this.selectedSmoke = selectedWithImage;
      } catch (error: any) {
        console.error("Error loading smoke:", error);
        this.selectedSmoke = null;
        this.todayCount = 0;
        this.smokeStatus = 0;
        this.percentageBlack = null;
      }
    },
    async filterSmoke(startTime: string, endTime: string): Promise<void> {
      try {
        const response = await axios.get<FilterSmokeResponse>(`${BASE_URL}/filter-smoke`, {
          params: { startTime, endTime },
        });
        const { totalRecords, filteredData, longestSmokeEvent, totalSmokeTime, smokeTimePercentage } = response.data;
        this.filteredData = filteredData || [];
        this.totalRecords = totalRecords || 0;
        this.longestSmokeEvent = longestSmokeEvent || null;
        this.totalSmokeTime = totalSmokeTime || "00:00:00";
        this.smokeTimePercentage = smokeTimePercentage || "0.00%";
      } catch (error: any) {
        console.error("Error filtering smoke data:", error);
      }
    },
    async register(userData: Record<string, any>): Promise<any | undefined> {
      try {
        const response = await axios.post(`${BASE_URL}/register`, userData);
        return response.data;
      } catch (error: any) {
        console.error("Error registering user:", error);
      }
    },

    // User Login
    async login(userData: Record<string, any>): Promise<any | undefined> {
      try {
        const response = await axios.post(`${BASE_URL}/login`, userData);
        localStorage.setItem("token", response.data.token);
        return response.data;
      } catch (error: any) {
        console.error("Error logging in:", error);
      }
    },

    // Fetch User Data
    async getUser(): Promise<any | undefined> {
      try {
        const authToken = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/user`, {
          headers: { authorization: `Bearer ${authToken}` },
        });
        return response.data;
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        if (error.response && error.response.status === 401) {
          window.location.replace("/login");
        }
      }
    },

    // Edit User Data
    async editUser(userData: Record<string, any>): Promise<any | undefined> {
      try {
        const authToken = localStorage.getItem("token");
        const response = await axios.post(`${BASE_URL}/edit-user`, userData, {
          headers: { authorization: `Bearer ${authToken}` },
        });
        return response.data;
      } catch (error: any) {
        console.error("Error editing user:", error);
      }
    },

    // Add Line Token
    async addLineToken(lineToken: string): Promise<any | undefined> {
      try {
        const authToken = localStorage.getItem("token");
        const response = await axios.post(
          `${BASE_URL}/add-linetoken`,
          { lineToken },
          {
            headers: { authorization: `Bearer ${authToken}` },
          }
        );
        return response.data;
      } catch (error: any) {
        console.error("Error adding line token:", error);
      }
    },

    // Remove Line Token
    async removeLineToken(lineID: number): Promise<any | undefined> {
      try {
        const authToken = localStorage.getItem("token");
        const response = await axios.post(
          `${BASE_URL}/remove-linetoken`,
          { lineID },
          {
            headers: { authorization: `Bearer ${authToken}` },
          }
        );
        return response.data;
      } catch (error: any) {
        console.error("Error removing line token:", error);
      }
    },

    // Update Line Token
    async updateLineToken(lineToken: string, lineID: string): Promise<any | undefined> {
      try {
        const authToken = localStorage.getItem("token");
        const response = await axios.post(
          `${BASE_URL}/edit-linetoken`,
          { lineToken, lineID },
          {
            headers: { authorization: `Bearer ${authToken}` },
          }
        );
        return response.data;
      } catch (error: any) {
        console.error("Error updating line token:", error);
      }
    },

    async loadUserData(): Promise<void> {
      try {
        const authToken = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/user`, {
          headers: { authorization: `Bearer ${authToken}` },
        });
        const userData = response.data;
        this.username = userData.Username || '';
        this.company = userData.Company || '';
        this.email = userData.Email || '';
        this.phone = userData.Phone || '';
        this.address = userData.Address || '';
        this.profilePicData = userData.ProfilePic || '';
        this.notificationTokens = Array.isArray(userData.notificationTokens)
          ? userData.notificationTokens
          : [];
      } catch (error: any) {
        console.error("Error loading user data:", error);
      }
    },

    // Update User Info
    updateUserInfo(userData: {
      username: string;
      company: string;
      email: string;
      phone: string;
      address: string;
      profilePicData: string;
    }): void {
      this.username = userData.username;
      this.company = userData.company;
      this.email = userData.email;
      this.phone = userData.phone;
      this.address = userData.address;
      this.profilePicData = userData.profilePicData;
    },

    // Add Notification Token
    addNotificationToken(token: string): void {
      this.notificationTokens.push(token);
    },
    removeNotificationToken(index: number): void {
      this.notificationTokens.splice(index, 1);
    },
    async resetPassword(newPassword: string) {
      try {
          const authToken = localStorage.getItem("token");
          if (!authToken) {
              console.error("No authentication token found.");
              window.location.replace("http://localhost:5173/login");
              return;
          }
  
          const response = await axios.post(
              `${BASE_URL}/reset-password`,
              { password: newPassword },  // Sending 'password' as key to match typical API conventions
              {
                  headers: {
                      authorization: `Bearer ${authToken}`,
                  },
              }
          );
          
          if (response.status === 200) {
              console.log("Password reset successful.");
          } else {
              console.warn("Password reset request was not successful:", response);
          }
  
      } catch (error) {
          console.error("Error in resetPassword:", error);
          if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
              window.location.replace("http://localhost:5173/login");
          } else {
              console.error("Unexpected error:", error);
          }
      }
  }
  },
});
