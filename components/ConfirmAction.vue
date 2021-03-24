<template>
  <div class="confirm-action">
    <el-dialog :title="'Confirm ' + action" :visible.sync="showDialog">
      <div class="prompt"><slot></slot></div>
      <div class="delete-key" v-if="deleteKey">
        <div>Type <strong>{{deleteKey}}</strong> below to confirm.</div>
        <div>
          <el-input v-model="keyValue" :placeholder="deleteKeyPrompt"></el-input>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button :disabled="isDisabled" :type='type' @click="confirmHandler">Confirm</el-button>
        <el-button @click="show(false)">Cancel</el-button>
      </span>
    </el-dialog>
    <el-button :type="type" @click="show(true)">{{action}}</el-button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'confirm-action',

  props: {
    action: {
      type: String,
      default: 'Action'
    },
    confirmHandler: {
      type: Function
    },
    deleteKey: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'danger'
    }
  },

  data () {
    return {
      keyValue: '',
      showDialog: false
    }
  },

  methods: {
    show (visible: boolean) {
      this.showDialog = visible
      this.keyValue = ''
    }
  },

  computed: {
    deleteKeyPrompt () {
      return 'Type "' + this.deleteKey + '" to confirm action.'
    },
    isDisabled () {
      // @ts-ignore
      return this.deleteKey && this.deleteKey !== this.keyValue
    }
  }
})
</script>

<style lang="stylus" scoped>
  @import '~/assets/main.styl'

  .confirm-action {
    .prompt, .delete-key, .delete-key > div {
      margin: 10px 0;
    }
  }
</style>
