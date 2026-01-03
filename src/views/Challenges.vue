<template>
    <div class="challenges-page">
        <div class="challenges-container">
            <h2>🎯 挑战中心</h2>
            <p class="subtitle">完成挑战，获得丰厚奖励！</p>

            <!-- 挑战列表 -->
            <div class="challenges-list">
                <div
                    v-for="challenge in userStore.challenges"
                    :key="challenge.id"
                    class="challenge-card"
                    :class="{ completed: challenge.completed }"
                >
                    <div class="challenge-header">
                        <div class="challenge-info">
                            <h3>{{ challenge.name }}</h3>
                            <p>{{ challenge.desc }}</p>
                        </div>
                        <div class="challenge-reward">
                            <span class="reward-points">+{{ challenge.reward }}</span>
                            <span class="reward-label">积分</span>
                        </div>
                    </div>

                    <div class="challenge-progress">
                        <div class="progress-bar">
                            <div
                                class="progress-fill"
                                :style="{ width: (challenge.progress / challenge.target * 100) + '%' }"
                            ></div>
                        </div>
                        <div class="progress-text">
                            {{ challenge.progress }}/{{ challenge.target }}
                            <span v-if="challenge.completed" class="completed-text">✅ 已完成</span>
                        </div>
                    </div>

                    <div class="challenge-actions">
                        <button
                            v-if="!challenge.completed"
                            class="action-btn"
                            @click="quickComplete(challenge)"
                        >
                            快速完成
                        </button>
                        <button
                            v-else
                            class="action-btn completed-btn"
                            disabled
                        >
                            已获得奖励
                        </button>
                    </div>
                </div>
            </div>

            <!-- 每日挑战 -->
            <div class="daily-challenges">
                <h3>📅 每日挑战</h3>
                <div class="daily-grid">
                    <div class="daily-card" @click="startDailyChallenge('water')">
                        <div class="icon">💧</div>
                        <div class="name">喝水提醒</div>
                        <div class="desc">站立时记得喝水</div>
                    </div>
                    <div class="daily-card" @click="startDailyChallenge('stretch')">
                        <div class="icon">🤸</div>
                        <div class="name">伸展运动</div>
                        <div class="desc">做3个伸展动作</div>
                    </div>
                    <div class="daily-card" @click="startDailyChallenge('deep')">
                        <div class="icon">🧘</div>
                        <div class="name">深呼吸</div>
                        <div class="desc">完成5次深呼吸</div>
                    </div>
                    <div class="daily-card" @click="startDailyChallenge('posture')">
                        <div class="icon">📏</div>
                        <div class="name">姿势检查</div>
                        <div class="desc">调整正确姿势</div>
                    </div>
                </div>
            </div>

            <!-- 挑战统计 -->
            <div class="challenge-stats">
                <h3>📊 挑战统计</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">{{ completedChallenges }}</div>
                        <div class="stat-label">已完成挑战</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">{{ totalRewards }}</div>
                        <div class="stat-label">总奖励积分</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">{{ activeChallenges }}</div>
                        <div class="stat-label">进行中</div>
                    </div>
                </div>
            </div>

            <!-- 挑战建议 -->
            <div class="challenge-tips">
                <h3>💡 挑战小贴士</h3>
                <div class="tips-list">
                    <div class="tip-item">
                        <span class="tip-number">1</span>
                        <span>从小目标开始，逐步增加难度</span>
                    </div>
                    <div class="tip-item">
                        <span class="tip-number">2</span>
                        <span>设置提醒，保持规律性</span>
                    </div>
                    <div class="tip-item">
                        <span class="tip-number">3</span>
                        <span>与朋友分享进度，互相鼓励</span>
                    </div>
                    <div class="tip-item">
                        <span class="tip-number">4</span>
                        <span>完成挑战后奖励自己</span>
                    </div>
                </div>
            </div>

            <!-- 自定义挑战 -->
            <div class="custom-challenge">
                <h3>✨ 创建自定义挑战</h3>
                <div class="custom-form">
                    <input
                        v-model="customChallenge.name"
                        placeholder="挑战名称"
                        class="form-input"
                    />
                    <input
                        v-model="customChallenge.desc"
                        placeholder="挑战描述"
                        class="form-input"
                    />
                    <div class="form-row">
                        <input
                            v-model.number="customChallenge.target"
                            type="number"
                            placeholder="目标次数"
                            class="form-input"
                        />
                        <input
                            v-model.number="customChallenge.reward"
                            type="number"
                            placeholder="奖励积分"
                            class="form-input"
                        />
                    </div>
                    <button class="create-btn" @click="createCustomChallenge">创建挑战</button>
                </div>
            </div>

            <!-- 挑战完成动画 -->
            <div v-if="showChallengeComplete" class="challenge-complete-overlay">
                <div class="challenge-complete-content">
                    <div class="emoji">🎉</div>
                    <h2>挑战完成！</h2>
                    <p>{{ completedChallengeName }}</p>
                    <div class="reward-display">+{{ completedChallengeReward }} 积分</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useUserStore } from '../stores/user'
import { showNotification, triggerConfetti } from '../utils/notifications'

const userStore = useUserStore()

const showChallengeComplete = ref(false)
const completedChallengeName = ref('')
const completedChallengeReward = ref(0)

const customChallenge = reactive({
    name: '',
    desc: '',
    target: 10,
    reward: 50
})

const completedChallenges = computed(() => {
    return userStore.challenges.filter(c => c.completed).length
})

const totalRewards = computed(() => {
    return userStore.challenges
        .filter(c => c.completed)
        .reduce((sum, c) => sum + c.reward, 0)
})

const activeChallenges = computed(() => {
    return userStore.challenges.filter(c => !c.completed).length
})

function quickComplete(challenge) {
    if (challenge.completed) return

    // 根据挑战类型快速完成
    if (challenge.id === 'daily_10') {
        userStore.recordStand(10)
    } else if (challenge.id === 'week_5') {
        userStore.currentStreak = 5
        userStore.recordStand(5)
    } else if (challenge.id === 'hour_glass') {
        userStore.recordStand(60)
    }

    // 检查是否完成
    userStore.checkChallenges?.()

    // 如果还是没完成，强制完成
    if (!challenge.completed) {
        challenge.progress = challenge.target
        challenge.completed = true
        userStore.totalPoints += challenge.reward
    }

    // 显示完成动画
    showChallengeAnimation(challenge.name, challenge.reward)
}

function showChallengeAnimation(name, reward) {
    completedChallengeName.value = name
    completedChallengeReward.value = reward
    showChallengeComplete.value = true
    triggerConfetti()

    setTimeout(() => {
        showChallengeComplete.value = false
    }, 2500)
}

function startDailyChallenge(type) {
    const actions = {
        water: {
            name: '喝水提醒',
            message: '💧 记得喝一杯水，保持水分充足！',
            points: 10
        },
        stretch: {
            name: '伸展运动',
            message: '🤸 做3个伸展动作，放松肌肉！',
            points: 15
        },
        deep: {
            name: '深呼吸',
            message: '🧘 完成5次深呼吸，放松身心！',
            points: 10
        },
        posture: {
            name: '姿势检查',
            message: '📏 调整姿势，保持挺拔！',
            points: 10
        }
    }

    const action = actions[type]
    showNotification(action.message, 'success')
    userStore.totalPoints += action.points
    userStore.pet.happiness = Math.min(100, userStore.pet.happiness + 3)

    // 记录到宠物日志
    if (userStore.pet) {
        const now = new Date()
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
        // 这里可以扩展宠物日志系统
    }
}

function createCustomChallenge() {
    if (!customChallenge.name || !customChallenge.desc || !customChallenge.target || !customChallenge.reward) {
        showNotification('请填写完整信息', 'warning')
        return
    }

    if (customChallenge.target < 1 || customChallenge.reward < 1) {
        showNotification('目标和奖励必须大于0', 'warning')
        return
    }

    const newChallenge = {
        id: 'custom_' + Date.now(),
        name: customChallenge.name,
        desc: customChallenge.desc,
        progress: 0,
        target: customChallenge.target,
        reward: customChallenge.reward,
        completed: false
    }

    userStore.challenges.push(newChallenge)
    showNotification('✅ 自定义挑战创建成功！', 'success')

    // 重置表单
    customChallenge.name = ''
    customChallenge.desc = ''
    customChallenge.target = 10
    customChallenge.reward = 50
}
</script>

<style lang="scss" scoped>
.challenges-page {
    padding: 20px;
    max-width: 900px;
    margin: 0 auto;
}

.challenges-container {
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

/* 挑战列表 */
.challenges-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 30px;

    .challenge-card {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 12px;
        border: 2px solid #e0e0e0;
        transition: all 0.3s;

        &.completed {
            background: linear-gradient(135deg, rgba(72, 187, 120, 0.1), rgba(56, 161, 105, 0.1));
            border-color: #48bb78;
            opacity: 0.8;
        }

        .challenge-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 16px;

            .challenge-info {
                flex: 1;

                h3 {
                    margin: 0 0 4px 0;
                    color: #333;
                }

                p {
                    margin: 0;
                    color: #666;
                    font-size: 14px;
                }
            }

            .challenge-reward {
                text-align: center;
                background: #f59e0b;
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                min-width: 60px;

                .reward-points {
                    font-size: 20px;
                    font-weight: 700;
                    display: block;
                }

                .reward-label {
                    font-size: 10px;
                    opacity: 0.9;
                }
            }
        }

        .challenge-progress {
            margin-bottom: 16px;

            .progress-bar {
                width: 100%;
                height: 10px;
                background: #e0e0e0;
                border-radius: 5px;
                overflow: hidden;
                margin-bottom: 6px;

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #667eea, #764ba2);
                    transition: width 0.5s ease;
                    border-radius: 5px;
                }
            }

            .progress-text {
                font-size: 14px;
                color: #666;
                font-weight: 600;

                .completed-text {
                    color: #48bb78;
                    font-weight: 700;
                    margin-left: 8px;
                }
            }
        }

        .challenge-actions {
            .action-btn {
                background: #667eea;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                width: 100%;
                transition: all 0.2s;

                &:hover:not(:disabled) {
                    background: #5568d3;
                    transform: translateY(-1px);
                }

                &:disabled {
                    background: #48bb78;
                    cursor: not-allowed;
                    opacity: 0.7;
                }
            }
        }
    }
}

/* 每日挑战 */
.daily-challenges {
    margin-bottom: 30px;

    h3 {
        margin: 0 0 16px 0;
        color: #333;
    }

    .daily-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;

        .daily-card {
            background: white;
            padding: 16px;
            border-radius: 12px;
            border: 2px solid #e0e0e0;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
                border-color: #667eea;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
            }

            .icon {
                font-size: 32px;
                margin-bottom: 8px;
            }

            .name {
                font-weight: 600;
                color: #333;
                margin-bottom: 4px;
                font-size: 14px;
            }

            .desc {
                font-size: 11px;
                color: #666;
            }
        }
    }
}

/* 挑战统计 */
.challenge-stats {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 30px;

    h3 {
        margin: 0 0 16px 0;
        color: #333;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 16px;

        .stat-card {
            text-align: center;

            .stat-value {
                font-size: 32px;
                font-weight: 700;
                color: #667eea;
            }

            .stat-label {
                font-size: 12px;
                color: #666;
                margin-top: 4px;
            }
        }
    }
}

/* 挑战小贴士 */
.challenge-tips {
    margin-bottom: 30px;

    h3 {
        margin: 0 0 16px 0;
        color: #333;
    }

    .tips-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .tip-item {
            background: white;
            padding: 12px 16px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            display: flex;
            align-items: center;
            gap: 12px;

            .tip-number {
                background: #667eea;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 700;
                flex-shrink: 0;
            }
        }
    }
}

/* 自定义挑战 */
.custom-challenge {
    h3 {
        margin: 0 0 16px 0;
        color: #333;
    }

    .custom-form {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 12px;

        .form-input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            margin-bottom: 12px;
            font-size: 14px;
            transition: all 0.2s;

            &:focus {
                outline: none;
                border-color: #667eea;
            }

            &::placeholder {
                color: #999;
            }
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 12px;
        }

        .create-btn {
            background: linear-gradient(135deg, #48bb78, #38a169);
            color: white;
            border: none;
            padding: 12px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: all 0.2s;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
            }
        }
    }
}

/* 挑战完成动画 */
.challenge-complete-overlay {
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

    .challenge-complete-content {
        text-align: center;
        color: white;
        animation: bounceIn 0.6s ease-out;

        .emoji {
            font-size: 80px;
            margin-bottom: 16px;
        }

        h2 {
            font-size: 36px;
            margin: 0 0 8px 0;
            color: #f9ca24;
        }

        p {
            font-size: 20px;
            margin: 0 0 12px 0;
            opacity: 0.9;
        }

        .reward-display {
            font-size: 24px;
            font-weight: 700;
            color: #48bb78;
            background: rgba(255, 255, 255, 0.2);
            padding: 12px 24px;
            border-radius: 12px;
            display: inline-block;
        }
    }
}

/* 动画 */
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

/* 响应式 */
@media (max-width: 768px) {
    .challenges-page {
        padding: 16px;
    }

    .challenges-container {
        padding: 20px;
    }

    .daily-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .form-row {
        grid-template-columns: 1fr !important;
    }
}
</style>