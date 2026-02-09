/**
 * 音效模块
 * 管理游戏中的所有音效
 */

/**
 * 音效管理器
 */
export class SoundManager {
    constructor() {
        this.bgmEnabled = false;
        this.sfxEnabled = true;
        this.bgmVolume = 0.3;
        this.sfxVolume = 0.6;
        
        // 音效缓存
        this.sounds = {};
        
        // 使用在线音效资源（免费可用的音效）
        this.soundUrls = {
            bgm: 'https://assets.mixkit.co/music/preview/mixkit-games-worldbeat-466.mp3',
            deal: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
            play: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
            bomb: 'https://assets.mixkit.co/active_storage/sfx/2810/2810-preview.mp3',
            win: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
            lose: 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3',
            bid: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
            pass: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
            click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
            select: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
        };

        // 语音文字（模拟语音效果，实际使用Web Speech API）
        this.voiceTexts = {
            bid1: '一分',
            bid2: '二分',
            bid3: '三分',
            noBid: '不叫',
            pass: '不出',
            bomb: '炸弹',
            rocket: '王炸',
            spring: '春天',
            win: '我赢了',
            lose: '你赢了'
        };

        this.speechEnabled = true;
        // Check for window existence before accessing speech synthesis (for testing/Node environment)
        if (typeof window !== 'undefined') {
            this.speechSynth = window.speechSynthesis;
        } else {
            this.speechSynth = null;
        }
    }

    /**
     * 初始化音效
     */
    async init() {
        // 预加载音效
        for (const [name, url] of Object.entries(this.soundUrls)) {
            try {
                const audio = new Audio();
                audio.src = url;
                audio.preload = 'auto';
                audio.volume = name === 'bgm' ? this.bgmVolume : this.sfxVolume;
                if (name === 'bgm') {
                    audio.loop = true;
                }
                this.sounds[name] = audio;
            } catch (e) {
                console.warn(`Failed to load sound: ${name}`, e);
            }
        }
    }

    /**
     * 播放音效
     */
    play(name) {
        if (!this.sfxEnabled && name !== 'bgm') return;
        if (!this.bgmEnabled && name === 'bgm') return;

        const sound = this.sounds[name];
        if (sound) {
            try {
                // 重置播放位置
                if (name !== 'bgm') {
                    sound.currentTime = 0;
                }
                sound.play().catch(e => {
                    // 自动播放被阻止时忽略错误
                    console.warn('Sound play blocked:', e);
                });
            } catch (e) {
                console.warn(`Failed to play sound: ${name}`, e);
            }
        }
    }

    /**
     * 停止音效
     */
    stop(name) {
        const sound = this.sounds[name];
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
    }

    /**
     * 播放背景音乐
     */
    playBGM() {
        if (this.bgmEnabled) {
            this.play('bgm');
        }
    }

    /**
     * 停止背景音乐
     */
    stopBGM() {
        this.stop('bgm');
    }

    /**
     * 切换背景音乐
     */
    toggleBGM() {
        this.bgmEnabled = !this.bgmEnabled;
        if (this.bgmEnabled) {
            this.playBGM();
        } else {
            this.stopBGM();
        }
        return this.bgmEnabled;
    }

    /**
     * 切换音效
     */
    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }

    /**
     * 播放发牌音效
     */
    playDeal() {
        this.play('deal');
    }

    /**
     * 播放出牌音效
     */
    playCard() {
        this.play('play');
    }

    /**
     * 播放炸弹音效
     */
    playBomb() {
        this.play('bomb');
    }

    /**
     * 播放胜利音效
     */
    playWin() {
        this.play('win');
    }

    /**
     * 播放失败音效
     */
    playLose() {
        this.play('lose');
    }

    /**
     * 播放叫分音效
     */
    playBid() {
        this.play('bid');
    }

    /**
     * 播放不出音效
     */
    playPass() {
        this.play('pass');
    }

    /**
     * 播放点击音效
     */
    playClick() {
        this.play('click');
    }

    /**
     * 播放选牌音效
     */
    playSelect() {
        this.play('select');
    }

    /**
     * 播放语音
     */
    speak(textKey) {
        if (!this.speechEnabled || !this.sfxEnabled) return;
        if (!this.speechSynth) return;

        const text = this.voiceTexts[textKey] || textKey;
        
        // 取消之前的语音
        this.speechSynth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = this.sfxVolume;

        // 尝试获取中文语音
        const voices = this.speechSynth.getVoices();
        const chineseVoice = voices.find(v => v.lang.includes('zh'));
        if (chineseVoice) {
            utterance.voice = chineseVoice;
        }

        this.speechSynth.speak(utterance);
    }

    /**
     * 根据叫分数播放语音
     */
    speakBid(score) {
        if (score === 0) {
            this.speak('noBid');
        } else {
            this.speak(`bid${score}`);
        }
        this.playBid();
    }

    /**
     * 播放不出语音
     */
    speakPass() {
        this.speak('pass');
        this.playPass();
    }

    /**
     * 播放炸弹语音
     */
    speakBomb() {
        this.speak('bomb');
        this.playBomb();
    }

    /**
     * 播放王炸语音
     */
    speakRocket() {
        this.speak('rocket');
        this.playBomb();
    }

    /**
     * 播放春天语音
     */
    speakSpring() {
        this.speak('spring');
    }

    /**
     * 播放胜利/失败语音
     */
    speakResult(isWin) {
        if (isWin) {
            this.speak('win');
            this.playWin();
        } else {
            this.speak('lose');
            this.playLose();
        }
    }

    /**
     * 设置背景音乐音量
     */
    setBGMVolume(volume) {
        this.bgmVolume = volume;
        if (this.sounds.bgm) {
            this.sounds.bgm.volume = volume;
        }
    }

    /**
     * 设置音效音量
     */
    setSFXVolume(volume) {
        this.sfxVolume = volume;
        for (const [name, sound] of Object.entries(this.sounds)) {
            if (name !== 'bgm') {
                sound.volume = volume;
            }
        }
    }

    /**
     * 清理资源
     */
    cleanup() {
        for (const sound of Object.values(this.sounds)) {
            sound.pause();
            sound.src = '';
        }
        this.sounds = {};
        if (this.speechSynth) {
            this.speechSynth.cancel();
        }
    }
}

// 导出单例
export const soundManager = new SoundManager();
