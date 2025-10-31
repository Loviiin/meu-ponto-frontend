<template>
  <component 
    :is="renderAs"
    v-if="canRender"
    v-bind="$attrs"
    :disabled="isDisabled"
  >
    <slot></slot>
  </component>
</template>

<script>
import { getUserPermissions, hasPerm } from '../utils/permissions'

export default {
  name: 'Can',
  inheritAttrs: false,
  props: {
    perm: {
      type: String,
      required: true,
      validator: (value) => typeof value === 'string' && value.length > 0
    },
    mode: {
      type: String,
      default: 'hide',
      validator: (value) => ['hide', 'disable'].includes(value)
    },
    renderAs: {
      type: String,
      default: 'div'
    }
  },
  computed: {
    userPermissions() {
      return getUserPermissions()
    },
    hasPermission() {
      return hasPerm(this.userPermissions, this.perm)
    },
    canRender() {
      if (this.mode === 'hide') {
        return this.hasPermission
      }
      // Mode 'disable' sempre renderiza
      return true
    },
    isDisabled() {
      if (this.mode === 'disable') {
        return !this.hasPermission
      }
      return false
    }
  }
}
</script>
