import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    targets: {
      endpoint: "targets",
      validate: ["data"],
    },
  },
};

export default widget;
