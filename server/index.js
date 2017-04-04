require('./env')

const fs = require('fs')
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

let getPlayers
if (process.env.USE_FIXTURES) {
  const players = require('./fixtures/'+process.env.NODE_ENV)
  getPlayers = () => {
    return Promise.resolve({
      data: {
        findUsers: players
      }
    })
  }
}else{

  require('./authentication')(server)

  getPlayers = (req) => {
    return req.queryIdm(`
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
  }
}


server.get('/', (req, res) => {
  getPlayers(req)
    .then(results => {
      const players = results.data.findUsers
        .filter(player => player.active)
      res.render('players', {players})
    })
    .catch(error => {
      res.status(500).render('error', {error})
    })
})

server.get('/whoami', (req, res) => {
  res.json(req.user)
})

server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})


const sortByName = (a,b) =>
  a.name.toLowerCase() < b.name.toLowerCase() ? -1 :
  a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0
