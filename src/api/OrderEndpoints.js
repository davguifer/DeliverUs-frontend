import { get, post, destroy, put } from './helpers/ApiRequestsHelper'

function getMyOrders () {
  return get('orders')
}

function getOrderDetail (id) {
  return get(`orders/${id}`)
}

function create (data) {
  return post('orders', data)
}

function remove (id) { // añadido
  return destroy(`orders/${id}`)
}

function update (id, data) {
  return put(`restaurants/${id}`, data)
}

export { getMyOrders, getOrderDetail, create, remove, update }
