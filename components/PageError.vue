<template>
  <div class="page-error">
    <h2>Error {{ statusCode }}</h2>
    <div>
      <slot>Page load error.</slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'confirm-action',

  props: {
    statusCode: {
      type: String,
      default: '404'
    }
  }
})
</script>

<style lang="stylus" scoped>
  @import '~/assets/main.styl'

  .page-error {
    h2 {
      color: color-red
    }

    > div > * {
      margin: 10px 0
    }
  }
</style>
