const { addUserToRequestFromJWT } = require('@learnersguild/idm-jwt-auth/lib/middlewares')
const { idmGraphQLFetch } = require('@learnersguild/idm-jwt-auth/lib/utils')

if ( !process.env.JWT_PUBLIC_KEY ) {
  throw new Error(`You do not have a JWT_PUBLIC_KEY in your .env. Please add it.`)
}

module.exports = server => {
  server.use(addUserToRequestFromJWT)

  // redirect to login if not logged in
  server.use((req, res, next) => {
    if (req.user) return next()
    const redirectTo = encodeURIComponent(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
    const loginURL = `${process.env.IDM_BASE_URL}/sign-in?redirect=${redirectTo}`
    res.redirect(loginURL)
    // res.send(`${redirectTo} ${loginURL}`)
  })

  server.use((req, res, next) => {
    req.queryIdm = function(query, variables={}){
      return idmGraphQLFetch({query, variables}, req.cookies.lgJWT)
    }
    req.queryGame = function(query, variables={}){
      return gameGraphQLFetch({query, variables}, req.cookies.lgJWT)
    }

    next()
  })
}



const gameGraphQLFetch = function(graphQLParams, token = null) {
  if (!process.env.GAME_BASE_URL) {
    throw new Error('GAME_BASE_URL must be set in environment')
  }
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'LearnersGuild-Skip-Update-User-Middleware': 1,
    },
    body: JSON.stringify(graphQLParams),
  }
  if (token) {
    options.headers = Object.assign(options.headers, {
      Authorization: `Bearer ${token}`,
    })
  }

  return fetch(`${process.env.GAME_BASE_URL}/graphql`, options)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(`GraphQL ERROR: ${resp.statusText}`)
      }
      return resp.json()
    })
    .then(graphQLResponse => {
      if (graphQLResponse.errors && graphQLResponse.errors.length) {
        const allErrors = graphQLResponse.errors.map(err => {
          return err.message
        }).join('\n')
        throw new Error(allErrors)
      }
      return graphQLResponse
    })
}
