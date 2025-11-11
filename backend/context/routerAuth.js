const { Routeros } = require('routeros-node')

async function login({ host, port, user, password }) {
  const router = new Routeros({
    host,
    port,
    user,
    password,
  });

  return router.connect();
}

module.exports = { login }