/** Admin panel — staging vs production paths */
const adminConfig = {
  /** Staging: https://mejoric.com/staging-admin/ */
  base: "/staging-admin/",
  /** Production: https://mejoric.com/admin/ */
  productionBase: "/admin/",
  devPort: 6003,

  apiBaseUrl: "https://mejoric.com/staging-api/mateandmentors",
  productionApiBaseUrl: "https://mejoric.com/mateandmentors",
  socketServerUrl: "https://mejoric.com/staging-api",
  productionSocketServerUrl: "https://mejoric.com",

  localApiBaseUrl: "http://localhost:3002/mateandmentors",
  localSocketServerUrl: "http://localhost:3002",
};

export default adminConfig;
