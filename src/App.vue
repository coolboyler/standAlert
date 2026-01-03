<template>
    <div id="app-container">
        <!-- 导航栏 -->
        <nav class="navbar" v-if="showNav">
            <div class="nav-brand">
                <span class="logo">🚶</span>
                <span class="title">站立冒险</span>
            </div>
            <div class="nav-links">
                <router-link to="/" class="nav-item" active-class="active">
                    <i class="fas fa-home"></i>
                    <span>首页</span>
                </router-link>
                <router-link to="/pet" class="nav-item" active-class="active">
                    <i class="fas fa-paw"></i>
                    <span>宠物</span>
                </router-link>
                <router-link to="/games" class="nav-item" active-class="active">
                    <i class="fas fa-gamepad"></i>
                    <span>游戏</span>
                </router-link>
                <router-link to="/achievements" class="nav-item" active-class="active">
                    <i class="fas fa-trophy"></i>
                    <span>成就</span>
                </router-link>
                <router-link to="/challenges" class="nav-item" active-class="active">
                    <i class="fas fa-flag"></i>
                    <span>挑战</span>
                </router-link>
                <router-link to="/stats" class="nav-item" active-class="active">
                    <i class="fas fa-chart-line"></i>
                    <span>统计</span>
                </router-link>
                <router-link to="/settings" class="nav-item" active-class="active">
                    <i class="fas fa-cog"></i>
                    <span>设置</span>
                </router-link>
            </div>
        </nav>

        <!-- 主内容区 -->
        <main class="main-content">
            <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </main>

        <!-- 悬浮提醒按钮 -->
        <div class="floating-reminder" v-if="userStore.isReminderActive" @click="manualStand">
            <div class="reminder-pulse" :class="{ active: isReminderTime }">
                <i class="fas fa-walking"></i>
            </div>
            <span v-if="nextReminderText">{{ nextReminderText }}</span>
        </div>

        <!-- 快捷操作面板 -->
        <div class="quick-actions" v-if="showQuickActions">
            <button @click="quickStand" class="action-btn primary">
                <i class="fas fa-check"></i> 我站起来了!
            </button>
            <button @click="snoozeReminder" class="action-btn secondary">
                <i class="fas fa-clock"></i> 稍后提醒
            </button>
        </div>

        <!-- 宠物状态悬浮窗 -->
        <div class="pet-float" v-if="showPetFloat" @click="$router.push('/pet')">
            <div class="pet-emoji" :class="petMoodClass">
                {{ petEmoji }}
            </div>
            <div class="pet-hp-bar">
                <div class="hp-fill" :style="{ width: userStore.pet.happiness + '%' }"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from './stores/user'
import { useAudioStore } from './stores/audio'
import { showNotification, triggerConfetti } from './utils/notifications'

const route = useRoute()
const userStore = useUserStore()
const audioStore = useAudioStore()

const showNav = computed(() => route.path !== '/')
const isReminderTime = ref(false)
const showQuickActions = ref(false)
const showPetFloat = computed(() => route.path !== '/pet' && userStore.totalStands > 0)

const nextReminderText = computed(() => {
    if (!userStore.nextReminderTime) return null
    const now = Date.now()
    const diff = userStore.nextReminderTime - now
    if (diff <= 0) return '时间到了!'

    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const petEmoji = computed(() => {
    const moods = {
        happy: '😊',
        neutral: '😐',
        sad: '😢'
    }
    return moods[userStore.petHappinessLevel] || '😊'
})

const petMoodClass = computed(() => userStore.petHappinessLevel)

// 检查提醒时间
function checkReminderTime() {
    if (!userStore.isReminderActive || !userStore.nextReminderTime) return

    const now = Date.now()
    if (now >= userStore.nextReminderTime) {
        triggerReminder()
    }
}

// 触发提醒
async function triggerReminder() {
    isReminderTime.value = true
    showQuickActions.value = true

    // 播放提醒音效
    await audioStore.playReminder()

    // 浏览器通知
    showNotification('该站起来活动一下了！🚶', 'warning')

    // 5秒后自动隐藏快捷面板
    setTimeout(() => {
        showQuickActions.value = false
        isReminderTime.value = false
    }, 5000)
}

// 手动记录站立
function manualStand() {
    if (userStore.recordStand(5)) {
        showNotification('🎉 站立成功！+10分', 'success')
        triggerConfetti()
        userStore.scheduleNextReminder()
        showQuickActions.value = false
    }
}

// 快捷站立
function quickStand() {
    manualStand()
}

// 稍后提醒
function snoozeReminder() {
    const snoozeTime = 5 // 5分钟后
    userStore.nextReminderTime = Date.now() + (snoozeTime * 60 * 1000)
    showNotification(`⏰ 已推迟 ${snoozeTime} 分钟`, 'info')
    showQuickActions.value = false
}

// 每5秒检查一次提醒时间（减少CPU使用）
setInterval(checkReminderTime, 5000)

// 每天重置今日统计
function checkDailyReset() {
    const lastReset = localStorage.getItem('lastReset')
    const today = new Date().toDateString()

    if (lastReset !== today) {
        userStore.resetToday()
        localStorage.setItem('lastReset', today)
    }
}

onMounted(() => {
    checkDailyReset()

    // 请求通知权限
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
    }

    // 检查URL参数中的站立记录（用于外部触发）
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('stand')) {
        manualStand()
    }
})

// 监听宠物状态变化
watch(() => userStore.pet.happiness, (newVal, oldVal) => {
    if (newVal <= 20 && oldVal > 20) {
        showNotification(`${userStore.pet.name} 需要你的关爱！`, 'error')
    }
})
</script>

<style lang="scss" scoped>
#app-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* 导航栏 - 性能优化版 */
.navbar {
    background: rgba(255, 255, 255, 0.98);
    /* 移除backdrop-filter提升性能 */
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    z-index: 100;
    /* 硬件加速 */
    transform: translateZ(0);
    will-change: transform;
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 18px;
    color: #667eea;
}

.logo {
    font-size: 24px;
}

.nav-links {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 12px;
    border-radius: 8px;
    color: #666;
    text-decoration: none;
    font-size: 12px;
    /* 优化过渡 */
    transition: background 0.15s ease, color 0.15s ease;
    gap: 4px;
    /* 硬件加速 */
    transform: translateZ(0);

    i {
        font-size: 16px;
    }

    &:hover {
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;
    }

    &.active {
        background: #667eea;
        color: white;
    }
}

/* 主内容区 */
.main-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    /* 硬件加速 */
    transform: translateZ(0);
    will-change: scroll-position;
}

/* 优化路由过渡 - 更快更轻量 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* 浮动提醒按钮 - 性能优化版 */
.floating-reminder {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: white;
    padding: 16px;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    z-index: 99;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    transition: transform 0.15s ease;
    /* 硬件加速 */
    transform: translateZ(0);
    will-change: transform;

    &:hover {
        transform: scale(1.03) translateZ(0);
    }

    span {
        font-size: 12px;
        font-weight: 600;
        color: #667eea;
    }
}

.reminder-pulse {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    /* 移除持续动画，改为状态变化时触发 */
    transition: all 0.3s ease;

    &.active {
        animation: pulse 1s ease-in-out 3;
        background: linear-gradient(135deg, #f093fb, #f5576c);
    }
}

@keyframes pulse {
    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
    50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
}

@keyframes shake {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-5deg); }
    75% { transform: rotate(5deg); }
}

/* 快捷操作面板 */
.quick-actions {
    position: fixed;
    bottom: 100px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 98;
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.action-btn {
    padding: 12px 20px;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    /* 硬件加速 */
    transform: translateZ(0);

    &.primary {
        background: linear-gradient(135deg, #48bb78, #38a169);
        color: white;
    }

    &.secondary {
        background: white;
        color: #667eea;
        border: 2px solid #667eea;
    }

    &:hover {
        transform: translateY(-1px) translateZ(0);
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
    }

    &:active {
        transform: translateY(0) translateZ(0);
    }
}

/* 宠物悬浮窗 - 性能优化版 */
.pet-float {
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: white;
    padding: 12px;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    z-index: 99;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    transition: transform 0.15s ease;
    /* 硬件加速 */
    transform: translateZ(0);

    &:hover {
        transform: scale(1.03) translateZ(0);
    }

    .pet-emoji {
        font-size: 32px;
        transition: transform 0.2s ease;

        &.happy { transform: rotate(5deg); }
        &.neutral { transform: rotate(0deg); }
        &.sad { transform: rotate(-5deg); }
    }

    .pet-hp-bar {
        width: 60px;
        height: 6px;
        background: #e0e0e0;
        border-radius: 3px;
        overflow: hidden;

        .hp-fill {
            height: 100%;
            background: linear-gradient(90deg, #f56565, #ed8936, #48bb78);
            transition: width 0.3s ease;
            /* 硬件加速 */
            transform: translateZ(0);
        }
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .navbar {
        padding: 8px 12px;
    }

    .nav-links {
        gap: 4px;
    }

    .nav-item {
        padding: 6px 8px;
        font-size: 10px;

        i {
            font-size: 14px;
        }
    }

    .floating-reminder {
        bottom: 16px;
        right: 16px;
        padding: 12px;
    }

    .quick-actions {
        bottom: 80px;
        right: 16px;
    }

    .pet-float {
        bottom: 16px;
        left: 16px;
        padding: 8px;
    }
}
</style>