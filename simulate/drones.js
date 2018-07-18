const http = require('http')
const socketIo = require('socket.io')

//const hostname = process.env.drone1host || '127.0.0.1'
//const port = process.env.drone1port || 3011
//const id = process.env.drone1id || 1234 // drone id
//const freq = process.env.drone1freq || 5000
const minLongitude = process.env.minLongitude || 10
const maxLongitude = process.env.maxLongitude || 30
const minLatitude = process.env.minLatitude || 50
const maxLatitude = process.env.maxLatitude || 80
const minAltitude = process.env.minAltitude || 15
const maxAltitude = process.env.maxAltitude || 35
const minSpeed = process.env.minSpeed || 0
const maxSpeed = process.env.maxSpeed || 125
const drones = require('./droneParams')

const droneSimulators = []
drones.params.forEach( (eachDrone, i) => {
  let server = http.createServer().listen(drones.params[i].port, drones.params[i].hostname, () => {
    console.log(`Drone# ${drones.params[i].id} active at http://${drones.params[i].hostname}:${drones.params[i].port}/`)
  })
  let io = socketIo(server)
  droneSimulators.push(io)
})

let intervals = [null, null]
// const io = socketIo(server)

droneSimulators.forEach((io, i) => {
  io.on('connection', socket => {
    console.log(`Drone# ${drones.params[i].id} connected`)
    if(intervals[i]) {
      clearInterval(intervals[i])
    }
    intervals[i] = setInterval(() => emitGeoLocation(socket, i), drones.params[i].freq)
    socket.on('disconnect', () => console.log('Drone disconnected'))
  })
})

const emitGeoLocation = (socket, i) => {
  try {
    data = {
      id: drones.params[i].id,
      longitude: randLongitude(),
      latitude: randLatitude(),
      altitude: randAltitude(),
      speed: randSpeed()
    }
    console.log('Geo Location data:', data)
    socket.emit(`from_${drones.params[i].id}`, data)
  } catch(error) {
    console.error(`Error: ${error} - Drone# ${drones.params[i].id}`)
  }
}

const randLongitude = () => {
  let rand = (Math.random() * (maxLongitude - minLongitude)) + minLongitude
  let degree = Math.floor(rand)
  let minute = Math.floor(Math.random() * 100)
  let second = (Math.random() * 10).toFixed(2)
  let direction = degree % 2 ? 'E' : 'W'
  //return {degree: degree, minute: minute, second: second, direction: direction}
  return degree+String.fromCharCode(176)+' '+
          minute+"' "+
          second+'" '+
          direction
}

const randLatitude = () => {
  let rand = (Math.random() * (maxLatitude - minLatitude)) + minLatitude
  let degree = Math.floor(rand)
  let minute = Math.floor(Math.random() * 100)
  let second = (Math.random() * 10).toFixed(2)
  let direction = degree % 2 ? 'N' : 'S'
  //return {degree: degree, minute: minute, second: second, direction: direction}
  return degree+String.fromCharCode(176)+' '+
          minute+"' "+
          second+'" '+
          direction
}

const randAltitude = () => {
  let rand = (Math.random() * (maxAltitude - minAltitude)) + minAltitude
  return Math.floor(rand)
}

const randSpeed = () => {
  let rand = (Math.random() * (maxSpeed - minSpeed)) + minSpeed
  return Math.floor(rand)
}