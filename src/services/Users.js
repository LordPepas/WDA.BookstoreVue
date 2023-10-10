import http from "../plugins/axios";

export default {
  create: (user) => {
    return http.post("Users", user);
  },
  read: () => {
    return http.get("Users/");
  },
  update: (user) => {
    return http.put(`Users/`, user);
  },
  delete: (user) => {
    return http.delete(`Users/${user.id}`);
  },
};
