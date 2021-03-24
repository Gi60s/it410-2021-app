<template>
  <div class="create-account">
    <el-form ref="createForm" :rules="createRules" :model="createForm" @submit.native.prevent label-width="140px" @submit="createAccount()">
      <h2>Create Account</h2>
      <el-form-item prop="username" label="User name">
        <el-input v-model="createForm.username"></el-input>
      </el-form-item>
      <el-form-item prop="password" label="Password">
        <el-input type="password" v-model="createForm.password"></el-input>
      </el-form-item>
      <el-form-item prop="password2" label="Retype Password">
        <el-input type="password" v-model="createForm.password2"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="createAccount()">Create Account</el-button>
      </el-form-item>
    </el-form>
    <p>
      <nuxt-link to="/login">Sign in with Existing Account</nuxt-link>
    </p>
  </div>
</template>

<script lang="ts">
import ElementUI from 'element-ui'
import Vue from 'vue'
import * as Validators from '~/assets/validators'

export default Vue.extend({

  data () {
    return {
      createForm: {
        username: '',
        password: '',
        password2: ''
      },
      createRules: {
        username: [
          { required: true, message: 'Field required', trigger: 'blur' }
        ],
        password: [
          { required: true, message: 'Field required', trigger: 'blur' },
          { 
            valiator: () => {
              // @ts-ignore
                this.$refs.createForm.validateField('password2');
            },
            trigger: 'blur'
          }
        ],
        password2: [
          { required: true, message: 'Field required', trigger: 'blur' },
          { 
            valiator: (rule: Validators.IRule, value: string, callback: Validators.ICallback) => {
              // @ts-ignore
              if (this.createForm.password !== this.createForm.password2) {
                callback(new Error('Passwords do not match'))
              }
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },

  methods: {
    createAccount () {
      const f = this.createForm
      const { username, password, password2 } = f

      // @ts-ignore
      this.$refs.createForm.validate(async (valid: boolean) => {
        if (valid) {
          const success = await this.$store.dispatch('accounts/create', {
            username,
            password
          })
          if (success) {
            this.$notify({
              type: 'success',
              title: 'Success',
              message: 'Account created.'
            })
            this.$router.push('/login')
          }
        } else {
          this.$notify({
            type: 'error',
            title: 'Error',
            message: 'Form has one or more errors.'
          })
          f.password = ''
          f.password2 = ''
        }
      })
    }
  }
})
</script>

<style lang="stylus" scoped>
  @import '~/assets/main.styl'

  .create-account {
    width: 500px
    margin: 0 auto
    text-align: center

    form {
      text-align: left;
    }
    
    h2 {
      margin-bottom: spacing-normal
    }
  }
</style>
