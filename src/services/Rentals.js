import http from "../plugins/axios";

export default {
  create: (rental) => {
    return http.post("Rentals", rental);
  },
  read: () => {
    return http.get("Rentals/");
  },
  update: (rental) => {
    return http.put(`Rentals/`, rental);
  },
  delete: (rental) => {
    return http.delete(`Rentals/${rental.id}`);
  },
};
