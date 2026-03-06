import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
    const isDark = ref<boolean>(localStorage.getItem('theme') !== 'light')

    const toggleTheme = () => {
        isDark.value = !isDark.value
    }

    watch(isDark, (val) => {
        if (val) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }, { immediate: true })

    return {
        isDark,
        toggleTheme
    }
})
