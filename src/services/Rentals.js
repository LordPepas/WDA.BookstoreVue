import http from "../plugins/axios";

export default {
  create: (rental) => {
    return http.post("Rentals", rental);
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
  update: (rental) => {
    return http.put(`Rentals/`, rental);
  },
  delete: (rental) => {
    return http.delete(`Rentals/${rental.id}`);
  },
};
