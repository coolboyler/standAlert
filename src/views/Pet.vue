<template>
    <div class="pet-page">
        <div class="pet-container">
            <!-- 宠物展示区 -->
            <div class="pet-display">
                <div class="pet-emoji" :class="[petMood, { animate: isAnimating }]">
                    {{ petEmoji }}
                </div>
                <div class="pet-name">{{ userStore.pet.name }}</div>
                <div class="pet-level">等级 {{ userStore.pet.level }}</div>

                <!-- 宠物心情气泡 -->
                <div class="mood-bubble" v-if="showMoodBubble">
                    {{ moodText }}
                </div>
            </div>

            <!-- 状态条 -->
            <div class="status-bars">
                <div class="status-item">
                    <label>😊 幸福度</label>
                    <div class="bar">
                        <div class="fill" :class="getBarColor(userStore.pet.happiness)" :style="{ width: userStore.pet.happiness + '%' }"></div>
                    </div>
                    <span>{{ Math.round(userStore.pet.happiness) }}%</span>
                </div>

                <div class="status-item">
                    <label>🍖 饥饿度</label>
                    <div class="bar">
                        <div class="fill" :class="getBarColor(100 - userStore.pet.hunger)" :style="{ width: userStore.pet.hunger + '%' }"></div>
                    </div>
                    <span>{{ Math.round(userStore.pet.hunger) }}%</span>
                </div>

                <div class="status-item">
                    <label>⚡ 能量值</label>
                    <div class="bar">
                        <div class="fill" :class="getBarColor(userStore.pet.energy)" :style="{ width: userStore.pet.energy + '%' }"></div>
                    </div>
                    <span>{{ Math.round(userStore.pet.energy) }}%</span>
                </div>

                <div class="status-item">
                    <label>⭐ 经验值</label>
                    <div class="bar">
                        <div class="fill" :class="getBarColor((userStore.pet.xp / (userStore.pet.level * 100)) * 100)" :style="{ width: (userStore.pet.xp / (userStore.pet.level * 100)) * 100 + '%' }"></div>
                    </div>
                    <span>{{ userStore.pet.xp }}/{{ userStore.pet.level * 100 }}</span>
                </div>
            </div>

            <!-- 互动按钮 -->
            <div class="interaction-grid">
                <button class="interaction-btn" @click="feedPet" :disabled="userStore.pet.hunger >= 100">
                    <div class="icon">🍖</div>
                    <div>喂食</div>
                </button>

                <button class="interaction-btn" @click="restPet" :disabled="userStore.pet.energy >= 100">
                    <div class="icon">💤</div>
                    <div>休息</div>
                </button>

                <button class="interaction-btn" @click="playWithPet">
                    <div class="icon">🎾</div>
                    <div>玩耍</div>
                </button>

                <button class="interaction-btn" @click="renamePet">
                    <div class="icon">✏️</div>
                    <div>改名</div>
                </button>
            </div>

            <!-- 宠物日志 -->
            <div class="pet-log">
                <h3>📜 宠物日记</h3>
                <div class="log-entries">
                    <div v-for="(entry, index) in petLog" :key="index" class="log-entry">
                        <span class="time">{{ entry.time }}</span>
                        <span class="message">{{ entry.message }}</span>
                    </div>
                    <div v-if="petLog.length === 0" class="empty-log">
                        还没有记录，开始互动吧！
                    </div>
                </div>
            </div>

            <!-- 宠物升级特效 -->
            <div v-if="showLevelUp" class="level-up-overlay">
                <div class="level-up-content">
                    <div class="level-up-emoji">🎉</div>
                    <h2>升级了！</h2>
                    <p>{{ userStore.pet.name }} 现在是等级 {{ userStore.pet.level }}</p>
                    <div class="confetti"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '../stores/user'
import { showNotification, triggerConfetti } from '../utils/notifications'

const userStore = useUserStore()
const isAnimating = ref(false)
const showMoodBubble = ref(false)
const showLevelUp = ref(false)
const petLog = ref([])

const petEmoji = computed(() => {
    const moods = {
        happy: '😊',
        neutral: '😐',
        sad: '😢'
    }
    return moods[petMood.value] || '😊'
})

const petMood = computed(() => {
    if (userStore.pet.happiness >= 80) return 'happy'
    if (userStore.pet.happiness >= 50) return 'neutral'
    return 'sad'
})

const moodText = computed(() => {
    const happiness = userStore.pet.happiness
    const hunger = userStore.pet.hunger
    const energy = userStore.pet.energy

    if (happiness < 30) return '我好难过... 😢'
    if (hunger < 30) return '我好饿啊... 🍽️'
    if (energy < 20) return '好困... 💤'
    if (happiness > 80 && hunger > 70 && energy > 70) return '我今天很开心！✨'
    if (happiness > 60) return '还不错呢~ 😊'
    return '嗯...还行吧 🤔'
})

function getBarColor(value) {
    if (value >= 70) return 'high'
    if (value >= 40) return 'medium'
    return 'low'
}

function animatePet() {
    isAnimating.value = true
    setTimeout(() => {
        isAnimating.value = false
    }, 500)
}

function showMood() {
    showMoodBubble.value = true
    setTimeout(() => {
        showMoodBubble.value = false
    }, 2000)
}

function addLog(message) {
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    petLog.value.unshift({ time: timeStr, message })
    if (petLog.value.length > 10) {
        petLog.value.pop()
    }
}

function feedPet() {
    if (userStore.feedPet()) {
        animatePet()
        showNotification('🍖 你喂食了宠物，它很开心！', 'success')
        addLog('被喂食了，真美味！')
        showMood()
    } else {
        showNotification('宠物已经吃饱了', 'info')
    }
}

function restPet() {
    if (userStore.restPet()) {
        animatePet()
        showNotification('💤 宠物正在休息恢复能量', 'success')
        addLog('休息了一会儿，感觉好多了')
        showMood()
    } else {
        showNotification('宠物精力充沛，不需要休息', 'info')
    }
}

function playWithPet() {
    if (userStore.pet.energy < 10) {
        showNotification('宠物太累了，先让它休息一下吧', 'warning')
        return
    }

    animatePet()
    userStore.pet.happiness = Math.min(100, userStore.pet.happiness + 15)
    userStore.pet.energy = Math.max(0, userStore.pet.energy - 5)

    showNotification('🎾 和宠物玩耍，关系更亲密了！', 'success')
    addLog('一起玩耍，好开心！')
    triggerConfetti()
    showMood()
}

function renamePet() {
    const newName = prompt('给你的宠物取个新名字:', userStore.pet.name)
    if (newName && newName.trim() && newName.length <= 10) {
        const oldName = userStore.pet.name
        userStore.pet.name = newName.trim()
        showNotification(`✨ 宠物改名为: ${newName}`, 'success')
        addLog(`名字从"${oldName}"改成了"${newName}"`)
    } else if (newName && newName.length > 10) {
        showNotification('名字太长了（最多10个字符）', 'warning')
    }
}

// 监听升级
watch(() => userStore.pet.level, (newVal, oldVal) => {
    if (newVal > oldVal) {
        showLevelUp.value = true
        triggerConfetti()
        setTimeout(() => {
            showLevelUp.value = false
        }, 3000)
        addLog(`升级到等级 ${newVal}！`)
    }
})

// 监听状态变化
watch(() => userStore.pet.happiness, (newVal, oldVal) => {
    if (newVal < 20 && oldVal >= 20) {
        addLog('我感到很不开心...')
        showMood()
    }
})

onMounted(() => {
    addLog('你好！我是你的站立伙伴')

    // 每30秒自动显示一次心情
    setInterval(() => {
        if (Math.random() > 0.7) {
            showMood()
        }
    }, 30000)
})
</script>

<style lang="scss" scoped>
.pet-page {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

.pet-container {
    background: white;
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

/* 宠物展示区 */
.pet-display {
    text-align: center;
    margin-bottom: 30px;
    position: relative;

    .pet-emoji {
        font-size: 120px;
        display: inline-block;
        transition: transform 0.3s;
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));

        &.happy { transform: rotate(10deg) scale(1.1); }
        &.neutral { transform: rotate(0deg) scale(1); }
        &.sad { transform: rotate(-10deg) scale(0.9); }

        &.animate {
            animation: petBounce 0.5s ease;
        }
    }

    .pet-name {
        font-size: 28px;
        font-weight: 700;
        color: #333;
        margin-top: 8px;
    }

    .pet-level {
        font-size: 16px;
        color: #667eea;
        font-weight: 600;
        margin-top: 4px;
    }

    .mood-bubble {
        position: absolute;
        top: 0;
        right: 20%;
        background: #fff;
        padding: 8px 12px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        font-size: 14px;
        white-space: nowrap;
        animation: bubblePop 0.3s ease-out;
        z-index: 10;

        &::after {
            content: '';
            position: absolute;
            bottom: -6px;
            left: 20px;
            width: 12px;
            height: 12px;
            background: #fff;
            transform: rotate(45deg);
        }
    }
}

@keyframes petBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}

@keyframes bubblePop {
    0% { transform: scale(0); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}

/* 状态条 */
.status-bars {
    margin-bottom: 30px;

    .status-item {
        margin-bottom: 16px;

        label {
            display: block;
            font-weight: 600;
            color: #333;
            margin-bottom: 6px;
            font-size: 14px;
        }

        .bar {
            width: 100%;
            height: 12px;
            background: #e0e0e0;
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 4px;

            .fill {
                height: 100%;
                transition: width 0.5s ease, background-color 0.3s;
                border-radius: 6px;

                &.high {
                    background: linear-gradient(90deg, #48bb78, #38a169);
                }

                &.medium {
                    background: linear-gradient(90deg, #ed8936, #dd6b20);
                }

                &.low {
                    background: linear-gradient(90deg, #f56565, #c53030);
                }
            }
        }

        > span {
            font-size: 12px;
            color: #666;
            font-weight: 600;
        }
    }
}

/* 互动按钮 */
.interaction-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin-bottom: 30px;

    .interaction-btn {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        padding: 16px;
        border-radius: 12px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;

        .icon {
            font-size: 24px;
        }

        &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: #ccc;
        }

        &:active:not(:disabled) {
            transform: translateY(0);
        }
    }
}

/* 宠物日志 */
.pet-log {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 12px;
    border: 2px solid #e0e0e0;

    h3 {
        margin: 0 0 12px 0;
        color: #333;
    }

    .log-entries {
        max-height: 200px;
        overflow-y: auto;
    }

    .log-entry {
        padding: 8px 0;
        border-bottom: 1px solid #e0e0e0;
        font-size: 14px;
        display: flex;
        gap: 12px;

        .time {
            color: #667eea;
            font-weight: 600;
            min-width: 45px;
        }

        .message {
            color: #333;
            flex: 1;
        }

        &:last-child {
            border-bottom: none;
        }
    }

    .empty-log {
        text-align: center;
        color: #999;
        padding: 20px;
        font-style: italic;
    }
}

/* 升级特效 */
.level-up-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;

    .level-up-content {
        text-align: center;
        color: white;
        animation: bounceIn 0.6s ease-out;

        .level-up-emoji {
            font-size: 80px;
            margin-bottom: 16px;
            animation: spin 1s ease;
        }

        h2 {
            font-size: 42px;
            margin: 0 0 8px 0;
            color: #f9ca24;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        }

        p {
            font-size: 20px;
            margin: 0;
            opacity: 0.9;
        }
    }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes bounceIn {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.1); }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); opacity: 1; }
}

@keyframes spin {
    from { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.2); }
    to { transform: rotate(360deg) scale(1); }
}

/* 响应式 */
@media (max-width: 768px) {
    .pet-page {
        padding: 16px;
    }

    .pet-container {
        padding: 20px;
    }

    .pet-emoji {
        font-size: 80px;
    }

    .pet-name {
        font-size: 22px;
    }

    .interaction-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .level-up-content {
        .level-up-emoji {
            font-size: 60px;
        }

        h2 {
            font-size: 32px;
        }

        p {
            font-size: 16px;
        }
    }
}
</style>