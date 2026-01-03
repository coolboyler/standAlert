<template>
    <div class="achievements-page">
        <div class="achievements-container">
            <h2>🏆 成就系统</h2>
            <p class="subtitle">解锁成就，获得奖励，成为站立达人！</p>

            <!-- 总览统计 -->
            <div class="overview-stats">
                <div class="stat-card">
                    <div class="stat-value">{{ userStore.achievements.filter(a => a.unlocked).length }}</div>
                    <div class="stat-label">已解锁成就</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">{{ userStore.longestStreak }}</div>
                    <div class="stat-label">最长连胜</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">{{ userStore.totalStands }}</div>
                    <div class="stat-label">总站立次数</div>
                </div>
            </div>

            <!-- 成就列表 -->
            <div class="achievements-grid">
                <div
                    v-for="achievement in userStore.achievements"
                    :key="achievement.id"
                    class="achievement-card"
                    :class="{ unlocked: achievement.unlocked }"
                >
                    <div class="achievement-icon">{{ achievement.icon }}</div>
                    <div class="achievement-info">
                        <div class="achievement-name">{{ achievement.name }}</div>
                        <div class="achievement-desc">{{ achievement.desc }}</div>
                    </div>
                    <div class="achievement-status">
                        <div v-if="achievement.unlocked" class="unlocked-badge">
                            <i class="fas fa-check"></i> 已解锁
                        </div>
                        <div v-else class="locked-badge">
                            <i class="fas fa-lock"></i> 未解锁
                        </div>
                    </div>
                </div>
            </div>

            <!-- 成就进度 -->
            <div class="achievement-progress">
                <h3>🎯 进度追踪</h3>
                <div class="progress-bar">
                    <div
                        class="progress-fill"
                        :style="{ width: progressPercentage + '%' }"
                    ></div>
                </div>
                <div class="progress-text">{{ progressPercentage }}% 完成度</div>
            </div>

            <!-- 即将解锁 -->
            <div class="upcoming-achievements" v-if="upcomingAchievements.length > 0">
                <h3>🔜 即将解锁</h3>
                <div class="upcoming-list">
                    <div
                        v-for="achievement in upcomingAchievements"
                        :key="achievement.id"
                        class="upcoming-item"
                    >
                        <span class="emoji">{{ achievement.icon }}</span>
                        <div class="info">
                            <div class="name">{{ achievement.name }}</div>
                            <div class="desc">{{ achievement.desc }}</div>
                        </div>
                        <div class="hint">继续努力！</div>
                    </div>
                </div>
            </div>

            <!-- 成就分类 -->
            <div class="achievement-categories">
                <h3>📊 成就分类</h3>
                <div class="category-grid">
                    <div class="category-card">
                        <div class="category-icon">🔥</div>
                        <div class="category-name">连胜系列</div>
                        <div class="category-count">{{ getAchievementCount('streak') }}/{{ getCategoryTotal('streak') }}</div>
                    </div>
                    <div class="category-card">
                        <div class="category-icon">🎯</div>
                        <div class="category-name">里程碑</div>
                        <div class="category-count">{{ getAchievementCount('milestone') }}/{{ getCategoryTotal('milestone') }}</div>
                    </div>
                    <div class="category-card">
                        <div class="category-icon">⏰</div>
                        <div class="category-name">时间特殊</div>
                        <div class="category-count">{{ getAchievementCount('time') }}/{{ getCategoryTotal('time') }}</div>
                    </div>
                    <div class="category-card">
                        <div class="category-icon">⭐</div>
                        <div class="category-name">其他</div>
                        <div class="category-count">{{ getAchievementCount('other') }}/{{ getCategoryTotal('other') }}</div>
                    </div>
                </div>
            </div>

            <!-- 成就详情模态框 -->
            <div v-if="selectedAchievement" class="achievement-modal" @click="selectedAchievement = null">
                <div class="modal-content" @click.stop>
                    <div class="modal-header">
                        <div class="modal-icon">{{ selectedAchievement.icon }}</div>
                        <h3>{{ selectedAchievement.name }}</h3>
                    </div>
                    <div class="modal-body">
                        <p>{{ selectedAchievement.desc }}</p>
                        <div class="modal-status">
                            <span v-if="selectedAchievement.unlocked" class="unlocked">✅ 已解锁</span>
                            <span v-else class="locked">🔒 未解锁</span>
                        </div>
                    </div>
                    <button class="close-btn" @click="selectedAchievement = null">关闭</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const selectedAchievement = ref(null)

const progressPercentage = computed(() => {
    const total = userStore.achievements.length
    const unlocked = userStore.achievements.filter(a => a.unlocked).length
    return Math.round((unlocked / total) * 100)
})

const upcomingAchievements = computed(() => {
    return userStore.achievements
        .filter(a => !a.unlocked)
        .slice(0, 3)
})

function getAchievementCount(category) {
    const categoryMap = {
        'streak': ['streak_3', 'streak_7', 'streak_30'],
        'milestone': ['first_stand', 'century', 'marathon'],
        'time': ['early_bird', 'night_owl', 'weekend_warrior'],
        'other': ['perfect_posture']
    }

    return userStore.achievements
        .filter(a => categoryMap[category].includes(a.id) && a.unlocked)
        .length
}

function getCategoryTotal(category) {
    const categoryMap = {
        'streak': ['streak_3', 'streak_7', 'streak_30'],
        'milestone': ['first_stand', 'century', 'marathon'],
        'time': ['early_bird', 'night_owl', 'weekend_warrior'],
        'other': ['perfect_posture']
    }
    return categoryMap[category].length
}
</script>

<style lang="scss" scoped>
.achievements-page {
    padding: 20px;
    max-width: 1000px;
    margin: 0 auto;
}

.achievements-container {
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

/* 总览统计 */
.overview-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    margin-bottom: 30px;

    .stat-card {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 20px;
        border-radius: 12px;
        text-align: center;

        .stat-value {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 4px;
        }

        .stat-label {
            font-size: 12px;
            opacity: 0.9;
        }
    }
}

/* 成就列表 */
.achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
    margin-bottom: 30px;

    .achievement-card {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 12px;
        border: 2px solid #e0e0e0;
        display: flex;
        gap: 16px;
        align-items: center;
        transition: all 0.3s;
        cursor: pointer;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        }

        &.unlocked {
            background: linear-gradient(135deg, rgba(72, 187, 120, 0.1), rgba(56, 161, 105, 0.1));
            border-color: #48bb78;
        }

        .achievement-icon {
            font-size: 40px;
            filter: grayscale(100%);
            transition: all 0.3s;

            .unlocked & {
                filter: grayscale(0%);
                animation: bounce 0.5s ease;
            }
        }

        .achievement-info {
            flex: 1;

            .achievement-name {
                font-weight: 600;
                color: #333;
                margin-bottom: 4px;
            }

            .achievement-desc {
                font-size: 12px;
                color: #666;
                line-height: 1.4;
            }
        }

        .achievement-status {
            .unlocked-badge {
                background: #48bb78;
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
            }

            .locked-badge {
                background: #e0e0e0;
                color: #666;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
            }
        }
    }
}

/* 进度追踪 */
.achievement-progress {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 30px;

    h3 {
        margin: 0 0 16px 0;
        color: #333;
    }

    .progress-bar {
        width: 100%;
        height: 16px;
        background: #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 8px;

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            transition: width 0.5s ease;
            border-radius: 8px;
        }
    }

    .progress-text {
        text-align: center;
        font-weight: 600;
        color: #667eea;
    }
}

/* 即将解锁 */
.upcoming-achievements {
    margin-bottom: 30px;

    h3 {
        margin: 0 0 16px 0;
        color: #333;
    }

    .upcoming-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .upcoming-item {
            background: white;
            padding: 16px;
            border-radius: 12px;
            border: 2px solid #e0e0e0;
            display: flex;
            gap: 12px;
            align-items: center;

            .emoji {
                font-size: 28px;
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

            .hint {
                background: #f59e0b;
                color: white;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
            }
        }
    }
}

/* 成就分类 */
.achievement-categories {
    h3 {
        margin: 0 0 16px 0;
        color: #333;
    }

    .category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;

        .category-card {
            background: #f8f9fa;
            padding: 16px;
            border-radius: 12px;
            text-align: center;
            border: 2px solid #e0e0e0;

            .category-icon {
                font-size: 32px;
                margin-bottom: 8px;
            }

            .category-name {
                font-weight: 600;
                color: #333;
                margin-bottom: 4px;
            }

            .category-count {
                font-size: 14px;
                color: #667eea;
                font-weight: 700;
            }
        }
    }
}

/* 成就详情模态框 */
.achievement-modal {
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

    .modal-content {
        background: white;
        border-radius: 20px;
        padding: 30px;
        max-width: 400px;
        width: 90%;
        animation: slideUp 0.3s ease;

        .modal-header {
            text-align: center;
            margin-bottom: 20px;

            .modal-icon {
                font-size: 64px;
                margin-bottom: 8px;
            }

            h3 {
                margin: 0;
                color: #333;
            }
        }

        .modal-body {
            text-align: center;
            margin-bottom: 24px;

            p {
                color: #666;
                line-height: 1.6;
                margin-bottom: 16px;
            }

            .modal-status {
                .unlocked {
                    color: #48bb78;
                    font-weight: 700;
                    font-size: 18px;
                }

                .locked {
                    color: #999;
                    font-weight: 700;
                    font-size: 18px;
                }
            }
        }

        .close-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: all 0.2s;

            &:hover {
                background: #5568d3;
            }
        }
    }
}

/* 动画 */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
}

/* 响应式 */
@media (max-width: 768px) {
    .achievements-page {
        padding: 16px;
    }

    .achievements-container {
        padding: 20px;
    }

    .achievements-grid {
        grid-template-columns: 1fr;
    }

    .category-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>