const withParams = (key, params = {}) => [...key, params];

export const queryKeys = {
  auth: {
    all: ["auth"],
    me: () => ["auth", "me"],
  },

  users: {
    all: ["users"],
    me: () => ["users", "me"],
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
    dashboard: () => ["admin", "dashboard"],
    stats: (period = "week") => ["admin", "stats", period],
    users: (params = {}) => withParams(["admin", "users"], params),
    churchAdmins: (params = {}) => withParams(["admin", "church-admins"], params),
    counselors: (params = {}) => withParams(["admin", "counselors"], params),
  },

  churchAdmin: {
    all: ["church-admin"],
    dashboard: () => ["church-admin", "dashboard"],
    members: (params = {}) => withParams(["church-admin", "members"], params),
    counselors: (params = {}) => withParams(["church-admin", "counselors"], params),
  },

  counselor: {
    all: ["counselor"],
    dashboard: () => ["counselor", "dashboard"],
    assignedUsers: (params = {}) =>
      withParams(["counselor", "assigned-users"], params),
    profile: (id) => ["counselor", "profile", id],
  },
};
