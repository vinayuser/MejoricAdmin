/** Admin panel — staging vs production paths */
const adminConfig = {
  /** Production: https://admin.mejoric.com/ */
  base: "/",
  /** Staging: https://admin-dev.mejoric.com/ */
  stagingBase: "/",
  productionBase: "/",
  devPort: 6003,

  apiBaseUrl: "https://mejoric.com/staging-api/mateandmentors",
  productionApiBaseUrl: "https://mejoric.com/mateandmentors",
  socketServerUrl: "https://mejoric.com/staging-api",
  productionSocketServerUrl: "https://mejoric.com",

  localApiBaseUrl: "http://localhost:3002/mateandmentors",
  localSocketServerUrl: "http://localhost:3002",
};

export default adminConfig;
