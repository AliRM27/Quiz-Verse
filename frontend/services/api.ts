import axios from "axios";
import { API_URL } from "./config";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchQuizzes = async () => {
  try {
    const res = await api.get("api/quizzes");
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const fetchLogo = async ({ name }: any) => {
  try {
    const res = await api.get("logos/" + name);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};
