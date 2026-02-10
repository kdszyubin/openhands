/**
 * 拖拽选牌功能模块
 * 实现拖拽框选牌的功能
 */

export class DragSelectionManager {
    constructor(gameController) {
        this.gameController = gameController;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.selectionBox = null;
        this.dragOrigin = null;
        this.playerArea = null;
        
        this.init();
    }

    init() {
        // 获取玩家区域
        this.playerArea = document.getElementById('my-cards');
        if (!this.playerArea) {
            console.warn('未找到玩家手牌区域，跳过拖拽选牌功能');
            return;
        }

        // 绑定事件
        this.playerArea.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    handleMouseDown(e) {
        // 检查是否点击了卡片本身
        if (e.target.closest('.card')) {
            return;
        }

        // 仅在人手区开始拖拽
        if (e.target.closest('#my-cards')) {
            this.isDragging = true;
            this.dragOrigin = { x: e.clientX, y: e.clientY };
            
            // 创建选框
            this.createSelectionBox(e);
            
            // 阻止默认行为
            e.preventDefault();
        }
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;

        this.currentX = e.clientX;
        this.currentY = e.clientY;

        // 更新选框位置和大小
        this.updateSelectionBox();

        // 更新卡片选中状态
        this.updateCardSelection();
    }

    handleMouseUp(e) {
        if (!this.isDragging) return;

        this.isDragging = false;
        
        // 更新卡片选择状态并完成选择
        this.finalizeSelection();
    }

    createSelectionBox(e) {
        // 创建选框元素
        this.selectionBox = document.createElement('div');
        this.selectionBox.className = 'drag-selection-box';
        
        // 添加到容器中
        const container = document.getElementById('my-cards');
        container.appendChild(this.selectionBox);
        
        // 设置起始位置
        this.startX = e.clientX;
        this.startY = e.clientY;
        
        // 获取容器的位置和滚动偏移
        const rect = container.getBoundingClientRect();
        const scrollTop = container.scrollTop || 0;
        
        // 设置选框位置（相对于容器）
        const left = e.clientX - rect.left;  // 不在此处乘以devicePixelRatio，因为我们要根据屏幕实际坐标设置样式
        const top = e.clientY - rect.top + scrollTop;
        
        this.selectionBox.style.left = left + 'px';
        this.selectionBox.style.top = top + 'px';
        this.selectionBox.style.width = '0px';
        this.selectionBox.style.height = '0px';
    }

    updateSelectionBox() {
        if (!this.selectionBox) return;

        // 获取容器的相对位置
        const container = document.getElementById('my-cards');
        const rect = container.getBoundingClientRect();
        const scrollTop = container.scrollTop || 0;

        // 计算相对于容器的位置（不需要设备像素比校正）
        const startX = this.startX - rect.left;
        const startY = this.startY - rect.top + scrollTop;
        const currentX = this.currentX - rect.left;
        const currentY = this.currentY - rect.top + scrollTop;

        // 计算选框的边界
        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);

        // 应用样式
        this.selectionBox.style.left = left + 'px';
        this.selectionBox.style.top = top + 'px';
        this.selectionBox.style.width = width + 'px';
        this.selectionBox.style.height = height + 'px';
    }

    updateCardSelection() {
        if (!this.selectionBox) return;

        const container = document.getElementById('my-cards');
        const cards = Array.from(container.querySelectorAll('.card[data-card-id]'));

        cards.forEach(cardEl => {
            const rect = cardEl.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const scrollTop = container.scrollTop || 0;

            // 计算卡片相对于容器的位置
            const cardTop = rect.top - containerRect.top + scrollTop;
            const cardLeft = rect.left - containerRect.left;
            const cardRight = rect.right - containerRect.left;
            const cardBottom = rect.bottom - containerRect.top + scrollTop;

            // 获取选框的边界（相对于容器）
            const selectionLeft = this.selectionBox.offsetLeft;
            const selectionTop = this.selectionBox.offsetTop;
            const selectionRight = selectionLeft + parseInt(this.selectionBox.style.width);
            const selectionBottom = selectionTop + parseInt(this.selectionBox.style.height);

            // 检查卡片是否与选框相交（添加轻微容差以处理边缘接触）
            const tolerance = 2; // 2像素容差，提高精确度
            const intersects = 
                cardLeft < selectionRight + tolerance &&
                cardRight > selectionLeft - tolerance &&
                cardTop < selectionBottom + tolerance &&
                cardBottom > selectionTop - tolerance;

            if (intersects) {
                cardEl.classList.add('drag-over');
            } else {
                cardEl.classList.remove('drag-over');
            }
        });
    }
    
    /**
     * 获取在选框内的卡片
     */
    getSelectedCardsInArea() {
        const container = document.getElementById('my-cards');
        const cards = Array.from(container.querySelectorAll('.card.drag-over'));
        const selectedIds = cards.map(card => card.dataset.cardId);
        
        // 返回实际的Card对象
        const player = this.gameController.players[1]; // 人类玩家总是索引为1
        return player.hand.cards.filter(card => selectedIds.includes(card.id));
    }
    
    /**
     * 完成区域选择
     */
    finalizeSelection() {
        if (!this.selectionBox) return;

        const cardsInArea = this.getSelectedCardsInArea();
        
        // 切换这些卡片的选中状态
        const player = this.gameController.players[1]; // 人类玩家
        cardsInArea.forEach(card => {
            player.toggleCard(card.id);
        });
        
        // 更新视觉状态
        this.gameController.updateCardSelection();
        
        // 清除选框并重置状态
        if (this.selectionBox && this.selectionBox.parentNode) {
            this.selectionBox.parentNode.removeChild(this.selectionBox);
            this.selectionBox = null;
        }
        
        this.isDragging = false;
    }
}

/**
 * 卡片拖拽移动功能
 */
export class CardDragManager {
    constructor(gameController) {
        this.gameController = gameController;
        this.isCardDragging = false;
        this.draggedCard = null;
        this.originalIndex = -1;
        this.dragOffset = { x: 0, y: 0 };
        
        this.init();
    }

    init() {
        // 为玩家手牌绑定拖拽事件
        this.setupCardDragEvents();
    }

    setupCardDragEvents() {
        // 使用事件委托监听卡片拖拽事件
        const container = document.getElementById('my-cards');
        if (!container) return;

        // 鼠标按下开始拖拽
        container.addEventListener('mousedown', (e) => {
            const cardEl = e.target.closest('.card');
            if (cardEl) {
                this.startCardDrag(e, cardEl);
            }
        });

        // 鼠标移动时处理拖拽
        document.addEventListener('mousemove', (e) => {
            if (this.isCardDragging) {
                this.onCardDrag(e);
            }
        });

        // 鼠标释放结束拖拽
        document.addEventListener('mouseup', () => {
            if (this.isCardDragging) {
                this.endCardDrag();
            }
        });
    }

    startCardDrag(e, cardEl) {
        if (this.gameController.phase !== 'playing') return;
        if (this.gameController.currentPlayerIndex !== 1) return; // 只有人类玩家可以拖拽

        this.isCardDragging = true;
        this.draggedCard = cardEl;

        // 记录原始位置和偏移
        const rect = cardEl.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;

        // 添加拖拽样式
        cardEl.classList.add('dragging');
        
        // 防止默认行为
        e.preventDefault();
    }

    onCardDrag(e) {
        if (!this.draggedCard) return;

        // 更新卡片位置
        this.draggedCard.style.position = 'fixed';
        this.draggedCard.style.left = (e.clientX - this.dragOffset.x) + 'px';
        this.draggedCard.style.top = (e.clientY - this.dragOffset.y) + 'px';
        this.draggedCard.style.zIndex = '1000';
    }

    endCardDrag() {
        if (!this.draggedCard) return;

        // 移除拖拽样式
        this.draggedCard.classList.remove('dragging');
        this.draggedCard.style.position = '';
        this.draggedCard.style.left = '';
        this.draggedCard.style.top = '';
        this.draggedCard.style.zIndex = '';

        // 根据是否在出牌区域执行相应操作
        // 暂时只做选中操作，后续可扩展拖到出牌区域的功能
        const cardId = this.draggedCard.dataset.cardId;
        if (cardId) {
            const player = this.gameController.players[1];
            player.toggleCard(cardId);
            this.gameController.updateCardSelection();
        }

        // 重置状态
        this.isCardDragging = false;
        this.draggedCard = null;
    }
}