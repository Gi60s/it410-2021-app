import axios from '~/assets/axios'

export const CREATED = 'tasks.created'
export const DELETED = 'tasks.deleted'
export const GET = 'tasks.get'
export const UPDATED = 'tasks.updated'

/**
 * @typedef Task
 * @property {string} id
 * @property {string} description
 * @property {Date} due
 * @property {Date} completed
 * @property {Array} files
 */

export const state = function () {
  return {
    tasks: []
  }
}

export const mutations = {
  remove (state, taskId) {
    const index = state.tasks.findIndex(t => t.id === taskId)
    if (index !== -1) state.tasks.splice(index, 1)
  },
  setTasks (state, tasks) {
    state.tasks = tasks
  },
  update (state, task) {
    const index = state.tasks.findIndex(t => t.id === task.id)
    if (index !== -1) state.tasks.splice(index, 1, task)
  }
}

export const actions = {

  async create ({ commit, dispatch }, { taskListId, description, due }) {
    const payload = {
      description,
      due: due ? due.toISOString() : null,
      completed: null
    }
    const res = await axios.post('/task-lists/' + taskListId + '/tasks', payload)
    if (res.status === 201) {
      const result = await dispatch('get', taskListId)
      if (result[GET]) {
        return {
          message: {
            type: 'success',
            title: 'Task Created',
            message: 'Task successfully created.'
          },
          [CREATED]: true,
          [GET]: true
        }
      } else {
        return {
          message: {
            type: 'info',
            title: 'Task Created',
            message: 'Task created but unable to get latest tasks.'
          },
          [CREATED]: true,
          [GET]: false
        }
      }
    } else {
      return {
        message: {
          type: 'error',
          title: 'Task Creation Failed',
          message: 'The task could not be created. Error: ' + res.status
        },
        [CREATED]: false,
        [GET]: false
      }
    }
  },

  async delete ({ commit }, id) {
    const res = await axios.delete('/tasks/' + id)
    if (res.status === 204) {
      commit('remove', id)
      return {
        message: {
          type: 'success',
          title: 'Task Deleted',
          message: 'Task successfully deleted.'
        },
        [DELETED]: true
      }
    } else {
      return {
        message: {
          type: 'error',
          title: 'Task Delete Failed',
          message: 'Unable to delete task. Error: ' + res.status
        },
        [DELETED]: false
      }
    }
  },

  async get ({ commit }, taskListId) {
    const res = await axios.get('/task-lists/' + taskListId + '/tasks')
    if (res.status === 200) {
      commit('setTasks', res.data)
      return {
        message: {
          type: 'success',
          title: 'Tasks Retrieved',
          message: 'Task successfully retrieved.'
        },
        [GET]: true
      }
    } else {
      return {
        message: {
          type: 'error',
          title: 'Task Retrieve Failed',
          message: 'Unable to retrieve tasks. Error: ' + res.status
        },
        [GET]: false
      }
    }
  },

  async update ({ commit }, payload) {
    const res = await axios.put('/tasks/' + payload.id, payload)
    if (res.status === 200) {
      commit('update', payload)
      return {
        message: {
          type: 'success',
          title: 'Task Updated',
          message: 'Task successfully updated.'
        },
        [UPDATED]: true
      }
    } else {
      return {
        message: {
          type: 'error',
          title: 'Task Update Failed',
          message: 'Task could not be updated. Error: ' + res.status
        },
        [UPDATED]: true
      }
    }
  }
}