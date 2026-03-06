import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'

export const useUIStore = defineStore('ui', () => {
    const isMaximized = ref(false)
    const isSidebarCollapsed = ref(false)
    const isMobileSidebarOpen = ref(false)

    onMounted(() => {
        if (window.ipcRenderer) {
            window.ipcRenderer.on('window-maximized', (_event: any, value: boolean) => {
                isMaximized.value = value
            })
        }
    })

    const toggleSidebar = () => {
        isSidebarCollapsed.value = !isSidebarCollapsed.value
    }

    const toggleMobileSidebar = (value?: boolean) => {
        if (typeof value === 'boolean') {
            isMobileSidebarOpen.value = value
        } else {
            isMobileSidebarOpen.value = !isMobileSidebarOpen.value
        }
    }

    return {
        isMaximized,
        isSidebarCollapsed,
        isMobileSidebarOpen,
        toggleSidebar,
        toggleMobileSidebar
    }
})
