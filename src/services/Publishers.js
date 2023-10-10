import http from "../plugins/axios";

export default {
  create: (publisher) => {
    return http.post("Publishers", publisher);
  },
  read: () => {
    return http.get("Publishers/");
  },
  update: (publisher) => {
    return http.put(`Publishers/`, publisher);
  },
  delete: (publisher) => {
    return http.delete(`Publishers/${publisher.id}`);
  },

};
