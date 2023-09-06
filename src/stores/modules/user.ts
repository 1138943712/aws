import { defineStore } from "pinia";
import { UserState } from "@/stores/interface";
import piniaPersistConfig from "@/config/piniaPersist";

export const useUserStore = defineStore({
  id: "geeker-user",
  state: (): UserState => ({
    token: "213123",
    userInfo: { name: "Geeker" }
  }),
  getters: {},
  actions: {
    // Set Token
    setToken(token: string) {
      this.token = token;
    },
    // Set setUserInfo
    setUserInfo(userInfo: UserState["userInfo"]) {
      this.userInfo = userInfo;
    }
  },
  persist: piniaPersistConfig("geeker-user")
});
