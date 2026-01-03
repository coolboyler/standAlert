<template>
    <div class="stats-page">
        <div class="stats-container">
            <h2>📊 数据统计</h2>
            <p class="subtitle">查看你的站立数据和健康趋势</p>

            <!-- 关键指标 -->
            <div class="key-metrics">
                <div class="metric-card">
                    <div class="metric-value">{{ userStore.totalStands }}</div>
                    <div class="metric-label">总站立次数</div>
                    <div class="metric-icon">🎯</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">{{ userStore.todayStands }}</div>
                    <div class="metric-label">今日站立</div>
                    <div class="metric-icon">📅</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">{{ userStore.currentStreak }}</div>
                    <div class="metric-label">当前连胜</div>
                    <div class="metric-icon">🔥</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">{{ userStore.totalPoints }}</div>
                    <div class="metric-label">总积分</div>
                    <div class="metric-icon">⭐</div>
                </div>
            </div>

            <!-- 健康影响 -->
            <div class="health-impact">
                <h3>💪 健康影响估算</h3>
                <div class="impact-grid">
                    <div class="impact-item">
                        <div class="impact-value">{{ estimatedCalories }}</div>
                        <div class="impact-label">额外消耗卡路里</div>
                    </div>
                    <div class="impact-item">
                        <div class="impact-value">{{ estimatedTime }}</div>
                        <div class="impact-label">站立总时长</div>
                    </div>
                    <div class="impact-item">
                        <div class="impact-value">{{ healthScore }}</div>
                        <div class="impact-label">健康评分</div>
                    </div>
                </div>
            </div>

            <!-- 站立历史图表 -->
            <div class="history-chart">
                <h3>📈 站立历史</h3>
                <div class="chart-container">
                    <div class="chart-bars">
                        <div
                            v-for="(day, index) in weekData"
                            :key="index"
                            class="chart-bar-group"
                        >
                            <div
                                class="chart-bar"
                                :style="{ height: (day.stands / maxStands * 100) + '%' }"
                                :class="{ active: day.isToday }"
                            ></div>
                            <div class="chart-label">{{ day.label }}</div>
                            <div class="chart-value">{{ day.stands }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 详细统计 -->
            <div class="detailed-stats">
                <h3>📋 详细统计</h3>
                <div class="stats-grid">
                    <div class="stat-row">
                        <span class="label">最长连胜</span>
                        <span class="value">{{ userStore.longestStreak }} 天</span>
                    </div>
                    <div class="stat-row">
                        <span class="label">平均每日站立</span>
                        <span class="value">{{ averageDailyStands }} 次</span>
                    </div>
                    <div class="stat-row">
                        <span class="label">本周站立</span>
                        <span class="value">{{ weeklyStands }} 次</span>
                    </div>
                    <div class="stat-row">
                        <span class="label">本月站立</span>
                        <span class="value">{{ monthlyStands }} 次</span>
                    </div>
                    <div class="stat-row">
                        <span class="label">宠物等级</span>
                        <span class="value">{{ userStore.pet.level }}</span>
                    </div>
                    <div class="stat-row">
                        <span class="label">解锁成就</span>
                        <span class="value">{{ unlockedAchievements }}/{{ totalAchievements }}</span>
                    </div>
                </div>
            </div>

            <!-- 健康小贴士 -->
            <div class="health-tips">
                <h3>💡 健康建议</h3>
                <div class="tips-grid">
                    <div class="tip-card">
                        <div class="tip-icon">🎯</div>
                        <div class="tip-text">继续保持，你做得很好！</div>
                    </div>
                    <div class="tip-card">
                        <div class="tip-icon">⚡</div>
                        <div class="tip-text">尝试增加站立时长到10分钟</div>
                    </div>
                    <div class="tip-card">
                        <div class="tip-icon">🌟</div>
                        <div class="tip-text">配合伸展运动效果更佳</div>
                    </div>
                </div>
            </div>

            <!-- 数据导出 -->
            <div class="data-actions">
                <h3>💾 数据管理</h3>
                <div class="action-buttons">
                    <button class="action-btn" @click="exportData">
                        <span>📤</span> 导出数据
                    </button>
                    <button class="action-btn" @click="resetData">
                        <span>🔄</span> 重置数据
                    </button>
                    <button class="action-btn" @click="shareProgress">
                        <span>🎯</span> 分享进度
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { showNotification, confirmDialog } from '../utils/notifications'

const userStore = useUserStore()

// 估算健康数据
const estimatedCalories = computed(() => {
    // 假设每次站立5分钟，消耗约25卡路里
    return Math.round(userStore.totalStands * 25)
})

const estimatedTime = computed(() => {
    const totalMinutes = userStore.totalStands * 5
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`
})

const healthScore = computed(() => {
    let score = 50
    if (userStore.totalStands > 100) score += 20
    if (userStore.currentStreak >= 7) score += 15
    if (userStore.longestStreak >= 30) score += 15
    return Math.min(100, score)
})

// 周数据
const weekData = ref([
    { label: '一', stands: 0, isToday: false },
    { label: '二', stands: 0, isToday: false },
    { label: '三', stands: 0, isToday: false },
    { label: '四', stands: 0, isToday: false },
    { label: '五', stands: 0, isToday: false },
    { label: '六', stands: 0, isToday: false },
    { label: '日', stands: 0, isToday: false }
])

const maxStands = computed(() => {
    return Math.max(...weekData.value.map(d => d.stands), 1)
})

// 详细统计
const averageDailyStands = computed(() => {
    if (userStore.totalStands === 0) return 0
    const days = Math.max(1, Math.floor((Date.now() - (userStore.history[0]?.timestamp || Date.now())) / 86400000) + 1)
    return (userStore.totalStands / days).toFixed(1)
})

const weeklyStands = computed(() => {
    const weekAgo = Date.now() - 7 * 86400000
    return userStore.history.filter(h => h.timestamp >= weekAgo).length
})

const monthlyStands = computed(() => {
    const monthAgo = Date.now() - 30 * 86400000
    return userStore.history.filter(h => h.timestamp >= monthAgo).length
})

const unlockedAchievements = computed(() => {
    return userStore.achievements.filter(a => a.unlocked).length
})

const totalAchievements = computed(() => {
    return userStore.achievements.length
})

// 生成模拟周数据（实际项目中应从历史记录计算）
function generateWeekData() {
    const today = new Date().getDay()
    const adjustedToday = today === 0 ? 6 : today - 1 // 转换为0-6，周一为0

    // 从历史记录中获取最近7天的数据
    const sevenDaysAgo = Date.now() - 7 * 86400000
    const recentHistory = userStore.history.filter(h => h.timestamp >= sevenDaysAgo)

    // 按天分组
    const dailyData = {}
    recentHistory.forEach(record => {
        const date = new Date(record.timestamp).toDateString()
        dailyData[date] = (dailyData[date] || 0) + 1
    })

    // 填充周数据
    for (let i = 0; i < 7; i++) {
        const date = new Date(Date.now() - (6 - i) * 86400000)
        const dateStr = date.toDateString()
        weekData.value[i].stands = dailyData[dateStr] || 0
        weekData.value[i].isToday = i === adjustedToday
    }
}

// 数据导出
function exportData() {
    const data = {
        user: {
            totalStands: userStore.totalStands,
            totalPoints: userStore.totalPoints,
            currentStreak: userStore.currentStreak,
            longestStreak: userStore.longestStreak,
            pet: userStore.pet
        },
        achievements: userStore.achievements,
        challenges: userStore.challenges,
        history: userStore.history,
        exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `standup-data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    showNotification('✅ 数据已导出', 'success')
}

// 重置数据
async function resetData() {
    const confirmed = await confirmDialog('确定要重置所有数据吗？此操作不可恢复！')
    if (!confirmed) return

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

    showNotification('🔄 数据已重置', 'info')
}

// 分享进度
function shareProgress() {
    const text = `我在站立冒险中已经站立了 ${userStore.totalStands} 次！当前连胜 ${userStore.currentStreak} 天，总积分 ${userStore.totalPoints} 分！快来和我一起保持健康吧！🚶‍♂️💪`

    if (navigator.share) {
        navigator.share({
            title: '站立冒险 - 我的进度',
            text: text
        }).then(() => {
            showNotification('✅ 分享成功！', 'success')
        }).catch(() => {
            copyToClipboard(text)
        })
    } else {
        copyToClipboard(text)
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('📋 已复制到剪贴板', 'success')
    }).catch(() => {
        showNotification('复制失败，请手动复制', 'error')
    })
}

onMounted(() => {
    generateWeekData()
})
</script>

<style lang="scss" scoped>
.stats-page {
    padding: 20px;
    max-width: 1000px;
    margin: 0 auto;
}

.stats-container {
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

/* 关键指标 */
.key-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    margin-bottom: 30px;

    .metric-card {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 20px;
        border-radius: 12px;
        text-align: center;
        position: relative;
        overflow: hidden;

        &::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
        }

        .metric-value {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 4px;
            position: relative;
            z-index: 1;
        }

        .metric-label {
            font-size: 12px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }

        .metric-icon {
            font-size: 24px;
            margin-top: 8px;
            position: relative;
            z-index: 1;
        }
    }
}

/* 健康影响 */
.health-impact {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 30px;

    h3 {
        margin: 0 0 16px 0;
        color: #333;
    }

    .impact-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 16px;

        .impact-item {
            text-align: center;

            .impact-value {
                font-size: 28px;
                font-weight: 700;
                color: #48bb78;
            }

            .impact-label {
                font-size: 12px;
                color: #666;
                margin-top: 4px;
            }
        }
    }
}

/* 历史图表 */
.history-chart {
    margin-bottom: 30px;

    h3 {
        margin: 0 0 16px 0;
        color: #333;
    }

    .chart-container {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 12px;

        .chart-bars {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            height: 150px;
            gap: 8px;

            .chart-bar-group {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;

                .chart-bar {
                    width: 100%;
                    background: linear-gradient(180deg, #667eea, #764ba2);
                    border-radius: 6px 6px 0 0;
                    transition: height 0.5s ease;
                    min-height: 4px;

                    &.active {
                        background: linear-gradient(180deg, #48bb78, #38a169);
                        box-shadow: 0 0 10px rgba(72, 187, 120, 0.5);
                    }
                }

                .chart-label {
                    font-size: 12px;
                    color: #666;
                    font-weight: 600;
                }

                .chart-value {
                    font-size: 12px;
                    color: #333;
                    font-weight: 700;
                }
            }
        }
    }
}

/* 详细统计 */
.detailed-stats {
    margin-bottom: 30px;

    h3 {
        margin: 0 0 16px 0;
        color: #333;
    }

    .stats-grid {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 12px;

        .stat-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e0e0e0;

            &:last-child {
                border-bottom: none;
            }

            .label {
                color: #666;
                font-weight: 500;
            }

            .value {
                color: #333;
                font-weight: 700;
            }
        }
    }
}

/* 健康小贴士 */
.health-tips {
    margin-bottom: 30px;

    h3 {
        margin: 0 0 16px 0;
        color: #333;
    }

    .tips-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;

        .tip-card {
            background: white;
            padding: 16px;
            border-radius: 12px;
            border: 2px solid #e0e0e0;
            display: flex;
            gap: 12px;
            align-items: center;

            .tip-icon {
                font-size: 24px;
            }

            .tip-text {
                color: #333;
                font-weight: 500;
            }
        }
    }
}

/* 数据管理 */
.data-actions {
    h3 {
        margin: 0 0 16px 0;
        color: #333;
    }

    .action-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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

            span {
                font-size: 18px;
            }
        }
    }
}

/* 响应式 */
@media (max-width: 768px) {
    .stats-page {
        padding: 16px;
    }

    .stats-container {
        padding: 20px;
    }

    .key-metrics {
        grid-template-columns: repeat(2, 1fr);
    }

    .impact-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .tips-grid {
        grid-template-columns: 1fr;
    }
}
</style>