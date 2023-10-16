import http from "../plugins/axios";

export default {
  create: (publisher) => {
    return http.post("Publishers", publisher);
  },
  read: (params) => {
    return http.get("Publishers", {
      params: {
        PageNumber: params.pageNumber,
        PageSize: params.pageSize,
        OrderBy: params.orderBy,
        OrderDesc : params.orderDesc,
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
  delete: (publisher) => {
    return http.delete(`Publishers/${publisher.id}`);
  },

};
