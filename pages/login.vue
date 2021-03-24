<template>
  <div class="login">

    <el-form ref="loginForm" :rules="loginRules" :model="loginForm" @submit.native.prevent label-width="140px">
      <h2>Log In</h2>
      <el-form-item prop="username" label="User name">
        <el-input v-model="loginForm.username"></el-input>
      </el-form-item>
      <el-form-item prop="password" label="Password">
        <el-input type="password" v-model="loginForm.password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="login()">Log In</el-button>
      </el-form-item>
    </el-form>
    <p>
      <nuxt-link to='/create-account'>Create an Account</nuxt-link>
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
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [
          { required: true, message: 'Field required', trigger: 'blur' }
        ],
        password: [
          { required: true, message: 'Field required', trigger: 'blur' }
        ]
      }
    }
  },

  methods: {
    login () {
      const f = this.loginForm
      const { username, password } = f

      // @ts-ignore
      this.$refs.loginForm.validate(async (valid: boolean) => {
        if (valid) {
          const success = await this.$store.dispatch('accounts/authenticate', { username, password })
          if (success) {
            this.$notify({
              type: 'success',
              title: 'Success',
              message: 'You have logged in successfully.'
            })
            this.$router.push('/')
          }
        } else {
          this.$notify({
            type: 'error',
            title: 'Error',
            message: 'Form has one or more errors.'
          })
          f.password = ''
        }
      })
    }
  }
})
</script>

<style lang="stylus" scoped>
  @import '~/assets/main.styl'

  .login {
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
