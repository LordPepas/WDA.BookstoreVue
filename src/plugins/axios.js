
import axios from "axios";

const http = axios.create({
  baseURL: "https://localhost:7052/api/",
});

export default http;
