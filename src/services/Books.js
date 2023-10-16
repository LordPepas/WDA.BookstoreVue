import http from "../plugins/axios";

export default {
  create: (book) => {
    return http.post("Books", book);
  },
  read: (params) => {
    return http.get("Books", {
      params: {
        PageNumber: params.pageNumber,
        PageSize: params.pageSize,
        OrderBy: params.orderBy,
        OrderDesc: params.orderDesc,
        SearchValue: params.searchValue,
      },
    });
  },
  update: (book) => {
    return http.put(`Books/`, book);
  },
  delete: (book) => {
    return http.delete(`Books/${book}`);
  },
};
