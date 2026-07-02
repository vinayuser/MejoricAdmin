const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    PROFILE: "/users/get",
  },
  USER: {
    GET_PROFILE: "/users/get",
    UPDATE_PROFILE: "/users/update",
    GET_ALL: "/users/getAll",
    DELETE: "/users/delete?userId=",
  },
  DASHBOARD: {
    GET_DASHBOARD: "/dashboard/stats",
    GET_FINANCIALS: "/dashboard/financials",
  },
  CATEGORIES: {
    CREATE: "/categories/create",
    UPDATE: "/categories/update/:id",
    DELETE: "/categories/delete/",
    GET_ALL: "/categories/getAll",
    GET_ONE: "/categories/get/:id",
  },
  MENTORS: {
    CREATE: "/mentors/create",
    GET_ALL: "/mentors/getAll",
    GET_ONE: "/mentors/get",
    UPDATE: "/mentors/update",
    RESET_PASSWORD: "/mentors/reset-password",
    DELETE: "/users/delete?userId=",
  },
  MATES: {
    CREATE: "/mates/create",
    GET_ALL: "/mates/getAll",
    GET_ONE: "/mates/get/:id",
    UPDATE: "/mates/update/:id",
    DELETE: "/users/delete?userId=",
  },
  MENTEES: {
    CREATE: "/mentees/create",
    GET_ALL: "/mentees/getAll",
    GET_ONE: "/mentees/get/:id",
    UPDATE: "/mentees/update/:id",
    DELETE: "/mentees/delete/:id",
  },
  SMS: {
    BULK: "/sms/bulk",
  },
};

export default API_ENDPOINTS;
