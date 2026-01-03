import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
    // 用户统计数据
    const totalStands = ref(0)
    const todayStands = ref(0)
    const currentStreak = ref(0)
    const longestStreak = ref(0)
    const totalPoints = ref(0)

    // 站立提醒设置
    const reminderInterval = ref(60) // 分钟
    const isReminderActive = ref(false)
    const nextReminderTime = ref(null)

    // 虚拟宠物状态
    const pet = ref({
        name: 'Standy',
        happiness: 100,
        hunger: 100,
        energy: 100,
        level: 1,
        xp: 0,
        type: 'default'
    })

    // 成就系统
    const achievements = ref([
        { id: 'first_stand', name: '初次站立', desc: '完成第一次站立', unlocked: false, icon: '🎯' },
        { id: 'streak_3', name: '3天连胜', desc: '连续3天站立', unlocked: false, icon: '🔥' },
        { id: 'streak_7', name: '7天连胜', desc: '连续7天站立', unlocked: false, icon: '⚡' },
        { id: 'streak_30', name: '30天连胜', desc: '连续30天站立', unlocked: false, icon: '💎' },
        { id: 'century', name: '百次达人', desc: '累计站立100次', unlocked: false, icon: '🏆' },
        { id: 'marathon', name: '马拉松选手', desc: '累计站立1000次', unlocked: false, icon: '🏃' },
        { id: 'early_bird', name: '早起鸟', desc: '早上7点前站立', unlocked: false, icon: '🌅' },
        { id: 'night_owl', name: '夜猫子', desc: '晚上11点后站立', unlocked: false, icon: '🌙' },
        { id: 'weekend_warrior', name: '周末战士', desc: '周末完成站立', unlocked: false, icon: '⚔️' },
        { id: 'perfect_posture', name: '姿势大师', desc: '完成AI姿势指导', unlocked: false, icon: '🧘' }
    ])

    // 挑战系统
    const challenges = ref([
        { id: 'daily_10', name: '每日10分钟', desc: '今天站立累计10分钟', progress: 0, target: 10, reward: 50, completed: false },
        { id: 'week_5', name: '一周5天', desc: '本周站立5天', progress: 0, target: 5, reward: 200, completed: false },
        { id: 'hour_glass', name: '沙漏挑战', desc: '连续站立1小时', progress: 0, target: 60, reward: 100, completed: false }
    ])

    // 历史记录
    const history = ref([])

    // 计算属性
    const petHappinessLevel = computed(() => {
        if (pet.value.happiness >= 80) return 'happy'
        if (pet.value.happiness >= 50) return 'neutral'
        return 'sad'
    })

    const canLevelUp = computed(() => {
        return pet.value.xp >= pet.value.level * 100
    })

    // 方法
    function recordStand(duration = 5) {
        totalStands.value++
        todayStands.value++
        totalPoints.value += duration * 2

        // 更新宠物状态
        pet.value.happiness = Math.min(100, pet.value.happiness + 10)
        pet.value.hunger = Math.max(0, pet.value.hunger - 5)
        pet.value.xp += duration

        // 检查升级
        if (canLevelUp.value) {
            pet.value.level++
            pet.value.xp = 0
            pet.value.energy = 100
            showNotification(`🎉 ${pet.value.name} 升级了！现在是等级 ${pet.value.level}`)
        }

        // 记录历史
        history.value.push({
            timestamp: Date.now(),
            duration,
            points: duration * 2
        })

        // 检查成就
        checkAchievements()

        // 检查挑战
        checkChallenges()

        // 更新连胜
        updateStreak()

        return true
    }

    function checkAchievements() {
        const checks = {
            'first_stand': () => totalStands.value >= 1,
            'streak_3': () => currentStreak.value >= 3,
            'streak_7': () => currentStreak.value >= 7,
            'streak_30': () => currentStreak.value >= 30,
            'century': () => totalStands.value >= 100,
            'marathon': () => totalStands.value >= 1000,
            'early_bird': () => {
                const hour = new Date().getHours()
                return hour >= 5 && hour <= 7 && todayStands.value > 0
            },
            'night_owl': () => {
                const hour = new Date().getHours()
                return hour >= 23 || hour <= 2 && todayStands.value > 0
            },
            'weekend_warrior': () => {
                const day = new Date().getDay()
                return (day === 0 || day === 6) && todayStands.value > 0
            }
        }

        achievements.value.forEach(achievement => {
            if (!achievement.unlocked && checks[achievement.id] && checks[achievement.id]()) {
                achievement.unlocked = true
                totalPoints.value += 100
                showNotification(`🏆 解锁成就: ${achievement.name}!`)
                triggerConfetti()
            }
        })
    }

    function checkChallenges() {
        challenges.value.forEach(challenge => {
            if (challenge.completed) return

            if (challenge.id === 'daily_10') {
                challenge.progress = Math.min(todayStands.value * 5, challenge.target)
            } else if (challenge.id === 'week_5') {
                // 简化处理，实际应该按周计算
                challenge.progress = Math.min(currentStreak.value, challenge.target)
            } else if (challenge.id === 'hour_glass') {
                challenge.progress = Math.min(todayStands.value * 5, challenge.target)
            }

            if (challenge.progress >= challenge.target && !challenge.completed) {
                challenge.completed = true
                totalPoints.value += challenge.reward
                showNotification(`🎉 挑战完成: ${challenge.name} +${challenge.reward}分!`)
            }
        })
    }

    function updateStreak() {
        const today = new Date().toDateString()
        const lastStand = history.value.length > 0 ?
            new Date(history.value[history.value.length - 1].timestamp).toDateString() : null

        if (lastStand === today) {
            // 今天已经站立过，连胜继续
            return
        }

        const yesterday = new Date(Date.now() - 86400000).toDateString()
        if (lastStand === yesterday) {
            // 昨天站立过，连胜+1
            currentStreak.value++
            if (currentStreak.value > longestStreak.value) {
                longestStreak.value = currentStreak.value
            }
        } else if (lastStand !== today) {
            // 断签了
            currentStreak.value = 1
        }
    }

    function feedPet() {
        if (pet.value.hunger < 100) {
            pet.value.hunger = Math.min(100, pet.value.hunger + 20)
            pet.value.happiness = Math.min(100, pet.value.happiness + 5)
            return true
        }
        return false
    }

    function restPet() {
        if (pet.value.energy < 100) {
            pet.value.energy = Math.min(100, pet.value.energy + 30)
            pet.value.happiness = Math.min(100, pet.value.happiness + 3)
            return true
        }
        return false
    }

    function setReminder(minutes) {
        reminderInterval.value = minutes
        if (isReminderActive.value) {
            scheduleNextReminder()
        }
    }

    function toggleReminder() {
        isReminderActive.value = !isReminderActive.value
        if (isReminderActive.value) {
            scheduleNextReminder()
        } else {
            nextReminderTime.value = null
        }
    }

    function scheduleNextReminder() {
        const now = Date.now()
        nextReminderTime.value = now + (reminderInterval.value * 60 * 1000)
    }

    function resetToday() {
        todayStands.value = 0
    }

    // 宠物状态随时间衰减
    function updatePetDecay() {
        pet.value.happiness = Math.max(0, pet.value.happiness - 0.1)
        pet.value.hunger = Math.max(0, pet.value.hunger - 0.05)
        pet.value.energy = Math.max(0, pet.value.energy - 0.08)
    }

    // 每分钟更新一次宠物状态
    setInterval(updatePetDecay, 60000)

    return {
        // 状态
        totalStands,
        todayStands,
        currentStreak,
        longestStreak,
        totalPoints,
        reminderInterval,
        isReminderActive,
        nextReminderTime,
        pet,
        achievements,
        challenges,
        history,

        // 计算属性
        petHappinessLevel,
        canLevelUp,

        // 方法
        recordStand,
        feedPet,
        restPet,
        setReminder,
        toggleReminder,
        resetToday,
        scheduleNextReminder
    }
})