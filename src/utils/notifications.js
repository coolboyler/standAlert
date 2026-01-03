// 通知系统
export function showNotification(message, type = 'info') {
    // 浏览器通知权限检查
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification('站立提醒', {
                body: message,
                icon: '🎯',
                badge: '🚶'
            })
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('站立提醒', {
                        body: message,
                        icon: '🎯'
                    })
                }
            })
        }
    }

    // 页面内通知
    createToast(message, type)
}

function createToast(message, type) {
    const toast = document.createElement('div')
    const colors = {
        info: '#667eea',
        success: '#48bb78',
        warning: '#ed8936',
        error: '#f56565'
    }

    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type] || colors.info};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-weight: 600;
        animation: toastSlide 0.3s ease-out;
        max-width: 90%;
        text-align: center;
    `
    toast.textContent = message

    // 添加动画样式
    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style')
        style.id = 'toast-style'
        style.textContent = `
            @keyframes toastSlide {
                from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
        `
        document.head.appendChild(style)
    }

    document.body.appendChild(toast)
    setTimeout(() => {
        toast.style.opacity = '0'
        toast.style.transform = 'translateX(-50%) translateY(-20px)'
        setTimeout(() => toast.remove(), 300)
    }, 3000)
}

// 简单的确认对话框
export function confirmDialog(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div')
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s ease-out;
        `

        const dialog = document.createElement('div')
        dialog.style.cssText = `
            background: white;
            padding: 24px;
            border-radius: 16px;
            max-width: 400px;
            margin: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: scaleIn 0.3s ease-out;
        `

        dialog.innerHTML = `
            <h3 style="margin: 0 0 16px 0; color: #333; font-size: 18px;">${message}</h3>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button id="cancel" style="
                    padding: 10px 20px;
                    border: 2px solid #ddd;
                    background: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    color: #666;
                ">取消</button>
                <button id="confirm" style="
                    padding: 10px 20px;
                    border: none;
                    background: #667eea;
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                ">确认</button>
            </div>
        `

        // 添加样式
        if (!document.getElementById('dialog-style')) {
            const style = document.createElement('style')
            style.id = 'dialog-style'
            style.textContent = `
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `
            document.head.appendChild(style)
        }

        overlay.appendChild(dialog)
        document.body.appendChild(overlay)

        dialog.querySelector('#confirm').onclick = () => {
            overlay.remove()
            resolve(true)
        }

        dialog.querySelector('#cancel').onclick = () => {
            overlay.remove()
            resolve(false)
        }

        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove()
                resolve(false)
            }
        }
    })
}

// 彩色纸屑效果
export function triggerConfetti() {
    // 简单的CSS粒子效果
    const container = document.createElement('div')
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9998;
        overflow: hidden;
    `

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe']
    const particleCount = 50

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div')
        particle.style.cssText = `
            position: absolute;
            width: 8px;
            height: 8px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            top: -10px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
            transform: rotate(${Math.random() * 360}deg);
        `
        container.appendChild(particle)
    }

    // 添加动画样式
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style')
        style.id = 'confetti-style'
        style.textContent = `
            @keyframes confettiFall {
                to {
                    transform: translateY(100vh) rotate(720deg);
                    opacity: 0;
                }
            }
        `
        document.head.appendChild(style)
    }

    document.body.appendChild(container)
    setTimeout(() => container.remove(), 4000)
}

// 挑战完成特效
export function showChallengeComplete(title, reward) {
    const overlay = document.createElement('div')
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-out;
    `

    const content = document.createElement('div')
    content.style.cssText = `
        text-align: center;
        color: white;
        animation: bounceIn 0.6s ease-out;
    `

    content.innerHTML = `
        <div style="font-size: 64px; margin-bottom: 16px;">🏆</div>
        <h2 style="font-size: 32px; margin: 0 0 8px 0;">挑战完成!</h2>
        <div style="font-size: 20px; opacity: 0.9;">${title}</div>
        <div style="font-size: 24px; margin-top: 12px; color: #f9ca24;">+${reward} 分</div>
    `

    if (!document.getElementById('challenge-style')) {
        const style = document.createElement('style')
        style.id = 'challenge-style'
        style.textContent = `
            @keyframes bounceIn {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.1); }
                70% { transform: scale(0.9); }
                100% { transform: scale(1); opacity: 1; }
            }
        `
        document.head.appendChild(style)
    }

    overlay.appendChild(content)
    document.body.appendChild(overlay)

    triggerConfetti()

    setTimeout(() => {
        overlay.style.opacity = '0'
        setTimeout(() => overlay.remove(), 300)
    }, 2500)
}