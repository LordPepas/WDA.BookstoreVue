import http from "../plugins/axios";

export default {
  create: (book) => {
    return http.post("Books", book);
  },
  read: (params) => {
    if (!params) {
      params = {};
    }
    return http.get("Books", {
      params: {
        PageNumber: params.pageNumber,
        ItemsPerPage: params.itemsPerPage,
        OrderByProperty: params.orderBy,
        OrderDesc: params.orderDesc,
        SearchValue: params.searchValue,
      },
    });
  },
  readAvailable: () =>{
    return http.get("Books/AvailableData")
  },
  readSummary: () =>{
    return http.get("Books/SummaryData")
  },
  MostRented: () =>{
    return http.get("Books/MostRented")
  },
  update: (book) => {
    return http.put(`Books/`, book);
  },
  delete: (book) => {
    return http.delete(`Books/${book}`);
  },
};
