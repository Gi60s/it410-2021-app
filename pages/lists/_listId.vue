<template>
  <div class="container">
    <div v-if="taskList">
      <h2>Tasklist: {{taskList.name}}</h2>
      <div>
        <confirm-action action="Delete Tasklist"
                        :delete-key="taskList.name"
                        :confirm-handler="deleteTaskList"
                        style="float: right">
          <p>Do you want to delete the tasklist <strong>{{taskList.name}}</strong>
            and all associated tasks?</p>
        </confirm-action>
        <el-button type="primary" @click="showModal(true)">Create Task</el-button>
      </div>

      <el-table :data="tasks" style="width: 100%">
        <el-table-column label="Completed" width="110">
          <template slot-scope="scope">
            <el-checkbox :checked="!!scope.row.completed" @change="updateChecked(scope.row)"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Description"></el-table-column>
        <el-table-column label="Files" width="150">
          <template slot-scope="scope">
            <div>
              <p v-if="!scope.row.files.length">None</p>
              <span v-for="file in scope.row.files" :key="file.id">
                <a :href='getFilePath(file)' :title="file.name" :download="file.name">{{ file.name }}</a>
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Due Date" width="130">
          <template slot-scope="scope">
            <div v-html="dateValue(scope.row.due)"></div>
          </template>
        </el-table-column>
        <el-table-column label="Command" width=150>
          <template slot-scope="scope">
            <div>
              <el-button type="text" size="small" @click="showModal(true, scope.row)">Edit</el-button>
              <el-button type="text" class="danger" size="small" @click="confirmDeleteTask()">Delete</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog :title="taskForm.id ? 'Edit Task' : 'Create New Task'" :visible.sync="modalIsVisible">
        <el-form class="create-task" ref="taskForm" :rules="taskFormRules" :model="taskForm">
          <!-- <el-form-item v-if=taskForm.id label="Completed">
            <el-checkbox :checked="!!taskForm.completed" @change="updateChecked(taskForm)"></el-checkbox>
          </el-form-item> -->
          <el-form-item label="Description" prop="description">
            <el-input v-model="taskForm.description"></el-input>
          </el-form-item>
          <el-form-item class='date-picker' label="Due Date">
            <el-date-picker v-model="taskForm.due" type="datetime" placeholder="Due date and time"></el-date-picker>
          </el-form-item>
          <el-form-item v-if=taskForm.id label="Files">
            <el-upload class='upload' :action="upload.url()" :headers="upload.headers" multiple :file-list="taskForm.files">
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
            </el-upload>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveTask()">Save</el-button>
            <el-button @click="showModal(false)">Cancel</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>
    <!-- <div v-if="loadError">
      <page-error statusCode="404">
        <p>Task list does not exist or you do not have access to view it.</p>
        <p><el-button type="primary" @click="$router.push('../')">Back to Task Lists</el-button></p>
      </page-error>
    </div> -->
    
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ConfirmAction from '~/components/ConfirmAction.vue'
import PageError from '~/components/PageError.vue'

import { CREATED } from '~/store/tasks'
import { DELETED } from '~/store/todoLists'

export default Vue.extend({

  components: {
    ConfirmAction,
    PageError
  },

  async asyncData ({ route, store }) {
    await store.dispatch('todoLists/get')
    await store.dispatch('tasks/get', route.params.listId)
  },

  data () {
    const data = {
      taskForm: {
        id: '',
        completed: '',
        description: '',
        due: '',
        files: []
      },
      taskFormRules: {
        description: [
          { required: true, message: 'Field required' }
        ]
      },
      modalIsVisible: false,
      upload: {
        headers: {
          authorization: 'Bearer ' + this.$store.state.accounts.token
        },
        url: () => process.env.baseUrl + '/tasks/' + data.taskForm.id + '/files'
      }
    }
    return data
  },

  computed: {
    taskList () {
      const lists = this.$store.state.todoLists.lists
      const index = lists.findIndex((list: any) => list.id === this.$route.params.listId)
      return index !== -1 ? lists[index] : null
    },

    tasks () {
      return this.$store.state.tasks.tasks
    }
  },

  methods: {
    async deleteTaskList () {
      const result = await this.$store.dispatch('todoLists/remove', this.$route.params.listId)
      this.$notify(result.message)
      if (result[DELETED]) this.$router.push('/')
    },

    getFilePath (file: any) {
      return process.env.baseUrl + '/files/' + file.id
    },

    saveTask () {
      // @ts-ignore
      this.$refs.taskForm.validate(async (valid: boolean) => {
        if (valid) {
          let results
          if (this.taskForm.id) {
            results = await this.$store.dispatch('tasks/update', {
              id: this.taskForm.id,
              description: this.taskForm.description,
              due: this.taskForm.due || null,
              taskListId: this.$route.params.listId,
              files: this.taskForm.files
            })
          } else {
            results = await this.$store.dispatch('tasks/create', {
              description: this.taskForm.description,
              due: this.taskForm.due || null,
              taskListId: this.$route.params.listId
            })
          }
          this.$notify(results.message)
          this.showModal(false)
        } else {
          this.$notify({
            type: 'error',
            title: 'Form Has Errors',
            message: 'The form has one or more errors.'
          })
        }
      })
    },

    showModal (show: boolean, task?: any) {
      if (task) {
        this.taskForm.id = task.id
        this.taskForm.completed = task.completed
        this.taskForm.description = task.description
        this.taskForm.due = task.due
        this.taskForm.files = task.files.map((f: any) => {
          return {
            name: f.name,
            url: process.env.baseUrl + '/tasks/' + task.id + '/files/' + f.id
          }
        })
      } else {
        this.taskForm.id = ''
        this.taskForm.completed = ''
        this.taskForm.description = ''
        this.taskForm.due = ''
        this.taskForm.files = []
      }
      this.modalIsVisible = show
    },

    dateValue (date: Date) {
      if (!date) return ''
      if (typeof date === 'string') date = new Date(date)
      return date.toLocaleDateString() + '<br>' + date.toLocaleTimeString().replace(/:\d{2} /, ' ')
    },

    updateChecked (row: any) {
      const data = Object.assign({}, row)
      if (data.completed) {
        data.completed = null
      } else {
        data.completed = new Date()
      }
      return this.updateTask(data)
    },

    async updateTask (row: any) {
      const result = await this.$store.dispatch('tasks/update', {
        id: row.id,
        description: row.description,
        due: row.due,
        completed: row.completed
      })
      this.$notify(result.message)
    }
  }
})
</script>

<style lang="stylus">
  @import '~/assets/main.styl'

  .danger, .danger:hover {
    color: color-red
  }

  .upload {
    border: 1px dashed #c0c4cc
    border-radius: 6px
    width: 360px
    height: 180px
    text-align: center
    cursor: pointer
    overflow: hidden

    .el-icon-upload {
      color: #c0c4cc
      font-size: 67px
      margin: 40px 0 16px
      line-height: 50px
    }
  }

  .el-form-item {
    label {
      float: none
    }
  }
</style>
