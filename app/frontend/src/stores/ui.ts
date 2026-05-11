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

        // Handle ESC key or browser button exiting fullscreen
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                isZenMode.value = false
            }
        })
    })

    const isZenMode = ref(false)
    const isSidebarHidden = ref(false)

    const toggleSidebar = () => {
        isSidebarCollapsed.value = !isSidebarCollapsed.value
    }

    const toggleSidebarHidden = (value?: boolean) => {
        isSidebarHidden.value = typeof value === 'boolean' ? value : !isSidebarHidden.value
    }

    const toggleZenMode = async (value?: boolean) => {
        const newValue = typeof value === 'boolean' ? value : !isZenMode.value
        isZenMode.value = newValue

        try {
            if (newValue) {
                if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen()
                }
            } else {
                if (document.fullscreenElement) {
                    await document.exitFullscreen()
                }
            }
        } catch (e) {
            console.error('Error toggling fullscreen:', e)
        }
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
        isZenMode,
        isSidebarHidden,
        toggleSidebar,
        toggleMobileSidebar,
        toggleZenMode,
        toggleSidebarHidden
    }
})
