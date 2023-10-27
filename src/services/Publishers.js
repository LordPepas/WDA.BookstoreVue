import http from "../plugins/axios";

export default {
  create: (publisher) => {
    return http.post("Publishers", publisher);
  },
  read: (params) => {
    if (!params) {
      params = {};
    }
    return http.get("Publishers", {
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
    return http.get("Publishers/SummaryData")
  },
  update: (publisher) => {
    return http.put(`Publishers/`, publisher);
  },
  delete: (id) => {
    return http.delete(`Publishers/${id}`);
  },

};
