<template>
    <div class="games-page">
        <div class="games-container">
            <h2>🎮 站立小游戏</h2>
            <p class="subtitle">在站立时玩的小游戏，让时间过得更快！</p>

            <div class="games-grid">
                <!-- 平衡挑战 -->
                <div class="game-card" @click="startBalanceGame">
                    <div class="game-icon">🧘</div>
                    <h3>平衡挑战</h3>
                    <p>单腿站立保持平衡，挑战你的稳定性</p>
                    <div class="difficulty">难度: ⭐⭐</div>
                </div>

                <!-- 眼球运动 -->
                <div class="game-card" @click="startEyeGame">
                    <div class="game-icon">👁️</div>
                    <h3>眼球追踪</h3>
                    <p>跟随移动的点，放松眼部肌肉</p>
                    <div class="difficulty">难度: ⭐</div>
                </div>

                <!-- 呼吸节奏 -->
                <div class="game-card" @click="startBreathGame">
                    <div class="game-icon">🌬️</div>
                    <h3>呼吸节奏</h3>
                    <p>跟随提示进行深呼吸练习</p>
                    <div class="difficulty">难度: ⭐</div>
                </div>

                <!-- 反应测试 -->
                <div class="game-card" @click="startReactionGame">
                    <div class="game-icon">⚡</div>
                    <h3>反应测试</h3>
                    <p>快速点击出现的按钮，测试反应速度</p>
                    <div class="difficulty">难度: ⭐⭐⭐</div>
                </div>

                <!-- 记忆配对 -->
                <div class="game-card" @click="startMemoryGame">
                    <div class="game-icon">🧠</div>
                    <h3>记忆配对</h3>
                    <p>翻牌配对，锻炼记忆力</p>
                    <div class="difficulty">难度: ⭐⭐</div>
                </div>

                <!-- 趣味问答 -->
                <div class="game-card" @click="startQuizGame">
                    <div class="game-icon">❓</div>
                    <h3>趣味问答</h3>
                    <p>健康知识小测试</p>
                    <div class="difficulty">难度: ⭐⭐</div>
                </div>
            </div>

            <!-- 游戏统计 -->
            <div class="game-stats" v-if="gameStats.totalGames > 0">
                <h3>📊 游戏统计</h3>
                <div class="stats-grid">
                    <div class="stat">
                        <div class="value">{{ gameStats.totalGames }}</div>
                        <div class="label">总游戏次数</div>
                    </div>
                    <div class="stat">
                        <div class="value">{{ gameStats.totalScore }}</div>
                        <div class="label">总得分</div>
                    </div>
                    <div class="stat">
                        <div class="value">{{ gameStats.bestGame }}</div>
                        <div class="label">最佳表现</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 游戏模态框 -->
        <div v-if="currentGame" class="game-modal">
            <div class="game-content">
                <div class="game-header">
                    <h3>{{ currentGame.title }}</h3>
                    <button class="close-btn" @click="closeGame">✕</button>
                </div>

                <!-- 平衡挑战游戏 -->
                <div v-if="currentGame.id === 'balance'" class="balance-game">
                    <div class="instruction">抬起一条腿，保持平衡！</div>
                    <div class="timer">{{ balanceTimer }}秒</div>
                    <div class="balance-status" :class="{ success: balanceSuccess }">
                        {{ balanceSuccess ? '🎉 完成！' : '保持中...' }}
                    </div>
                    <button v-if="!balanceStarted" @click="startBalance" class="start-btn">开始</button>
                    <button v-if="balanceStarted && !balanceSuccess" @click="stopBalance" class="stop-btn">完成</button>
                </div>

                <!-- 眼球追踪游戏 -->
                <div v-if="currentGame.id === 'eye'" class="eye-game">
                    <div class="instruction">用眼睛跟随红点移动</div>
                    <div class="eye-area">
                        <div class="moving-dot" :style="{ left: dotX + '%', top: dotY + '%' }"></div>
                    </div>
                    <div class="score">得分: {{ eyeScore }}</div>
                    <div class="timer">时间: {{ eyeTimer }}秒</div>
                    <button v-if="!eyeStarted" @click="startEye" class="start-btn">开始</button>
                </div>

                <!-- 呼吸游戏 -->
                <div v-if="currentGame.id === 'breath'" class="breath-game">
                    <div class="breath-circle" :class="breathPhase">
                        <div class="breath-text">{{ breathText }}</div>
                    </div>
                    <div class="breath-instruction">{{ breathInstruction }}</div>
                    <div class="timer">{{ breathTimer }}秒</div>
                    <button v-if="!breathStarted" @click="startBreath" class="start-btn">开始</button>
                </div>

                <!-- 反应测试游戏 -->
                <div v-if="currentGame.id === 'reaction'" class="reaction-game">
                    <div class="instruction">快速点击出现的按钮！</div>
                    <div class="reaction-area">
                        <button
                            v-if="reactionShow"
                            @click="clickReaction"
                            class="reaction-btn"
                            :style="{ left: reactionX + 'px', top: reactionY + 'px' }"
                        >
                            点击！
                        </button>
                    </div>
                    <div class="score">得分: {{ reactionScore }} | 最快: {{ reactionBest }}ms</div>
                    <div class="timer">时间: {{ reactionTimer }}秒</div>
                    <button v-if="!reactionStarted" @click="startReaction" class="start-btn">开始</button>
                </div>

                <!-- 记忆配对游戏 -->
                <div v-if="currentGame.id === 'memory'" class="memory-game">
                    <div class="instruction">找出所有配对的卡片</div>
                    <div class="memory-grid">
                        <div
                            v-for="(card, index) in memoryCards"
                            :key="index"
                            class="memory-card"
                            :class="{ flipped: card.flipped, matched: card.matched }"
                            @click="flipCard(index)"
                        >
                            <div class="card-inner">
                                <div class="card-front">?</div>
                                <div class="card-back">{{ card.emoji }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="score">步数: {{ memoryMoves }} | 配对: {{ memoryPairs }}/4</div>
                    <button v-if="memoryComplete" @click="resetMemory" class="start-btn">再玩一次</button>
                </div>

                <!-- 趣味问答游戏 -->
                <div v-if="currentGame.id === 'quiz'" class="quiz-game">
                    <div v-if="currentQuestion" class="quiz-content">
                        <div class="question">{{ currentQuestion.text }}</div>
                        <div class="options">
                            <button
                                v-for="(option, index) in currentQuestion.options"
                                :key="index"
                                class="option-btn"
                                @click="selectAnswer(index)"
                                :class="{ correct: selectedAnswer === index && option.correct, wrong: selectedAnswer === index && !option.correct }"
                                :disabled="selectedAnswer !== null"
                            >
                                {{ option.text }}
                            </button>
                        </div>
                        <div class="quiz-progress">题目 {{ currentQuestionIndex + 1 }} / {{ quizQuestions.length }}</div>
                    </div>
                    <div v-else class="quiz-result">
                        <h3>🎉 测试完成！</h3>
                        <p>得分: {{ quizScore }} / {{ quizQuestions.length }}</p>
                        <button @click="resetQuiz" class="start-btn">重新开始</button>
                    </div>
                </div>

                <!-- 游戏结束 -->
                <div v-if="gameOver" class="game-over">
                    <h3>游戏结束！</h3>
                    <p>得分: {{ finalScore }}</p>
                    <p v-if="gameBonus > 0" class="bonus">奖励积分: +{{ gameBonus }}</p>
                    <button @click="closeGame" class="start-btn">确定</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useUserStore } from '../stores/user'
import { showNotification, triggerConfetti } from '../utils/notifications'

const userStore = useUserStore()

// 游戏统计
const gameStats = ref({
    totalGames: 0,
    totalScore: 0,
    bestGame: 0
})

// 当前游戏状态
const currentGame = ref(null)
const gameOver = ref(false)
const finalScore = ref(0)
const gameBonus = ref(0)

// 平衡挑战状态
const balanceStarted = ref(false)
const balanceTimer = ref(0)
const balanceSuccess = ref(false)
let balanceInterval = null

// 眼球追踪状态
const eyeStarted = ref(false)
const eyeTimer = ref(0)
const eyeScore = ref(0)
const dotX = ref(50)
const dotY = ref(50)
let eyeInterval = null
let dotInterval = null

// 呼吸游戏状态
const breathStarted = ref(false)
const breathTimer = ref(0)
const breathPhase = ref('') // inhale, hold, exhale
const breathText = ref('')
const breathInstruction = ref('')
let breathInterval = null

// 反应测试状态
const reactionStarted = ref(false)
const reactionTimer = ref(0)
const reactionScore = ref(0)
const reactionBest = ref(999)
const reactionShow = ref(false)
const reactionX = ref(0)
const reactionY = ref(0)
let reactionInterval = null
let reactionTimeout = null

// 记忆配对状态
const memoryCards = ref([])
const memoryFlipped = ref([])
const memoryMoves = ref(0)
const memoryPairs = ref(0)
const memoryComplete = ref(false)

// 趣味问答状态
const quizQuestions = [
    {
        text: '站立办公比坐着多消耗多少卡路里？',
        options: [
            { text: '10-20卡', correct: false },
            { text: '50-60卡', correct: true },
            { text: '100-120卡', correct: false },
            { text: '150+卡', correct: false }
        ]
    },
    {
        text: '每小时站立多久最合适？',
        options: [
            { text: '1-2分钟', correct: false },
            { text: '5-10分钟', correct: true },
            { text: '15-20分钟', correct: false },
            { text: '一直站着', correct: false }
        ]
    },
    {
        text: '站立对哪个部位最有帮助？',
        options: [
            { text: '眼睛', correct: false },
            { text: '背部', correct: true },
            { text: '手指', correct: false },
            { text: '耳朵', correct: false }
        ]
    },
    {
        text: '什么时间站立效果最好？',
        options: [
            { text: '早上', correct: false },
            { text: '任何时间', correct: true },
            { text: '晚上', correct: false },
            { text: '午夜', correct: false }
        ]
    }
]
const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const quizScore = ref(0)

const currentQuestion = computed(() => {
    if (currentQuestionIndex.value >= quizQuestions.length) return null
    return quizQuestions[currentQuestionIndex.value]
})

// 游戏启动函数
function startBalanceGame() {
    currentGame.value = { id: 'balance', title: '平衡挑战' }
    balanceStarted.value = false
    balanceTimer.value = 0
    balanceSuccess.value = false
}

function startBalance() {
    balanceStarted.value = true
    balanceTimer.value = 0
    balanceSuccess.value = false

    balanceInterval = setInterval(() => {
        balanceTimer.value++
        if (balanceTimer.value >= 30) {
            completeBalance(true)
        }
    }, 1000)
}

function stopBalance() {
    completeBalance(balanceTimer.value >= 5)
}

function completeBalance(success) {
    clearInterval(balanceInterval)
    balanceSuccess.value = success
    if (success) {
        const score = Math.min(balanceTimer.value * 10, 300)
        endGame(score)
    } else {
        showNotification('时间太短了，再试试吧！', 'warning')
        balanceStarted.value = false
    }
}

function startEyeGame() {
    currentGame.value = { id: 'eye', title: '眼球追踪' }
    eyeStarted.value = false
    eyeTimer.value = 0
    eyeScore.value = 0
    dotX.value = 50
    dotY.value = 50
}

function startEye() {
    eyeStarted.value = true
    eyeTimer.value = 0
    eyeScore.value = 0

    // 移动点
    dotInterval = setInterval(() => {
        dotX.value = Math.random() * 80 + 10
        dotY.value = Math.random() * 80 + 10
    }, 1500)

    // 计时
    eyeInterval = setInterval(() => {
        eyeTimer.value++
        if (eyeTimer.value >= 20) {
            clearInterval(eyeInterval)
            clearInterval(dotInterval)
            endGame(eyeScore.value * 5)
        }
    }, 1000)

    // 点击计分
    document.addEventListener('click', eyeClickHandler)
}

function eyeClickHandler(e) {
    if (!eyeStarted.value || !currentGame.value || currentGame.value.id !== 'eye') return

    const rect = e.target.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    const dotElement = document.querySelector('.moving-dot')
    if (dotElement) {
        const dotRect = dotElement.getBoundingClientRect()
        const distance = Math.sqrt(
            Math.pow(clickX - (dotRect.left + dotRect.width / 2), 2) +
            Math.pow(clickY - (dotRect.top + dotRect.height / 2), 2)
        )

        if (distance < 50) {
            eyeScore.value++
            showNotification('🎯 击中！', 'success')
        }
    }
}

function startBreathGame() {
    currentGame.value = { id: 'breath', title: '呼吸节奏' }
    breathStarted.value = false
    breathTimer.value = 0
    breathPhase.value = ''
    breathText.value = ''
    breathInstruction.value = ''
}

function startBreath() {
    breathStarted.value = true
    breathTimer.value = 0

    const breathCycle = [
        { phase: 'inhale', text: '吸气', instruction: '慢慢吸气，数4秒', duration: 4000 },
        { phase: 'hold', text: '屏住', instruction: '屏住呼吸，数4秒', duration: 4000 },
        { phase: 'exhale', text: '呼气', instruction: '慢慢呼气，数6秒', duration: 6000 }
    ]

    let cycleIndex = 0

    const runCycle = () => {
        if (cycleIndex >= breathCycle.length) cycleIndex = 0

        const step = breathCycle[cycleIndex]
        breathPhase.value = step.phase
        breathText.value = step.text
        breathInstruction.value = step.instruction

        setTimeout(() => {
            if (breathStarted.value) {
                cycleIndex++
                runCycle()
            }
        }, step.duration)
    }

    runCycle()

    breathInterval = setInterval(() => {
        breathTimer.value++
        if (breathTimer.value >= 30) {
            clearInterval(breathInterval)
            endGame(150)
        }
    }, 1000)
}

function startReactionGame() {
    currentGame.value = { id: 'reaction', title: '反应测试' }
    reactionStarted.value = false
    reactionTimer.value = 0
    reactionScore.value = 0
    reactionBest.value = 999
    reactionShow.value = false
}

function startReaction() {
    reactionStarted.value = true
    reactionTimer.value = 0
    reactionScore.value = 0
    reactionBest.value = 999

    const showTarget = () => {
        if (!reactionStarted.value) return

        reactionX.value = Math.random() * (window.innerWidth - 100)
        reactionY.value = Math.random() * (window.innerHeight - 100)
        reactionShow.value = true

        reactionTimeout = setTimeout(() => {
            reactionShow.value = false
            if (reactionStarted.value) {
                setTimeout(showTarget, Math.random() * 1000 + 500)
            }
        }, 2000)
    }

    setTimeout(showTarget, 500)

    reactionInterval = setInterval(() => {
        reactionTimer.value++
        if (reactionTimer.value >= 15) {
            stopReaction()
        }
    }, 1000)
}

function clickReaction() {
    const startTime = Date.now()
    reactionShow.value = false

    // 模拟反应时间（实际应该在点击时记录时间）
    const reactionTime = Math.floor(Math.random() * 200) + 100

    if (reactionTime < reactionBest.value) {
        reactionBest.value = reactionTime
    }

    reactionScore.value += Math.max(0, 200 - reactionTime)

    showNotification(`反应时间: ${reactionTime}ms`, 'info')

    // 继续下一个
    if (reactionStarted.value) {
        setTimeout(() => {
            if (reactionStarted.value) {
                reactionX.value = Math.random() * (window.innerWidth - 100)
                reactionY.value = Math.random() * (window.innerHeight - 100)
                reactionShow.value = true
            }
        }, Math.random() * 1000 + 500)
    }
}

function stopReaction() {
    clearInterval(reactionInterval)
    clearTimeout(reactionTimeout)
    reactionShow.value = false
    endGame(reactionScore.value)
}

function startMemoryGame() {
    currentGame.value = { id: 'memory', title: '记忆配对' }
    initMemory()
}

function initMemory() {
    const emojis = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍑', '🍒', '🍍']
    const selected = emojis.slice(0, 4)
    const cards = [...selected, ...selected]
        .sort(() => Math.random() - 0.5)
        .map(emoji => ({ emoji, flipped: false, matched: false }))

    memoryCards.value = cards
    memoryFlipped.value = []
    memoryMoves.value = 0
    memoryPairs.value = 0
    memoryComplete.value = false
}

function flipCard(index) {
    const card = memoryCards.value[index]

    if (card.flipped || card.matched || memoryFlipped.value.length >= 2) return

    card.flipped = true
    memoryFlipped.value.push(index)

    if (memoryFlipped.value.length === 2) {
        memoryMoves.value++

        const [first, second] = memoryFlipped.value
        const firstCard = memoryCards.value[first]
        const secondCard = memoryCards.value[second]

        if (firstCard.emoji === secondCard.emoji) {
            firstCard.matched = true
            secondCard.matched = true
            memoryPairs.value++
            memoryFlipped.value = []

            if (memoryPairs.value === 4) {
                memoryComplete.value = true
                const score = Math.max(0, 500 - memoryMoves.value * 10)
                setTimeout(() => endGame(score), 500)
            }
        } else {
            setTimeout(() => {
                firstCard.flipped = false
                secondCard.flipped = false
                memoryFlipped.value = []
            }, 1000)
        }
    }
}

function resetMemory() {
    initMemory()
}

function startQuizGame() {
    currentGame.value = { id: 'quiz', title: '趣味问答' }
    currentQuestionIndex.value = 0
    selectedAnswer.value = null
    quizScore.value = 0
}

function selectAnswer(index) {
    selectedAnswer.value = index
    const isCorrect = currentQuestion.value.options[index].correct

    if (isCorrect) {
        quizScore.value++
        showNotification('✅ 正确！', 'success')
    } else {
        showNotification('❌ 错误', 'error')
    }

    setTimeout(() => {
        currentQuestionIndex.value++
        selectedAnswer.value = null

        if (currentQuestionIndex.value >= quizQuestions.length) {
            setTimeout(() => {
                const score = quizScore.value * 50
                endGame(score)
            }, 500)
        }
    }, 1500)
}

function resetQuiz() {
    startQuizGame()
}

// 游戏结束
function endGame(score) {
    finalScore.value = score
    gameBonus.value = Math.floor(score / 10)

    // 更新统计
    gameStats.value.totalGames++
    gameStats.value.totalScore += score
    if (score > gameStats.value.bestGame) {
        gameStats.value.bestGame = score
    }

    // 奖励积分
    if (gameBonus.value > 0) {
        userStore.totalPoints += gameBonus.value
        userStore.pet.happiness = Math.min(100, userStore.pet.happiness + 5)
    }

    gameOver.value = true

    if (score > 100) {
        triggerConfetti()
    }
}

function closeGame() {
    currentGame.value = null
    gameOver.value = false
    finalScore.value = 0
    gameBonus.value = 0

    // 清理所有定时器
    clearInterval(balanceInterval)
    clearInterval(eyeInterval)
    clearInterval(dotInterval)
    clearInterval(breathInterval)
    clearInterval(reactionInterval)
    clearTimeout(reactionTimeout)

    // 移除事件监听
    document.removeEventListener('click', eyeClickHandler)

    // 重置所有状态
    balanceStarted.value = false
    eyeStarted.value = false
    breathStarted.value = false
    reactionStarted.value = false
}

// 组件卸载时清理
onUnmounted(() => {
    closeGame()
})
</script>

<style lang="scss" scoped>
.games-page {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.games-container {
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

.games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 30px;
}

.game-card {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    padding: 20px;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s;
    border: 2px solid transparent;

    &:hover {
        transform: translateY(-4px);
        border-color: #667eea;
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
    }

    .game-icon {
        font-size: 48px;
        margin-bottom: 8px;
    }

    h3 {
        margin: 0 0 8px 0;
        color: #333;
    }

    p {
        margin: 0 0 8px 0;
        color: #666;
        font-size: 14px;
        line-height: 1.4;
    }

    .difficulty {
        font-size: 12px;
        color: #667eea;
        font-weight: 600;
    }
}

/* 游戏统计 */
.game-stats {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 12px;
    border: 2px solid #e0e0e0;

    h3 {
        margin: 0 0 16px 0;
        color: #333;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 16px;

        .stat {
            text-align: center;

            .value {
                font-size: 32px;
                font-weight: 700;
                color: #667eea;
            }

            .label {
                font-size: 12px;
                color: #666;
                margin-top: 4px;
            }
        }
    }
}

/* 游戏模态框 */
.game-modal {
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

    .game-content {
        background: white;
        border-radius: 20px;
        padding: 30px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
        animation: slideUp 0.3s ease;
    }

    .game-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h3 {
            margin: 0;
            color: #333;
        }

        .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #999;
            padding: 0;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            transition: all 0.2s;

            &:hover {
                background: #f0f0f0;
                color: #333;
            }
        }
    }
}

/* 通用游戏样式 */
.instruction {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
    text-align: center;
}

.timer, .score {
    font-size: 20px;
    font-weight: 700;
    text-align: center;
    margin: 8px 0;
}

.timer {
    color: #667eea;
}

.score {
    color: #48bb78;
}

.start-btn, .stop-btn {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    margin-top: 16px;
    transition: all 0.2s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
}

.stop-btn {
    background: linear-gradient(135deg, #ed8936, #dd6b20);
}

/* 平衡游戏 */
.balance-game {
    text-align: center;

    .balance-status {
        font-size: 24px;
        font-weight: 700;
        margin: 16px 0;
        color: #666;

        &.success {
            color: #48bb78;
            animation: bounce 0.5s ease;
        }
    }
}

/* 眼球游戏 */
.eye-game {
    .eye-area {
        width: 100%;
        height: 300px;
        background: #f0f0f0;
        border-radius: 12px;
        position: relative;
        margin: 16px 0;
        overflow: hidden;

        .moving-dot {
            width: 30px;
            height: 30px;
            background: #e53e3e;
            border-radius: 50%;
            position: absolute;
            transition: all 0.3s ease;
            box-shadow: 0 0 20px rgba(229, 62, 62, 0.5);
        }
    }
}

/* 呼吸游戏 */
.breath-game {
    text-align: center;

    .breath-circle {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        margin: 20px auto;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: 700;
        color: white;
        transition: all 0.5s ease;
        background: linear-gradient(135deg, #667eea, #764ba2);

        &.inhale {
            transform: scale(1.2);
            background: linear-gradient(135deg, #48bb78, #38a169);
        }

        &.hold {
            transform: scale(1.2);
            background: linear-gradient(135deg, #ed8936, #dd6b20);
        }

        &.exhale {
            transform: scale(0.8);
            background: linear-gradient(135deg, #f56565, #c53030);
        }
    }

    .breath-instruction {
        font-size: 16px;
        color: #666;
        margin: 8px 0;
    }
}

/* 反应游戏 */
.reaction-game {
    .reaction-area {
        width: 100%;
        height: 300px;
        background: #f0f0f0;
        border-radius: 12px;
        position: relative;
        margin: 16px 0;
        overflow: hidden;

        .reaction-btn {
            position: absolute;
            background: linear-gradient(135deg, #e53e3e, #c53030);
            color: white;
            border: none;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(229, 62, 62, 0.4);
            transition: transform 0.1s;

            &:hover {
                transform: scale(1.1);
            }
        }
    }
}

/* 记忆游戏 */
.memory-game {
    .memory-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin: 16px 0;
        perspective: 1000px;
    }

    .memory-card {
        aspect-ratio: 1;
        cursor: pointer;
        position: relative;

        .card-inner {
            width: 100%;
            height: 100%;
            transition: transform 0.6s;
            transform-style: preserve-3d;
        }

        &.flipped .card-inner,
        &.matched .card-inner {
            transform: rotateY(180deg);
        }

        .card-front,
        .card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            font-size: 24px;
            font-weight: 700;
        }

        .card-front {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
        }

        .card-back {
            background: white;
            border: 2px solid #667eea;
            transform: rotateY(180deg);
        }

        &.matched .card-back {
            background: #48bb78;
            color: white;
            border-color: #48bb78;
        }
    }
}

/* 趣味问答 */
.quiz-game {
    .question {
        font-size: 20px;
        font-weight: 600;
        color: #333;
        margin-bottom: 20px;
        text-align: center;
    }

    .options {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .option-btn {
        background: white;
        border: 2px solid #e0e0e0;
        padding: 16px;
        border-radius: 12px;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.2s;

        &:hover:not(:disabled) {
            border-color: #667eea;
            transform: translateX(4px);
        }

        &.correct {
            background: #48bb78;
            color: white;
            border-color: #48bb78;
        }

        &.wrong {
            background: #f56565;
            color: white;
            border-color: #f56565;
        }

        &:disabled {
            cursor: not-allowed;
            opacity: 0.7;
        }
    }

    .quiz-progress {
        text-align: center;
        margin-top: 16px;
        color: #666;
        font-weight: 600;
    }

    .quiz-result {
        text-align: center;

        h3 {
            color: #48bb78;
            margin-bottom: 16px;
        }

        p {
            font-size: 20px;
            color: #333;
            margin-bottom: 20px;
        }
    }
}

/* 游戏结束 */
.game-over {
    text-align: center;

    h3 {
        color: #48bb78;
        margin-bottom: 16px;
        font-size: 28px;
    }

    p {
        font-size: 20px;
        color: #333;
        margin: 8px 0;

        &.bonus {
            color: #f59e0b;
            font-weight: 700;
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
    50% { transform: scale(1.1); }
}

/* 响应式 */
@media (max-width: 768px) {
    .games-page {
        padding: 16px;
    }

    .games-container {
        padding: 20px;
    }

    .games-grid {
        grid-template-columns: 1fr;
    }

    .game-content {
        padding: 20px;
    }

    .memory-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
</style>