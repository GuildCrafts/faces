const toArray = object => [].slice.apply(object)

const playersNode = document.querySelector('.players')
const playerNodes = toArray(document.querySelectorAll('.players > .player'))
const allPlayers = playerNodes.map(node => {
  const player = JSON.parse(node.dataset.player)
  player.node = node
  return player
})
const controls = {}
document.querySelectorAll('.controls [name]').forEach(node => {
  controls[node.name] = node
})

const sorters = {
  "Name ASC": (a,b) =>
    a.name.toLowerCase() < b.name.toLowerCase() ? -1 :
    a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0
  ,
  "Name DESC": (a,b) =>
    a.name.toLowerCase() > b.name.toLowerCase() ? -1 :
    a.name.toLowerCase() < b.name.toLowerCase() ? 1 : 0
  ,
}

const renderPlayers = function(){
  let players = toArray(allPlayers)
  players.forEach(player => {
    player.node.remove()
  })

  const state = {
    active: controls.active.checked,
    sorter: sorters[controls.sortby.value] || sortByName,
    filter: controls.filter.value.toLowerCase(),
  }

  if (state.active){
    players = players.filter(player => player.active)
  }

  if (state.filter){
    players = players.filter(player =>
      (player.name+' '+player.handle+' '+player.email).toLowerCase().includes(state.filter)
    )
  }

  players.sort(state.sorter)

  console.log('rendering', players.length, 'players', state, {players})
  playersNode.append.apply(playersNode, players.map(p => p.node))
}

renderPlayers()



controls.active.addEventListener('change', renderPlayers)
controls.sortby.addEventListener('change', renderPlayers)
controls.filter.addEventListener('keyup', renderPlayers)
