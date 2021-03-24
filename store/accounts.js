import { GET } from './todoLists'
import { getCookie, setCookie } from '~/assets/cookie'
import axios from '~/assets/axios'

export const AUTHENTICATED = 'accounts.authenticated'
export const CREATED = 'accounts.created'

export const state = function () {
  let data = getCookie('todo-account')
  if (data) data = JSON.parse(decodeURIComponent(data))
  return {
    token: data ? data.token : '',
    user: data ? data.username : ''
  }
}

export const mutations = {
  setAccount (state, { token, username }) {
    state.token = token
    state.username = username

    const cData = token
      ? encodeURIComponent(JSON.stringify({ token, username }))
      : ''
    setCookie('todo-account', cData, token ? 1 : 0)
  }
}

export const actions = {
  async authenticate ({ commit, dispatch }, { username, password }) {
    const res = await axios.put('/authenticate', { username, password })
    if (res.status === 200) {
      commit('setAccount', {
        token: res.data,
        username
      })
      return {
        message: {
          type: 'success',
          title: 'Authenticated',
          message: 'Authenticated successfully.'
        },
        [AUTHENTICATED]: true
      }
    } else {
      return {
        message: {
          type: 'error',
          title: 'Authentication Failed',
          message: 'User name or password is incorrect'
        },
        [AUTHENTICATED]: false
      }
    }
  },

  async create ({ commit, dispatch }, { username, password }) {
    const res = await axios.post('/accounts', { username, password }, { ignoreStatus: [409] })
    if (res.status === 201) {
      const results = dispatch('accounts/authenticate', username, password)
      return {
        [CREATED]: true,
        [AUTHENTICATED]: results[AUTHENTICATED],
        [GET]: results[GET]
      }
    } else if (res.status === 409) {
      return {
        message: {
          type: 'error',
          title: 'Account Creation Failed',
          message: 'The user name "' + userame + '" is already in use.'
        },
        [CREATED]: false,
        [AUTHENTICATED]: false,
        [GET]: false
      }
    }
  },

  delete ({ commit }, id) {
    
  },

  logout ({ commit }) {
    commit('setAccount', { token: '' })
  },

  update ({ commit }, id, name) {
    
  }
}