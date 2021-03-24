import axios from '~/assets/axios'

export const CREATED = 'taskList.created'
export const GET = 'taskList.get'
export const DELETED = 'taskList.delete'


export const state = function () {
  return {
    lists: []
  }
}

export const mutations = {
  add (state, { id, name }) {
    state.lists.push({ id, name })
  },
  remove (state, id) {
    const index = state.lists.findIndex(list => list.id === id)
    if (index !== -1) state.lists.splice(index, 1)
  },
  set (state, lists) {
    state.lists = lists
  },
  rename (state, id, name) {
    const index = state.lists.findIndex(list => list.id === id)
    if (index !== -1) state.lists[index].name = name
  }
}

export const actions = {

  // create and retrieve a task list
  async add ({ commit }, name) {
    let res = await axios.post('/task-lists', { name })
    if (res.status === 201) {
      res = await axios.get(res.headers.Location)
      if (res.status === 200) {
        commit('add', res.data)
        return {
          message: {
            type: 'success',
            title: 'Task List Created',
            message: 'The task list "' + name + '" was created.'
          },
          [CREATED]: true,
          [GET]: true
        }
      } else {
        return {
          message: {
            type: 'success',
            title: 'Task List Created',
            message: 'The task list "' + name + '" was created.'
          },
          [CREATED]: true,
          [GET]: false
        }
      }
    } else {
      return {
        message: {
          type: 'error',
          title: 'Task List Not Created',
          message: 'Unable to create task list "' + name + '".'
        },
        [CREATED]: false,
        [GET]: false
      }
    }
  },

  // retrieve task list summary
  async get ({ commit }) {
    if (this.state.accounts.token) {
      const res = await axios.get('/task-lists')
      if (res.status === 200) {
        commit('set', res.data)
        return {
          message: {
            type: 'success',
            title: 'Task Lists Retrieved',
            message: 'Task lists successfully retrieved.'
          },
          [GET]: true
        }
      } else {
        return {
          message: {
            type: 'error',
            title: 'Unable to Get Task Lists',
            message: 'The task lists could not be loaded. Error: ' + res.statusCode
          },
          [GET]: false
        }
      }
    } else {
      return {
        message: {
          type: 'error',
          title: 'Unable to Get Task Lists',
          message: 'You must be authenticated to retrieve task lists.'
        },
        [GET]: false
      }
    }
  },

  // remove existing task list
  async remove ({ commit }, id) {
    const res = await axios.delete('/task-lists/' + id)
    if (res.status === 204) {
      commit('remove', id)
      return {
        message: {
          type: 'success',
          title: 'Task List Deleted',
          message: 'Task list deleted.'
        },
        [DELETED]: true
      }
    } else {
      return {
        message: {
          type: 'error',
          title: 'Unable to Delete Task List',
          message: 'Task lists could not be deleted. Error: ' + res.statusCode
        },
        [DELETED]: false
      }
    }
  },

  // rename existing task list
  rename ({ commit }, id, name) {
    // TODO: axios call
    commit('rename', id, name)
  }
}