import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAudioStore = defineStore('audio', () => {
    const currentAmbient = ref('none')
    const isPlaying = ref(false)
    const volume = ref(0.5)

    // Web Audio API 上下文
    let audioContext = null
    let currentOscillators = []
    let currentGainNode = null

    // 可用的环境音效
    const ambientSounds = [
        { id: 'forest', name: '森林', icon: '🌲', description: '自然白噪音' },
        { id: 'ocean', name: '海洋', icon: '🌊', description: '波浪声' },
        { id: 'rain', name: '雨声', icon: '🌧️', description: '雨滴声' },
        { id: 'cafe', name: '咖啡馆', icon: '☕', description: '环境人声' },
        { id: 'space', name: '太空', icon: '🚀', description: '科幻音效' },
        { id: 'none', name: '静音', icon: '🔇', description: '停止播放' }
    ]

    // 提醒音效
    const reminderSounds = [
        { id: 'chime', name: '风铃', file: 'chime.mp3' },
        { id: 'bell', name: '铃铛', file: 'bell.mp3' },
        { id: 'pop', name: '气泡', file: 'pop.mp3' },
        { id: 'nature', name: '自然', file: 'nature.mp3' }
    ]

    const selectedReminder = ref('chime')

    // 初始化音频上下文
    function initAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)()
        }
        if (audioContext.state === 'suspended') {
            audioContext.resume()
        }
    }

    // 生成音调
    function playTone(frequency, duration, type = 'sine') {
        initAudioContext()

        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.type = type
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)

        gainNode.gain.setValueAtTime(volume.value * 0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + duration)

        return oscillator
    }

    // 生成白噪音（用于森林、雨声等）
    function playWhiteNoise(duration, filterFreq = 1000) {
        initAudioContext()

        const bufferSize = audioContext.sampleRate * duration
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
        const data = buffer.getChannelData(0)

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1
        }

        const noise = audioContext.createBufferSource()
        noise.buffer = buffer

        const filter = audioContext.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(filterFreq, audioContext.currentTime)

        const gainNode = audioContext.createGain()
        gainNode.gain.setValueAtTime(volume.value * 0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

        noise.connect(filter)
        filter.connect(gainNode)
        gainNode.connect(audioContext.destination)

        noise.start(audioContext.currentTime)
        noise.stop(audioContext.currentTime + duration)

        return noise
    }

    // 播放环境音效（纯净白噪音）
    function playAmbient(soundId) {
        if (soundId === 'none') {
            stopAmbient()
            return
        }

        // 先停止当前音效
        stopAmbient()

        currentAmbient.value = soundId
        isPlaying.value = true

        initAudioContext()

        // 根据音效类型生成对应的纯净白噪音
        switch (soundId) {
            case 'forest':
                // 森林：低频白噪音 (800Hz截止频率)
                currentOscillators.push(playWhiteNoise(60, 800))
                break

            case 'ocean':
                // 海洋：超低频白噪音 (400Hz截止频率)
                currentOscillators.push(playWhiteNoise(60, 400))
                break

            case 'rain':
                // 雨声：高频白噪音 (2000Hz截止频率)
                currentOscillators.push(playWhiteNoise(60, 2000))
                break

            case 'cafe':
                // 咖啡馆：中频白噪音 (1500Hz截止频率)
                currentOscillators.push(playWhiteNoise(60, 1500))
                break

            case 'space':
                // 太空：超低频白噪音 (200Hz截止频率)
                currentOscillators.push(playWhiteNoise(60, 200))
                break
        }

        showSoundNotification(ambientSounds.find(s => s.id === soundId))
    }

    function stopAmbient() {
        // 停止所有振荡器
        currentOscillators.forEach(osc => {
            try {
                if (osc.stop) osc.stop()
                if (osc.disconnect) osc.disconnect()
            } catch (e) {}
        })
        currentOscillators = []

        currentAmbient.value = 'none'
        isPlaying.value = false
    }

    function playReminder() {
        initAudioContext()

        // 根据选择的提醒音效播放不同的声音
        const sounds = {
            'chime': [800, 1000, 1200],  // 风铃
            'bell': [600, 600],          // 铃铛
            'pop': [400, 800],           // 气泡
            'nature': [500, 700, 900]    // 自然
        }

        const frequencies = sounds[selectedReminder.value] || [800]

        // 播放序列
        frequencies.forEach((freq, i) => {
            setTimeout(() => {
                playTone(freq, 0.2, 'sine')
            }, i * 150)
        })

        // 振动提醒
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200])
        }

        // 视觉提醒
        flashScreen()

        return new Promise(resolve => {
            setTimeout(() => resolve(true), frequencies.length * 150 + 200)
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