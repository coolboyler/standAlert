<template>
    <div class="home">
        <!-- 英雄区域 -->
        <div class="hero">
            <div class="hero-content">
                <h1 class="hero-title">
                    <span class="emoji">🚶</span>
                    站立冒险
                </h1>
                <p class="hero-subtitle">让每一次站立都成为一场有趣的冒险</p>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">{{ userStore.todayStands }}</div>
                        <div class="stat-label">今日站立</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">{{ userStore.currentStreak }}</div>
                        <div class="stat-label">连胜天数</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">{{ userStore.totalPoints }}</div>
                        <div class="stat-label">总积分</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 快速操作 -->
        <div class="quick-start">
            <h2>🚀 快速开始</h2>
            <div class="action-grid">
                <button class="action-card" @click="startStand">
                    <div class="icon">🎯</div>
                    <div class="text">立即站立</div>
                    <div class="desc">5分钟挑战</div>
                </button>

                <button class="action-card" @click="toggleReminder">
                    <div class="icon">{{ userStore.isReminderActive ? '⏸️' : '⏰' }}</div>
                    <div class="text">{{ userStore.isReminderActive ? '暂停提醒' : '开启提醒' }}</div>
                    <div class="desc">{{ userStore.isReminderActive ? '已暂停' : `${userStore.reminderInterval}分钟` }}</div>
                </button>

                <button class="action-card" @click="$router.push('/pet')">
                    <div class="icon">🐾</div>
                    <div class="text">照顾宠物</div>
                    <div class="desc">查看状态</div>
                </button>

                <button class="action-card" @click="$router.push('/games')">
                    <div class="icon">🎮</div>
                    <div class="text">小游戏</div>
                    <div class="desc">站立时玩</div>
                </button>
            </div>
        </div>

        <!-- 环境音效选择 -->
        <div class="ambient-section">
            <h2>🎵 环境音效</h2>
            <div class="ambient-grid">
                <button
                    v-for="sound in audioStore.ambientSounds"
                    :key="sound.id"
                    class="ambient-btn"
                    :class="{ active: audioStore.currentAmbient === sound.id }"
                    @click="toggleAmbient(sound.id)"
                >
                    <span class="emoji">{{ sound.icon }}</span>
                    <span>{{ sound.name }}</span>
                </button>
            </div>
        </div>

        <!-- 今日成就预览 -->
        <div class="achievements-preview">
            <h2>🏆 今日成就</h2>
            <div class="achievement-list">
                <div
                    v-for="ach in todayAchievements"
                    :key="ach.id"
                    class="achievement-item"
                    :class="{ unlocked: ach.unlocked }"
                >
                    <span class="emoji">{{ ach.icon }}</span>
                    <div class="info">
                        <div class="name">{{ ach.name }}</div>
                        <div class="desc">{{ ach.desc }}</div>
                    </div>
                    <div class="status">
                        <i v-if="ach.unlocked" class="fas fa-check-circle"></i>
                        <i v-else class="far fa-circle"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- 挑战进度 -->
        <div class="challenges-preview">
            <h2>🎯 进行中的挑战</h2>
            <div class="challenge-list">
                <div
                    v-for="challenge in activeChallenges"
                    :key="challenge.id"
                    class="challenge-item"
                >
                    <div class="challenge-header">
                        <span class="name">{{ challenge.name }}</span>
                        <span class="reward">+{{ challenge.reward }}分</span>
                    </div>
                    <div class="progress-bar">
                        <div
                            class="progress-fill"
                            :style="{ width: (challenge.progress / challenge.target * 100) + '%' }"
                        ></div>
                    </div>
                    <div class="progress-text">
                        {{ challenge.progress }}/{{ challenge.target }} - {{ challenge.desc }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 每日小贴士 -->
        <div class="tips-section">
            <div class="tip-card">
                <div class="tip-icon">💡</div>
                <div class="tip-content">
                    <strong>今日健康小贴士</strong>
                    <p>{{ currentTip }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { useAudioStore } from '../stores/audio'
import { showNotification, triggerConfetti } from '../utils/notifications'

const userStore = useUserStore()
const audioStore = useAudioStore()

const tips = [
    '站立时保持脊柱中立，肩膀放松',
    '每小时站起来活动5分钟，能显著改善血液循环',
    '站立办公可以燃烧比坐着多50卡路里的热量',
    '经常站立有助于改善姿势，减少腰背疼痛',
    '站立时穿舒适的鞋子，避免高跟鞋',
    '尝试站立时做简单的伸展运动',
    '保持水分摄入，站立时更容易感到口渴',
    '站立时可以尝试单腿平衡练习',
    '使用站立提醒时，配合深呼吸效果更好',
    '站立时可以听一些轻松的音乐放松心情'
]

const currentTip = computed(() => {
    const index = Math.floor(Date.now() / 86400000) % tips.length
    return tips[index]
})

const todayAchievements = computed(() => {
    return userStore.achievements.slice(0, 4)
})

const activeChallenges = computed(() => {
    return userStore.challenges.filter(c => !c.completed)
})

function startStand() {
    if (userStore.recordStand(5)) {
        showNotification('🎉 站立成功！保持5分钟健康时光', 'success')
        triggerConfetti()
    }
}

function toggleReminder() {
    userStore.toggleReminder()
    if (userStore.isReminderActive) {
        showNotification(`⏰ 提醒已开启，每${userStore.reminderInterval}分钟提醒一次`, 'success')
    } else {
        showNotification('⏸️ 提醒已暂停', 'info')
    }
}

function toggleAmbient(soundId) {
    if (audioStore.currentAmbient === soundId) {
        audioStore.stopAmbient()
    } else {
        audioStore.playAmbient(soundId)
    }
}

onMounted(() => {
    // 欢迎提示
    if (userStore.totalStands === 0) {
        setTimeout(() => {
            showNotification('👋 欢迎来到站立冒险！点击"立即站立"开始吧', 'info')
        }, 1000)
    }
})
</script>

<style lang="scss" scoped>
.home {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

/* 英雄区域 */
.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    padding: 40px;
    color: white;
    margin-bottom: 30px;
    box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        animation: rotate 20s linear infinite;
    }
}

@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.hero-content {
    position: relative;
    z-index: 1;
}

.hero-title {
    font-size: 48px;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 12px;

    .emoji {
        animation: bounce 2s infinite;
    }
}

.hero-subtitle {
    font-size: 18px;
    opacity: 0.9;
    margin-bottom: 24px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 16px;
    margin-top: 20px;
}

.stat-card {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    padding: 16px;
    border-radius: 12px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.3);

    .stat-value {
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 4px;
    }

    .stat-label {
        font-size: 12px;
        opacity: 0.8;
    }
}

/* 快速操作 */
.quick-start {
    margin-bottom: 30px;

    h2 {
        margin-bottom: 16px;
        color: #333;
    }
}

.action-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}

.action-card {
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 16px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    &:hover {
        transform: translateY(-4px);
        border-color: #667eea;
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
    }

    .icon {
        font-size: 32px;
    }

    .text {
        font-weight: 600;
        color: #333;
    }

    .desc {
        font-size: 12px;
        color: #666;
    }
}

/* 环境音效 */
.ambient-section {
    margin-bottom: 30px;

    h2 {
        margin-bottom: 16px;
        color: #333;
    }
}

.ambient-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 12px;
}

.ambient-btn {
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 14px;

    .emoji {
        font-size: 20px;
    }

    &:hover {
        border-color: #667eea;
        transform: scale(1.05);
    }

    &.active {
        background: #667eea;
        color: white;
        border-color: #667eea;
    }
}

/* 成就预览 */
.achievements-preview {
    margin-bottom: 30px;

    h2 {
        margin-bottom: 16px;
        color: #333;
    }
}

.achievement-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.achievement-item {
    background: white;
    padding: 12px 16px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    border: 2px solid #e0e0e0;
    opacity: 0.6;

    &.unlocked {
        opacity: 1;
        border-color: #48bb78;
        background: linear-gradient(135deg, rgba(72, 187, 120, 0.1), rgba(56, 161, 105, 0.1));
    }

    .emoji {
        font-size: 24px;
    }

    .info {
        flex: 1;

        .name {
            font-weight: 600;
            color: #333;
        }

        .desc {
            font-size: 12px;
            color: #666;
        }
    }

    .status {
        font-size: 20px;

        i {
            &.fa-check-circle {
                color: #48bb78;
            }
            &.fa-circle {
                color: #ccc;
            }
        }
    }
}

/* 挑战预览 */
.challenges-preview {
    margin-bottom: 30px;

    h2 {
        margin-bottom: 16px;
        color: #333;
    }
}

.challenge-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.challenge-item {
    background: white;
    padding: 16px;
    border-radius: 12px;
    border: 2px solid #e0e0e0;

    .challenge-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .name {
            font-weight: 600;
            color: #333;
        }

        .reward {
            color: #f59e0b;
            font-weight: 600;
            font-size: 14px;
        }
    }

    .progress-bar {
        width: 100%;
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 4px;

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            transition: width 0.3s;
        }
    }

    .progress-text {
        font-size: 12px;
        color: #666;
    }
}

/* 小贴士 */
.tips-section {
    margin-bottom: 30px;

    .tip-card {
        background: white;
        padding: 20px;
        border-radius: 16px;
        border: 2px solid #e0e0e0;
        display: flex;
        gap: 16px;
        align-items: start;

        .tip-icon {
            font-size: 32px;
        }

        .tip-content {
            flex: 1;

            strong {
                display: block;
                margin-bottom: 8px;
                color: #333;
            }

            p {
                margin: 0;
                color: #666;
                line-height: 1.5;
            }
        }
    }
}

/* 动画 */
@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

/* 响应式 */
@media (max-width: 768px) {
    .home {
        padding: 16px;
    }

    .hero {
        padding: 24px;
    }

    .hero-title {
        font-size: 32px;
    }

    .hero-subtitle {
        font-size: 16px;
    }

    .stats-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;

        .stat-card {
            padding: 12px;

            .stat-value {
                font-size: 24px;
            }
        }
    }

    .action-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .ambient-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
</style>