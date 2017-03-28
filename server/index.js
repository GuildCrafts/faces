require('./env')

const https = require('express-sslify').HTTPS
const express = require('express')
const cookieParser = require('cookie-parser')
const server = express()
const PORT = process.env.PORT

server.set('view engine', 'pug')
server.set('views', __dirname+'/views');

// ensure secure connection
if (process.env.NODE_ENV === 'production') {
  server.use(https({trustProtoHeader: true}))
}

server.use(cookieParser())
server.use(express.static(__dirname+'/public'))

require('./authentication')(server)

server.get('/', (req, res) => {
  const query =
  req.queryIdm(`
    query {
      findUsers {
        name
        handle
        avatarUrl
        email
        active
      }
    }
  `)
  .then(results => {
    const players = results.data.findUsers
      .filter(player => player.active)
    res.render('players', {players})
  })
  .catch(error => {
    res.status(500).render('error', {error})
  })
})

// server.get('/idm-api-test', (req, res, next) => {
//   const query = `
//     query ($id: ID!) {
//       getUserById(id: $id) {
//         id
//         email
//       }
//     }
//   `
//   req.queryIdm(query, {id: req.utser.id})
//     .then(results => {
//       res.json(results)
//     })
//     .catch(error => {
//       res.status(500).json({
//         error: error.message,
//         stack: error.stack,
//       })
//     })
// })

// server.get('/cycledata', (req, res, next) => {
//   const query = `
//     query {
//       findProjects {
//         id
//         name
//         artifactURL
//         cycle {
//           cycleNumber
//         }
//       }
//     }
//   `
//   req.queryGame(query, {})
//     .then(results => {
//       res.json(results)
//     })
//     .catch(error => {
//       res.status(500).json({
//         error: error.message,
//         stack: error.stack,
//       })
//     })
// })

server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})
