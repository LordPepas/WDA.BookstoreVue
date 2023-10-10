import http from "../plugins/axios";

export default {
  create: (book) => {
    return http.post("Books", book);
  },
  read: () => {
    return http.get("Books/");
  },
  update: (book) => {
    return http.put(`Books/`, book);
  },
  delete: (book) => {
    return http.delete(`Books/${book.id}`);
  },
};
