import tokenService from "./tokenService";
import type { User } from "../shared.types";
import axios from "axios";

const BASE_URL = "/api/users/";

type LoginCredentials = {
  email: string;
  password: string;
};

type SignupData = {
  username: string;
  password: string;
};



async function signup(user: SignupData): Promise<boolean> {
  try {
    const response = await axios.post(`${BASE_URL}signup`, {
      username: user.username.trim(),
      password: user.password,
    });

    const token = response.data?.token ?? response.data?.accessToken;

    if (token) {
      tokenService.setToken(token);
      return true;
    }

    return false;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;

      const message =
        data?.message ||
        data?.error ||
        (typeof data === "string" ? data : null) ||
        "Unable to create your account.";

      throw new Error(message);
    }

    throw new Error("Unable to create your account.");
  }
}

function getUser(): User | null {
  return tokenService.getUserFromToken();
}

function logout(): void {
  tokenService.removeToken();
}

async function login(creds: LoginCredentials): Promise<void> {
  try {
    const res = await axios.post(BASE_URL + "login", creds);
    tokenService.setToken(res.data.token);
  } catch (err) {
    console.log("err", "this is error", err);
    throw new Error("Bad Credentials!");
  }
}

export default {
  signup,
  getUser,
  logout,
  login,
};

