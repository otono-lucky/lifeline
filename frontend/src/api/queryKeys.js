

const withParams = (key, params = {}) => [...key, params];

export const queryKeys = {
  auth: {
    all: ["auth"],
    me: () => ["auth", "me"],
  },

  users: {
    all: ["users"],
    profile: (id) => ["users", "profile", id],
    list: (params = {}) => withParams(["users", "list"], params),
    detail: (id) => ["users", "detail", id],
  },

  churches: {
    all: ["churches"],
    list: (params = {}) => withParams(["churches", "list"], params),
    publicList: (params = {}) => withParams(["churches", "public-list"], params),
    detail: (id) => ["churches", "detail", id],
    members: (id, params = {}) => withParams(["churches", "members", id], params),
  },

  admin: {
    all: ["admin"],
    overview: () => ["admin", "overview"],
    dashboard: () => ["admin", "dashboard"],
    stats: (period = "week") => ["admin", "stats", period],
    users: (params = {}) => withParams(["admin", "users"], params),
    churchAdmins: (params = {}) => withParams(["admin", "church-admins"], params),
    counselors: (params = {}) => withParams(["admin", "counselors"], params),
  },

  churchAdmin: {
    all: ["church-admin"],
    dashboard: (accountId = "self") => ["church-admin", "dashboard", accountId],
    members: (params = {}) => withParams(["church-admin", "members"], params),
    counselors: (params = {}) => withParams(["church-admin", "counselors"], params),
  },

  counselor: {
    all: ["counselor"],
    dashboard: (accountId = "self") => ["counselor", "dashboard", accountId],
    assignedUsers: (accountId = "self", params = {}) =>
      withParams(["counselor", "assigned-users", accountId], params),
    profile: (id) => ["counselor", "profile", id],
  },
};
