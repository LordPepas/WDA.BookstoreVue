import http from "../plugins/axios";

export default {
  create: (book) => {
    return http.post("Books", book);
  },
  read: () => {
    return http.get("Books/");
  },
  selectPublishers: () => {
    return http.get("Books/selectPublishers");
  },
  update: (book) => {
    return http.put(`Books/`, book);
  },
  delete: (book) => {
    return http.delete(`Books/${book.id}`);
  },
};
