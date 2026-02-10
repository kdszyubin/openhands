/**
 * 拖拽选牌真实场景测试
 * 验证实际游戏中的边界情况处理
 */

function simulateRealDragSelection() {
    console.log("开始真实场景拖拽选牌测试...\n");

    // 定义实际游戏中的检测函数，与drag-selection.js中的逻辑一致
    function checkCardIntersection(cardRect, containerRect, scrollTop, selectionBox) {
        // 计算卡片相对于容器的位置
        const cardTop = cardRect.top - containerRect.top + scrollTop;
        const cardLeft = cardRect.left;
        const cardRight = cardRect.right;
        const cardBottom = cardRect.bottom - containerRect.top + scrollTop;

        // 获取选框的边界（相对于容器）
        const selectionLeft = selectionBox.offsetLeft;
        const selectionTop = selectionBox.offsetTop;
        const selectionRight = selectionLeft + parseInt(selectionBox.style.width);
        const selectionBottom = selectionTop + parseInt(selectionBox.style.height);

        // 检查卡片是否与选框相交（添加微小容差以处理边缘接触）
        const tolerance = 1; // 1像素容差
        const intersects = 
            cardLeft < selectionRight + tolerance &&
            cardRight > selectionLeft - tolerance &&
            cardTop < selectionBottom + tolerance &&
            cardBottom > selectionTop - tolerance;

        return intersects;
    }

    console.log("=== 测试1: 标准场景 - 单独选中某张牌 ===");
    // 模拟3张牌排列
    const cards = [
        { id: 'card-1', left: 100, top: 150, right: 170, bottom: 250 },  // 第一张牌
        { id: 'card-2', left: 130, top: 150, right: 200, bottom: 250 },  // 第二张牌，与第一张部分重叠
        { id: 'card-3', left: 160, top: 150, right: 230, bottom: 250 }   // 第三张牌，与第二张部分重叠
    ];

    // 模拟容器
    const containerRect = { left: 50, top: 100, right: 850, bottom: 400 };
    const scrollTop = 0;

    // 选中第一张牌的选框
    const selectionBox1 = {
        offsetLeft: 105,  // 相对于容器的左边距
        offsetTop: 105,   // 相对于容器的上边距
        style: { width: '60px', height: '140px' } // 60x140px的选框
    };

    const results1 = cards.filter(card => {
        const cardRect = { left: card.left, top: card.top, right: card.right, bottom: card.bottom };
        return checkCardIntersection(cardRect, containerRect, scrollTop, selectionBox1);
    });

    console.log(`选中区域(105,105,165,245) - 选中了 ${results1.length} 张牌: [${results1.map(c => c.id).join(', ')}]`);
    console.log(`预期至少选中第1张牌: ${results1.some(c => c.id === 'card-1') ? 'PASS' : 'FAIL'}`);

    console.log("\n=== 测试2: 边缘精确对齐选中 ===");
    // 创建一个选框，其右边与第二张牌的左边精确对齐
    const selectionBox2 = {
        offsetLeft: 100,  // 选框左边
        offsetTop: 105,
        style: { width: '60px', height: '140px' }  // 选框右边是160，与card-2的左边160对齐
    };

    const results2 = cards.filter(card => {
        const cardRect = { left: card.left, top: card.top, right: card.right, bottom: card.bottom };
        return checkCardIntersection(cardRect, containerRect, scrollTop, selectionBox2);
    });

    console.log(`边缘对齐选中区域(100,105,160,245) - 选中了 ${results2.length} 张牌: [${results2.map(c => c.id).join(', ')}]`);
    console.log(`预期选中第1、2张牌(因容差): ${['card-1', 'card-2'].every(id => results2.some(c => c.id === id)) ? 'PASS' : 'FAIL'}`);

    console.log("\n=== 测试3: 大范围选中测试 ===");
    // 创建一个大选框，试图选中所有牌
    const selectionBox3 = {
        offsetLeft: 80,
        offsetTop: 80,
        style: { width: '180px', height: '200px' }
    };

    const results3 = cards.filter(card => {
        const cardRect = { left: card.left, top: card.top, right: card.right, bottom: card.bottom };
        return checkCardIntersection(cardRect, containerRect, scrollTop, selectionBox3);
    });

    console.log(`大范围选中区域(80,80,260,280) - 选中了 ${results3.length} 张牌: [${results3.map(c => c.id).join(', ')}]`);
    console.log(`预期选中全部3张牌: ${results3.length === 3 ? 'PASS' : 'FAIL'}`);

    console.log("\n=== 测试4: 无接触选中测试 ===");
    // 创建一个远距离的选框
    const selectionBox4 = {
        offsetLeft: 500,
        offsetTop: 500,
        style: { width: '50px', height: '50px' }
    };

    const results4 = cards.filter(card => {
        const cardRect = { left: card.left, top: card.top, right: card.right, bottom: card.bottom };
        return checkCardIntersection(cardRect, containerRect, scrollTop, selectionBox4);
    });

    console.log(`无接触区域(500,500,550,550) - 选中了 ${results4.length} 张牌: [${results4.map(c => c.id).join(', ')}]`);
    console.log(`预期选中0张牌: ${results4.length === 0 ? 'PASS' : 'FAIL'}`);

    console.log("\n=== 测试5: 像素级精确选中测试 ===");
    // 测试在像素级别精确的选中
    const preciseCard = { id: 'precise-card', left: 300.5, top: 200.3, right: 370.8, bottom: 300.9 };
    const preciseCards = [preciseCard];

    // 一个精确匹配的选框
    const selectionBox5 = {
        offsetLeft: 299,
        offsetTop: 199,
        style: { width: '75px', height: '105px' }
    };

    const results5 = preciseCards.filter(card => {
        const cardRect = { left: card.left, top: card.top, right: card.right, bottom: card.bottom };
        return checkCardIntersection(cardRect, containerRect, scrollTop, selectionBox5);
    });

    console.log(`像素级选中区域(299,199,374,304) - 选中了 ${results5.length} 张牌: [${results5.map(c => c.id).join(', ')}]`);
    console.log(`预期选中精确卡片: ${results5.length === 1 ? 'PASS' : 'FAIL'}`);

    console.log("\n=== 测试6: 滚动容器测试 ===");
    // 模拟一个向下滚动了50px的容器
    const scrolledScrollTop = 50;

    // 保持相同的牌位置，但使用滚动后的坐标系统
    const results6 = cards.filter(card => {
        const cardRect = { left: card.left, top: card.top, right: card.right, bottom: card.bottom };
        return checkCardIntersection(cardRect, containerRect, scrolledScrollTop, selectionBox3);
    });

    console.log(`滚动容器(50px)大范围选中 - 选中了 ${results6.length} 张牌: [${results6.map(c => c.id).join(', ')}]`);
    console.log(`滚动后仍选中全部3张牌: ${results6.length === 3 ? 'PASS' : 'FAIL'}`);

    console.log("\n=== 总结 ===");
    console.log("所有真实场景测试完成，验证了拖拽选牌的各项边界条件处理");
}

// 运行真实场景测试
simulateRealDragSelection();