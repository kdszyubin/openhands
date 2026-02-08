/**
 * 动画模块
 * 处理游戏中的各种动画效果
 */

/**
 * 动画管理器
 */
export class AnimationManager {
    constructor() {
        this.isAnimating = false;
    }

    /**
     * 发牌动画
     */
    async dealCards(cardElements, delay = 50) {
        this.isAnimating = true;
        
        for (let i = 0; i < cardElements.length; i++) {
            const card = cardElements[i];
            card.style.opacity = '0';
            card.style.transform = 'translateY(-50px) scale(0.8)';
        }

        for (let i = 0; i < cardElements.length; i++) {
            const card = cardElements[i];
            await this.wait(delay);
            card.style.transition = 'all 0.3s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        }

        this.isAnimating = false;
    }

    /**
     * 出牌动画
     */
    async playCardsAnimation(sourceElement, targetElement, cards) {
        this.isAnimating = true;

        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();

        // 创建飞行的牌
        const flyingCards = document.createElement('div');
        flyingCards.className = 'flying-cards';
        flyingCards.style.cssText = `
            position: fixed;
            left: ${sourceRect.left + sourceRect.width / 2}px;
            top: ${sourceRect.top}px;
            transform: translate(-50%, -50%);
            display: flex;
            z-index: 1000;
            transition: all 0.4s ease-out;
        `;

        cards.forEach((card, index) => {
            const cardEl = card.createElement();
            cardEl.style.marginLeft = index > 0 ? '-30px' : '0';
            cardEl.style.transform = 'scale(0.8)';
            flyingCards.appendChild(cardEl);
        });

        document.body.appendChild(flyingCards);

        await this.wait(50);

        flyingCards.style.left = `${targetRect.left + targetRect.width / 2}px`;
        flyingCards.style.top = `${targetRect.top + targetRect.height / 2}px`;

        await this.wait(400);
        flyingCards.remove();

        this.isAnimating = false;
    }

    /**
     * 选牌动画
     */
    selectCardAnimation(cardElement, selected) {
        if (selected) {
            cardElement.style.transform = 'translateY(-20px)';
            cardElement.classList.add('selected');
        } else {
            cardElement.style.transform = 'translateY(0)';
            cardElement.classList.remove('selected');
        }
    }

    /**
     * 显示文字提示动画
     */
    async showMessage(container, message, duration = 1500) {
        const msgEl = document.createElement('div');
        msgEl.className = 'game-message';
        msgEl.textContent = message;
        msgEl.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(0.5);
            background: linear-gradient(135deg, #ffd700, #ff8c00);
            color: #fff;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            z-index: 100;
            opacity: 0;
            transition: all 0.3s ease-out;
        `;

        container.appendChild(msgEl);

        await this.wait(50);
        msgEl.style.opacity = '1';
        msgEl.style.transform = 'translate(-50%, -50%) scale(1)';

        await this.wait(duration);
        msgEl.style.opacity = '0';
        msgEl.style.transform = 'translate(-50%, -50%) scale(0.8)';

        await this.wait(300);
        msgEl.remove();
    }

    /**
     * 显示玩家动作
     */
    async showPlayerAction(container, action, type = 'normal') {
        const actionEl = document.createElement('div');
        actionEl.className = `player-action-text ${type}`;
        actionEl.textContent = action;
        
        let bgColor = 'rgba(0,0,0,0.7)';
        if (type === 'bid') bgColor = 'linear-gradient(135deg, #4CAF50, #45a049)';
        if (type === 'pass') bgColor = 'linear-gradient(135deg, #9e9e9e, #757575)';
        if (type === 'bomb') bgColor = 'linear-gradient(135deg, #f44336, #d32f2f)';
        
        actionEl.style.cssText = `
            background: ${bgColor};
            color: #fff;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 18px;
            font-weight: bold;
            animation: actionPopup 0.3s ease-out;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        `;

        container.innerHTML = '';
        container.appendChild(actionEl);

        return actionEl;
    }

    /**
     * 炸弹特效
     */
    async bombEffect(container) {
        this.isAnimating = true;

        const effect = document.createElement('div');
        effect.className = 'bomb-effect';
        effect.innerHTML = '💥';
        effect.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(0);
            font-size: 150px;
            z-index: 1000;
            animation: bombExplode 0.8s ease-out forwards;
            filter: drop-shadow(0 0 20px #ff4444);
        `;

        document.body.appendChild(effect);

        // 屏幕震动
        document.body.style.animation = 'screenShake 0.5s ease-out';

        await this.wait(800);
        effect.remove();
        document.body.style.animation = '';

        this.isAnimating = false;
    }

    /**
     * 王炸特效
     */
    async rocketEffect(container) {
        this.isAnimating = true;

        const effect = document.createElement('div');
        effect.className = 'rocket-effect';
        effect.innerHTML = '🚀💥';
        effect.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(0);
            font-size: 120px;
            z-index: 1000;
            animation: rocketExplode 1s ease-out forwards;
        `;

        document.body.appendChild(effect);
        document.body.style.animation = 'screenShake 0.6s ease-out';

        await this.wait(1000);
        effect.remove();
        document.body.style.animation = '';

        this.isAnimating = false;
    }

    /**
     * 胜利动画
     */
    async victoryAnimation(container, isWin) {
        this.isAnimating = true;

        // 创建烟花/哭脸效果
        const effectCount = isWin ? 20 : 10;
        const symbol = isWin ? '🎉' : '😢';

        for (let i = 0; i < effectCount; i++) {
            const particle = document.createElement('div');
            particle.textContent = isWin ? ['🎉', '🎊', '⭐', '✨'][Math.floor(Math.random() * 4)] : symbol;
            particle.style.cssText = `
                position: fixed;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                font-size: ${20 + Math.random() * 30}px;
                z-index: 1000;
                animation: particleFall ${2 + Math.random()}s ease-out forwards;
                pointer-events: none;
            `;
            document.body.appendChild(particle);

            setTimeout(() => particle.remove(), 3000);
        }

        this.isAnimating = false;
    }

    /**
     * 翻底牌动画
     */
    async flipLandlordCards(cardElements) {
        this.isAnimating = true;

        for (const card of cardElements) {
            card.style.transition = 'transform 0.3s ease-out';
            card.style.transform = 'rotateY(90deg)';
            await this.wait(150);
            card.classList.remove('face-down');
            card.style.transform = 'rotateY(0deg)';
        }

        this.isAnimating = false;
    }

    /**
     * 高亮地主标识
     */
    highlightLandlord(playerElement) {
        playerElement.classList.add('is-landlord');
        
        const crown = document.createElement('div');
        crown.className = 'landlord-crown';
        crown.textContent = '👑';
        crown.style.cssText = `
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 30px;
            animation: crownBounce 1s ease-in-out infinite;
        `;

        const info = playerElement.querySelector('.player-info');
        if (info && !info.querySelector('.landlord-crown')) {
            info.appendChild(crown);
        }
    }

    /**
     * 等待指定时间
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 清理所有动画元素
     */
    cleanup() {
        document.querySelectorAll('.flying-cards, .bomb-effect, .rocket-effect, .game-message')
            .forEach(el => el.remove());
        document.body.style.animation = '';
    }
}

// 导出单例
export const animationManager = new AnimationManager();
