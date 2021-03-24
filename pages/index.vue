<template>
  <div class="container">
    <h2>Tasklists</h2>
    <p>
      <el-button type="primary" @click="showModal(true)">Create New</el-button>
    </p>
    <div v-for="list in taskLists" :key="list.id" class="task-list">
      <nuxt-link :to="'lists/' + list.id">{{list.name}}</nuxt-link>
    </div>

    <el-dialog title="Create New Tasklist" :visible.sync="modalIsVisible">
      <el-form>
        <el-form-item label="Tasklist Name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="createTasklist()">Create</el-button>
          <el-button @click="showModal(false)">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({

  data () {
    this.$store.dispatch('todoLists/get')
    return {
      form: {
        name: ''
      },
      modalIsVisible: false
    }
  },

  computed: {
    taskLists () {
      return this.$store.state.todoLists.lists
    }
  },

  methods: {
    createTasklist () {
      this.$store.dispatch('todoLists/add', this.form.name)
      this.showModal(false)
    },
    showModal (show: boolean) {
      this.form.name = ''
      this.modalIsVisible = show
    }
  }
})
</script>

<style lang="stylus">

</style>
