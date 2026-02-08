/**
 * 斗地主游戏主入口
 * 初始化游戏并启动
 */

import { GameController } from './game.js';

// 创建游戏控制器实例
let game = null;

/**
 * DOM加载完成后初始化游戏
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🃏 斗地主游戏加载中...');
    
    // 创建并初始化游戏
    game = new GameController();
    game.init();
    
    console.log('✅ 游戏初始化完成！');
    
    // 添加一些全局事件处理
    setupGlobalHandlers();
});

/**
 * 设置全局事件处理器
 */
function setupGlobalHandlers() {
    // 防止双指缩放（移动端）
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        // 空格键 - 出牌/开始
        if (e.code === 'Space') {
            e.preventDefault();
            const playBtn = document.getElementById('btn-play');
            const startBtn = document.getElementById('btn-start');
            
            if (!playBtn.parentElement.classList.contains('hidden')) {
                playBtn.click();
            } else if (!startBtn.parentElement.classList.contains('hidden')) {
                startBtn.click();
            }
        }
        
        // P键 - 不出
        if (e.code === 'KeyP') {
            const passBtn = document.getElementById('btn-pass');
            if (!passBtn.parentElement.classList.contains('hidden') && !passBtn.disabled) {
                passBtn.click();
            }
        }
        
        // H键 - 提示
        if (e.code === 'KeyH') {
            const hintBtn = document.getElementById('btn-hint');
            if (!hintBtn.parentElement.classList.contains('hidden')) {
                hintBtn.click();
            }
        }

        // 1-3键 - 叫分
        if (e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Digit3') {
            const bidBtns = document.getElementById('bid-buttons');
            if (!bidBtns.classList.contains('hidden')) {
                const score = parseInt(e.code.slice(-1));
                const btn = document.getElementById(`btn-bid-${score}`);
                if (btn && !btn.disabled) {
                    btn.click();
                }
            }
        }

        // 0键 - 不叫
        if (e.code === 'Digit0') {
            const noBidBtn = document.getElementById('btn-no-bid');
            if (!noBidBtn.parentElement.classList.contains('hidden')) {
                noBidBtn.click();
            }
        }
    });

    // 窗口失去焦点时的处理
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // 页面不可见时可以暂停动画等
            console.log('页面不可见');
        } else {
            console.log('页面可见');
        }
    });

    // 防止右键菜单（可选）
    // document.addEventListener('contextmenu', (e) => e.preventDefault());
}

/**
 * 导出游戏实例供调试使用
 */
window.game = game;
