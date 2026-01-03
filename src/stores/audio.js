import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAudioStore = defineStore('audio', () => {
    const currentAmbient = ref('none')
    const isPlaying = ref(false)
    const volume = ref(0.5)

    // 可用的环境音效
    const ambientSounds = [
        { id: 'forest', name: '森林', icon: '🌲', file: 'forest.mp3' },
        { id: 'ocean', name: '海洋', icon: '🌊', file: 'ocean.mp3' },
        { id: 'rain', name: '雨声', icon: '🌧️', file: 'rain.mp3' },
        { id: 'cafe', name: '咖啡馆', icon: '☕', file: 'cafe.mp3' },
        { id: 'space', name: '太空', icon: '🚀', file: 'space.mp3' },
        { id: 'none', name: '静音', icon: '🔇', file: null }
    ]

    // 提醒音效
    const reminderSounds = [
        { id: 'chime', name: '风铃', file: 'chime.mp3' },
        { id: 'bell', name: '铃铛', file: 'bell.mp3' },
        { id: 'pop', name: '气泡', file: 'pop.mp3' },
        { id: 'nature', name: '自然', file: 'nature.mp3' }
    ]

    const selectedReminder = ref('chime')

    // 模拟音频播放（实际项目中需要真实音频文件）
    function playAmbient(soundId) {
        if (soundId === 'none') {
            stopAmbient()
            return
        }

        currentAmbient.value = soundId
        isPlaying.value = true

        // 这里可以集成真实的音频库，如 Howler.js
        console.log(`🎵 开始播放环境音效: ${soundId}`)

        // 模拟音效播放
        showSoundNotification(ambientSounds.find(s => s.id === soundId))
    }

    function stopAmbient() {
        currentAmbient.value = 'none'
        isPlaying.value = false
        console.log('🔇 停止播放音效')
    }

    function playReminder() {
        console.log(`🔔 播放提醒音效: ${selectedReminder.value}`)

        // 模拟提醒效果
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200])
        }

        // 视觉提醒
        flashScreen()

        // 播放声音（实际需要音频文件）
        return new Promise(resolve => {
            setTimeout(() => resolve(true), 500)
        })
    }

    function setVolume(val) {
        volume.value = Math.max(0, Math.min(1, val))
    }

    function setReminderSound(soundId) {
        selectedReminder.value = soundId
    }

    // 视觉反馈
    function flashScreen() {
        const overlay = document.createElement('div')
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.3);
            z-index: 9999;
            pointer-events: none;
            animation: flash 0.5s ease-out;
        `

        // 添加动画样式
        if (!document.getElementById('flash-style')) {
            const style = document.createElement('style')
            style.id = 'flash-style'
            style.textContent = `
                @keyframes flash {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 1; }
                }
            `
            document.head.appendChild(style)
        }

        document.body.appendChild(overlay)
        setTimeout(() => overlay.remove(), 500)
    }

    function showSoundNotification(sound) {
        if (!sound) return

        // 创建音效可视化
        const notification = document.createElement('div')
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.95);
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            font-size: 16px;
            animation: slideIn 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 10px;
        `
        notification.innerHTML = `
            <span style="font-size: 24px;">${sound.icon}</span>
            <span style="font-weight: 600; color: #333;">${sound.name} 音效已启用</span>
        `

        // 添加动画样式
        if (!document.getElementById('slidein-style')) {
            const style = document.createElement('style')
            style.id = 'slidein-style'
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `
            document.head.appendChild(style)
        }

        document.body.appendChild(notification)
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse'
            setTimeout(() => notification.remove(), 300)
        }, 2000)
    }

    return {
        currentAmbient,
        isPlaying,
        volume,
        ambientSounds,
        reminderSounds,
        selectedReminder,
        playAmbient,
        stopAmbient,
        playReminder,
        setVolume,
        setReminderSound
    }
})