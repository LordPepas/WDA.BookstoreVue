import http from "../plugins/axios";

export default {
  create: (user) => {
    return http.post("Users", user);
  },
  read: (params) => {
    return http.get("Users", {
      params: {
        PageNumber: params.pageNumber,
        PageSize: params.pageSize,
        OrderBy: params.orderBy,
        OrderDesc: params.orderDesc,
        SearchValue: params.searchValue,
      },
    });
  },
  update: (user) => {
    return http.put(`Users/`, user);
  },
  delete: (user) => {
    return http.delete(`Users/${user.id}`);
  },
};
