import http from "../plugins/axios";

export default {
  create: (user) => {
    return http.post("Users", user);
  },
  read: (params) => {
    if (!params) {
      params = {};
    }
    return http.get("Users", {
      params: {
        PageNumber: params.pageNumber,
        ItemsPerPage: params.itemsPerPage,
        OrderByProperty: params.orderBy,
        OrderDesc: params.orderDesc,
        SearchValue: params.searchValue,
      },
    });
  },
  readSummary: () =>{
    return http.get("Users/SummaryData")
  },
  update: (user) => {
    return http.put(`Users/`, user);
  },
  delete: (user) => {
    return http.delete(`Users/${user.id}`);
  },
};
