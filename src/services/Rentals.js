import http from "../plugins/axios";

export default {
  create: (rental) => {
    return http.post("Rentals", rental);
  },
  read: (params) => {
    if (!params) {
      params = {};
    }
    return http.get("Rentals", {
      params: {
        PageNumber: params.pageNumber,
        ItemsPerPage: params.itemsPerPage,
        OrderByProperty: params.orderBy,
        OrderDesc: params.orderDesc,
        SearchValue: params.searchValue,
      },
    });
  },
  update: (id) => {
    return http.put(`Rentals/${id}`);
  },
  delete: (id) => {
    return http.delete(`Rentals/${id}`);
  },
};
