<template>
    <div class="settings-page">
        <div class="settings-container">
            <h2>⚙️ 设置</h2>
            <p class="subtitle">自定义你的站立提醒体验</p>

            <!-- 提醒设置 -->
            <div class="settings-section">
                <h3>⏰ 提醒设置</h3>
                <div class="setting-item">
                    <div class="setting-info">
                        <span class="label">提醒间隔</span>
                        <span class="description">每隔多久提醒一次</span>
                    </div>
                    <div class="setting-control">
                        <select v-model="userStore.reminderInterval" @change="updateReminder" class="select-input">
                            <option :value="30">30分钟</option>
                            <option :value="45">45分钟</option>
                            <option :value="60">60分钟</option>
                            <option :value="90">90分钟</option>
                            <option :value="120">2小时</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <span class="label">提醒状态</span>
                        <span class="description">{{ userStore.isReminderActive ? '正在运行' : '已暂停' }}</span>
                    </div>
                    <div class="setting-control">
                        <button
                            class="toggle-btn"
                            :class="{ active: userStore.isReminderActive }"
                            @click="toggleReminder"
                        >
                            <span class="toggle-icon">{{ userStore.isReminderActive ? '▶️' : '⏸️' }}</span>
                            {{ userStore.isReminderActive ? '运行中' : '已暂停' }}
                        </button>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <span class="label">下次提醒时间</span>
                        <span class="description">{{ nextReminderText || '未设置' }}</span>
                    </div>
                    <div class="setting-control">
                        <button class="small-btn" @click="userStore.scheduleNextReminder">立即重置</button>
                    </div>
                </div>
            </div>

            <!-- 音效设置 -->
            <div class="settings-section">
                <h3>🎵 音效设置</h3>
                <div class="setting-item">
                    <div class="setting-info">
                        <span class="label">提醒音效</span>
                        <span class="description">选择提醒时播放的声音</span>
                    </div>
                    <div class="setting-control">
                        <select v-model="audioStore.selectedReminder" class="select-input">
                            <option v-for="sound in audioStore.reminderSounds" :key="sound.id" :value="sound.id">
                                {{ sound.name }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <span class="label">音量</span>
                        <span class="description">{{ Math.round(audioStore.volume * 100) }}%</span>
                    </div>
                    <div class="setting-control">
                        <input
                            type="range"
                            v-model.number="audioStore.volume"
                            min="0"
                            max="1"
                            step="0.1"
                            class="slider"
                        />
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <span class="label">测试提醒音效</span>
                        <span class="description">点击测试当前选择的提醒声音</span>
                    </div>
                    <div class="setting-control">
                        <button class="small-btn" @click="testReminderSound">🔊 测试</button>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <span class="label">环境音效</span>
                        <span class="description">{{ audioStore.currentAmbient === 'none' ? '未选择' : audioStore.ambientSounds.find(s => s.id === audioStore.currentAmbient)?.name }}</span>
                    </div>
                    <div class="setting-control">
                        <button class="small-btn" @click="audioStore.stopAmbient">停止播放</button>
                    </div>
                </div>
            </div>

            <!-- 宠物设置 -->
            <div class="settings-section">
                <h3>🐾 宠物设置</h3>
                <div class="setting-item">
                    <div class="setting-info">
                        <span class="label">宠物名称</span>
                        <span class="description">{{ userStore.pet.name }}</span>
                    </div>
                    <div class="setting-control">
                        <button class="small-btn" @click="renamePet">修改</button>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <span class="label">自动喂养</span>
                        <span class="description">站立时自动恢复宠物状态</span>
                    </div>
                    <div class="setting-control">
                        <label class="checkbox-label">
                            <input type="checkbox" v-model="settings.autoFeed" />
                            <span class="checkmark"></span>
                        </label>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <span class="label">宠物提醒</span>
                        <span class="description">宠物状态低时提醒</span>
                    </div>
                    <div class="setting-control">
                        <label class="checkbox-label">
                            <input type="checkbox" v-model="settings.petReminders" />
                            <span class="checkmark"></span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- 通知设置 -->
            <div class="settings-section">
                <h3>🔔 通知设置</h3>
                <div class="setting-item">
                    <div class="setting-info">
                        <span class="label">浏览器通知</span>
                        <span class="description">允许浏览器发送通知</span>
                    </div>
                    <div class="setting-control">
                        <button class="small-btn" @click="requestNotificationPermission">
                            {{ notificationPermission === 'granted' ? '已授权' : '请求授权' }}
                        </button>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <span class="label">振动提醒</span>
                        <span class="description">移动设备振动</span>
                    </div>
                    <div class="setting-control">
                        <label class="checkbox-label">
                            <input type="checkbox" v-model="settings.vibration" />
                            <span class="checkmark"></span>
                        </label>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <span class="label">视觉提醒</span>
                        <span class="description">屏幕闪烁效果</span>
                    </div>
                    <div class="setting-control">
                        <label class="checkbox-label">
                            <input type="checkbox" v-model="settings.visualAlert" />
                            <span class="checkmark"></span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- 主题设置 -->
            <div class="settings-section">
                <h3>🎨 主题设置</h3>
                <div class="theme-grid">
                    <div
                        v-for="theme in themes"
                        :key="theme.id"
                        class="theme-card"
                        :class="{ active: settings.currentTheme === theme.id }"
                        @click="settings.currentTheme = theme.id"
                    >
                        <div class="theme-preview" :style="{ background: theme.background }">
                            <div class="theme-icon">{{ theme.icon }}</div>
                        </div>
                        <div class="theme-name">{{ theme.name }}</div>
                    </div>
                </div>
            </div>

            <!-- 数据管理 -->
            <div class="settings-section">
                <h3>💾 数据管理</h3>
                <div class="action-grid">
                    <button class="action-btn" @click="exportAllData">
                        <span>📤</span> 导出全部
                    </button>
                    <button class="action-btn" @click="importData">
                        <span>📥</span> 导入数据
                    </button>
                    <button class="action-btn danger" @click="clearAllData">
                        <span>🗑️</span> 清空数据
                    </button>
                </div>
            </div>

            <!-- 关于 -->
            <div class="settings-section">
                <h3>ℹ️ 关于</h3>
                <div class="about-content">
                    <p><strong>站立冒险 v1.0</strong></p>
                    <p>一个将站立提醒变成冒险旅程的创意应用</p>
                    <p>🎯 目标：让久坐提醒变得有趣</p>
                    <p>🌟 特色：虚拟宠物、成就系统、小游戏</p>
                    <p>❤️ 保持健康，享受生活！</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useUserStore } from '../stores/user'
import { useAudioStore } from '../stores/audio'
import { showNotification, confirmDialog } from '../utils/notifications'

const userStore = useUserStore()
const audioStore = useAudioStore()

const notificationPermission = ref('default')
const settings = reactive({
    autoFeed: true,
    petReminders: true,
    vibration: true,
    visualAlert: true,
    currentTheme: 'default'
})

const themes = [
    {
        id: 'default',
        name: '默认',
        icon: '🌈',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        textColor: '#ffffff',
        cardBg: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    {
        id: 'ocean',
        name: '海洋',
        icon: '🌊',
        background: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)',
        primaryColor: '#2E3192',
        secondaryColor: '#1BFFFF',
        textColor: '#ffffff',
        cardBg: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '16px',
        fontFamily: 'system-ui, sans-serif'
    },
    {
        id: 'forest',
        name: '森林',
        icon: '🌲',
        background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
        primaryColor: '#203A43',
        secondaryColor: '#2C5364',
        textColor: '#e0f2f1',
        cardBg: 'rgba(255, 255, 255, 0.85)',
        borderRadius: '12px',
        fontFamily: 'Georgia, serif'
    },
    {
        id: 'sunset',
        name: '日落',
        icon: '🌅',
        background: 'linear-gradient(135deg, #FDC830 0%, #F37335 100%)',
        primaryColor: '#F37335',
        secondaryColor: '#FDC830',
        textColor: '#fff8e1',
        cardBg: 'rgba(255, 255, 255, 0.92)',
        borderRadius: '24px',
        fontFamily: 'system-ui, sans-serif'
    },
    {
        id: 'space',
        name: '太空',
        icon: '🚀',
        background: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)',
        primaryColor: '#302B63',
        secondaryColor: '#24243E',
        textColor: '#e0e0ff',
        cardBg: 'rgba(20, 20, 40, 0.85)',
        borderRadius: '8px',
        fontFamily: 'system-ui, monospace'
    }
]

const nextReminderText = computed(() => {
    if (!userStore.nextReminderTime) return null
    const now = Date.now()
    const diff = userStore.nextReminderTime - now
    if (diff <= 0) return '时间到了!'

    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

function updateReminder() {
    userStore.setReminder(userStore.reminderInterval)
    showNotification(`⏰ 提醒间隔已设置为 ${userStore.reminderInterval} 分钟`, 'info')
}

function toggleReminder() {
    userStore.toggleReminder()
    if (userStore.isReminderActive) {
        showNotification('✅ 提醒已开启', 'success')
    } else {
        showNotification('⏸️ 提醒已暂停', 'info')
    }
}

function testReminderSound() {
    audioStore.playReminder()
    showNotification(`🎵 正在播放: ${audioStore.reminderSounds.find(s => s.id === audioStore.selectedReminder)?.name}`, 'info')
}

function renamePet() {
    const newName = prompt('给你的宠物取个新名字:', userStore.pet.name)
    if (newName && newName.trim() && newName.length <= 10) {
        userStore.pet.name = newName.trim()
        showNotification(`✨ 宠物改名为: ${newName}`, 'success')
    } else if (newName && newName.length > 10) {
        showNotification('名字太长了（最多10个字符）', 'warning')
    }
}

function requestNotificationPermission() {
    if (!('Notification' in window)) {
        showNotification('浏览器不支持通知功能', 'warning')
        return
    }

    Notification.requestPermission().then(permission => {
        notificationPermission.value = permission
        if (permission === 'granted') {
            showNotification('✅ 通知权限已授权', 'success')
            new Notification('站立提醒', { body: '通知权限已开启！' })
        } else if (permission === 'denied') {
            showNotification('❌ 通知权限被拒绝', 'error')
        } else {
            showNotification('⏰ 通知权限待授权', 'info')
        }
    })
}

function exportAllData() {
    const data = {
        user: {
            totalStands: userStore.totalStands,
            todayStands: userStore.todayStands,
            currentStreak: userStore.currentStreak,
            longestStreak: userStore.longestStreak,
            totalPoints: userStore.totalPoints,
            pet: userStore.pet,
            reminderInterval: userStore.reminderInterval,
            isReminderActive: userStore.isReminderActive
        },
        achievements: userStore.achievements,
        challenges: userStore.challenges,
        history: userStore.history,
        settings: settings,
        exportDate: new Date().toISOString(),
        version: '1.0'
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `standup-adventure-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    showNotification('✅ 数据已导出', 'success')
}

function importData() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result)

                // 恢复数据
                if (data.user) {
                    Object.assign(userStore, data.user)
                }
                if (data.achievements) {
                    userStore.achievements = data.achievements
                }
                if (data.challenges) {
                    userStore.challenges = data.challenges
                }
                if (data.history) {
                    userStore.history = data.history
                }
                if (data.settings) {
                    Object.assign(settings, data.settings)
                }

                showNotification('✅ 数据导入成功', 'success')
            } catch (error) {
                showNotification('❌ 数据格式错误', 'error')
            }
        }
        reader.readAsText(file)
    }
    input.click()
}

async function clearAllData() {
    const confirmed = await confirmDialog('⚠️ 确定要清空所有数据吗？此操作不可恢复！')
    if (!confirmed) return

    const doubleCheck = await confirmDialog('真的确定吗？所有进度都会丢失！')
    if (!doubleCheck) return

    // 重置所有数据
    userStore.totalStands = 0
    userStore.todayStands = 0
    userStore.currentStreak = 0
    userStore.longestStreak = 0
    userStore.totalPoints = 0
    userStore.pet = {
        name: 'Standy',
        happiness: 100,
        hunger: 100,
        energy: 100,
        level: 1,
        xp: 0,
        type: 'default'
    }
    userStore.history = []
    userStore.achievements.forEach(a => a.unlocked = false)
    userStore.challenges.forEach(c => {
        c.progress = 0
        c.completed = false
    })
    userStore.isReminderActive = false
    userStore.nextReminderTime = null

    // 重置设置
    settings.autoFeed = true
    settings.petReminders = true
    settings.vibration = true
    settings.visualAlert = true
    settings.currentTheme = 'default'

    showNotification('🔄 所有数据已清空', 'info')
}

// 保存设置到本地存储
function saveSettings() {
    localStorage.setItem('standupSettings', JSON.stringify(settings))
}

// 加载设置
function loadSettings() {
    const saved = localStorage.getItem('standupSettings')
    if (saved) {
        try {
            const parsed = JSON.parse(saved)
            Object.assign(settings, parsed)
        } catch (e) {
            console.error('加载设置失败', e)
        }
    }
}

// 监听设置变化，自动保存（使用防抖减少频繁写入）
let saveTimeout = null
watch(settings, () => {
    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
        localStorage.setItem('standupSettings', JSON.stringify(settings))
    }, 500)
}, { deep: true })

// 监听主题变化，应用主题（优化版，减少DOM操作）
let themeApplyTimeout = null
watch(() => settings.currentTheme, (newTheme) => {
    if (themeApplyTimeout) clearTimeout(themeApplyTimeout)

    themeApplyTimeout = setTimeout(() => {
        const theme = themes.find(t => t.id === newTheme)
        if (theme) {
            // 批量应用CSS变量（一次性操作）
            const rootStyle = document.documentElement.style
            rootStyle.setProperty('--theme-primary', theme.primaryColor)
            rootStyle.setProperty('--theme-secondary', theme.secondaryColor)
            rootStyle.setProperty('--theme-text', theme.textColor)
            rootStyle.setProperty('--theme-card-bg', theme.cardBg)
            rootStyle.setProperty('--theme-border-radius', theme.borderRadius)
            rootStyle.setProperty('--theme-font-family', theme.fontFamily)

            // 简化背景切换
            document.body.style.background = theme.background

            showNotification(`🎨 已切换到${theme.name}主题`, 'info')
        }
    }, 200)
})

// 监听宠物状态提醒
watch(() => userStore.pet.happiness, (newVal) => {
    if (settings.petReminders && newVal < 30) {
        showNotification(`${userStore.pet.name} 不开心了，快去陪陪它！`, 'warning')
    }
})

onMounted(() => {
    loadSettings()

    // 检查通知权限
    if ('Notification' in window) {
        notificationPermission.value = Notification.permission
    }

    // 每2分钟检查一次是否需要自动喂养（减少检查频率）
    setInterval(() => {
        if (settings.autoFeed && userStore.isReminderActive) {
            if (userStore.pet.hunger < 30) {
                userStore.feedPet()
            }
            if (userStore.pet.energy < 20) {
                userStore.restPet()
            }
        }
    }, 120000)
})
</script>

<style lang="scss" scoped>
.settings-page {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

.settings-container {
    background: white;
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

h2 {
    margin: 0 0 8px 0;
    color: #333;
}

.subtitle {
    color: #666;
    margin-bottom: 24px;
}

/* 设置区域 */
.settings-section {
    margin-bottom: 30px;
    padding-bottom: 30px;
    border-bottom: 2px solid #f0f0f0;

    &:last-child {
        border-bottom: none;
    }

    h3 {
        margin: 0 0 16px 0;
        color: #333;
        font-size: 18px;
    }
}

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 12px;
    margin-bottom: 12px;

    .setting-info {
        flex: 1;

        .label {
            display: block;
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;
        }

        .description {
            font-size: 12px;
            color: #666;
        }
    }

    .setting-control {
        display: flex;
        align-items: center;
        gap: 8px;
    }
}

/* 控件样式 */
.select-input {
    padding: 8px 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;

    &:focus {
        outline: none;
        border-color: #667eea;
    }
}

.toggle-btn {
    padding: 8px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 20px;
    background: white;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;

    &.active {
        background: #48bb78;
        color: white;
        border-color: #48bb78;

        .toggle-icon {
            animation: pulse 2s infinite;
        }
    }

    &:hover:not(.active) {
        border-color: #667eea;
        color: #667eea;
    }
}

.small-btn {
    padding: 6px 12px;
    border: 2px solid #667eea;
    background: white;
    color: #667eea;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: #667eea;
        color: white;
    }
}

.slider {
    width: 120px;
    height: 6px;
    border-radius: 3px;
    background: #e0e0e0;
    outline: none;
    -webkit-appearance: none;

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #667eea;
        cursor: pointer;
    }

    &::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #667eea;
        cursor: pointer;
        border: none;
    }
}

/* 复选框样式 */
.checkbox-label {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 26px;

    input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .checkmark {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.3s;
        border-radius: 26px;

        &::before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.3s;
            border-radius: 50%;
        }
    }

    input:checked + .checkmark {
        background-color: #48bb78;

        &::before {
            transform: translateX(24px);
        }
    }
}

/* 主题选择 */
.theme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;

    .theme-card {
        border: 2px solid #e0e0e0;
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
            transform: translateY(-2px);
            border-color: #667eea;
        }

        &.active {
            border-color: #667eea;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .theme-preview {
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;

            .theme-icon {
                font-size: 28px;
            }
        }

        .theme-name {
            padding: 8px;
            text-align: center;
            font-size: 12px;
            font-weight: 600;
            color: #333;
            background: #f8f9fa;
        }
    }
}

/* 动作按钮 */
.action-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;

    .action-btn {
        background: white;
        border: 2px solid #667eea;
        color: #667eea;
        padding: 12px 16px;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        &:hover {
            background: #667eea;
            color: white;
            transform: translateY(-2px);
        }

        &.danger {
            border-color: #f56565;
            color: #f56565;

            &:hover {
                background: #f56565;
                color: white;
            }
        }

        span {
            font-size: 18px;
        }
    }
}

/* 关于内容 */
.about-content {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 12px;
    text-align: center;

    p {
        margin: 8px 0;
        color: #333;
    }

    strong {
        color: #667eea;
        font-size: 18px;
    }
}

/* 动画 */
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* 响应式 */
@media (max-width: 768px) {
    .settings-page {
        padding: 16px;
    }

    .settings-container {
        padding: 20px;
    }

    .setting-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;

        .setting-control {
            width: 100%;
            justify-content: flex-end;
        }
    }

    .theme-grid {
        grid-template-columns: repeat(3, 1fr);
    }

    .action-grid {
        grid-template-columns: 1fr;
    }
}
</style>