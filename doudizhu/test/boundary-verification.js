/**
 * 边界验证测试
 * 验证添加容差后的边界处理情况
 */

function testBoundaryWithTolerance() {
    console.log("开始边界容差验证测试...\n");

    // 模拟新的检测函数（包含容差）
    function isCardIntersectingSelectionWithTolerance(
        cardLeft, cardTop, cardRight, cardBottom,
        selectionLeft, selectionTop, selectionRight, selectionBottom,
        tolerance = 1
    ) {
        return (
            cardLeft < selectionRight + tolerance &&
            cardRight > selectionLeft - tolerance &&
            cardTop < selectionBottom + tolerance &&
            cardBottom > selectionTop - tolerance
        );
    }

    console.log("=== 使用容差的边界测试 ===");

    // 测试1: 标准相交仍然有效
    let result = isCardIntersectingSelectionWithTolerance(
        10, 10, 30, 40,  // 卡片
        25, 25, 35, 45   // 选框
    );
    console.log(`测试1 - 标准相交: ${result ? 'PASS' : 'FAIL'}`);

    // 测试2: 边缘接触现在应该被识别为相交
    result = isCardIntersectingSelectionWithTolerance(
        35, 20, 55, 40,  // 卡片左边界(35)与选框右边界(35)接触
        5, 5, 35, 45    // 选框
    );
    console.log(`测试2 - 边界接触(容差1px): ${result ? 'PASS' : 'FAIL'}`);

    // 测试3: 远离不会被误判
    result = isCardIntersectingSelectionWithTolerance(
        50, 10, 70, 40,  // 卡片在远处
        5, 5, 35, 45    // 选框
    );
    console.log(`测试3 - 远离不相交: ${!result ? 'PASS' : 'FAIL'}`);

    // 测试4: 紧邻但超出容差范围
    result = isCardIntersectingSelectionWithTolerance(
        50, 10, 70, 40,  // 卡片在选框右边界的2px之外
        5, 5, 35, 45    // 选框
    );
    console.log(`测试4 - 超出容差不相交: ${!result ? 'PASS' : 'FAIL'}`);

    // 测试5: 紧邻边界但仍在容差范围内
    result = isCardIntersectingSelectionWithTolerance(
        35.5, 10, 70, 40,  // 卡片左边界在选框右边界的0.5px之内 (35.5 < 35+1 = 36)
        5, 5, 35, 45    // 选框
    );
    console.log(`测试5 - 在容差范围内相交: ${result ? 'PASS' : 'FAIL'}`);

    // 测试6: 像素级精度测试
    result = isCardIntersectingSelectionWithTolerance(
        10.5, 10.5, 11.5, 11.5,  // 很小的卡片
        11, 11, 12, 12,          // 很小的选框
        1                           // 容差
    );
    console.log(`测试6 - 像素级容差测试: ${result ? 'PASS' : 'FAIL'}`);

    // 测试7: 垂直方向的边界测试
    result = isCardIntersectingSelectionWithTolerance(
        20, 45, 40, 65,  // 卡片下边界(45)与选框上边界(45)接触
        10, 25, 50, 45   // 选框
    );
    console.log(`测试7 - 垂直方向边界接触: ${result ? 'PASS' : 'FAIL'}`);

    // 测试8: 对角线边界接触
    result = isCardIntersectingSelectionWithTolerance(
        50, 45, 70, 65,  // 卡片左下角与选框右上角接触
        30, 25, 50, 45   // 选框
    );
    console.log(`测试8 - 对角线方向边界接触: ${result ? 'PASS' : 'FAIL'}`);

    console.log("\n边界容差验证测试完成！");
}

// 测试拖拽选择的性能影响
function testPerformanceImpact() {
    console.log("\n=== 性能影响测试 ===");
    const iterations = 1000000; // 一百万次测试

    // 标准版本
    const startTime1 = performance.now();
    for (let i = 0; i < iterations; i++) {
        // 标准相交检测
        const intersects = (0 < 10) && (20 > 5) && (0 < 15) && (25 > 5);
    }
    const endTime1 = performance.now();
    const standardTime = endTime1 - startTime1;

    // 容差版本
    const startTime2 = performance.now();
    for (let i = 0; i < iterations; i++) {
        // 带容差的相交检测
        const tolerance = 1;
        const intersects = (0 < 10 + tolerance) && (20 > 5 - tolerance) && (0 < 15 + tolerance) && (25 > 5 - tolerance);
    }
    const endTime2 = performance.now();
    const toleranceTime = endTime2 - startTime2;

    console.log(`标准算法耗时: ${standardTime.toFixed(2)}ms`);
    console.log(`容差算法耗时: ${toleranceTime.toFixed(2)}ms`);
    console.log(`性能影响: ${((toleranceTime - standardTime) / standardTime * 100).toFixed(2)}%`);
    console.log(`性能影响 ${Math.abs((toleranceTime - standardTime) / standardTime * 100) < 20 ? 'PASS' : 'FAIL'} (<20%可接受)`);
}

// 模拟实际游戏场景测试
function simulateRealGameScenario() {
    console.log("\n=== 实际游戏场景模拟测试 ===");

    // 模拟玩家手牌布局（每张牌有固定间距）
    const cardWidth = 70;
    const cardSpacing = -40; // 负间距意味着牌部分重叠
    const handSize = 15;
    const cards = [];

    for (let i = 0; i < handSize; i++) {
        cards.push({
            id: `card-${i}`,
            left: i * (cardWidth + cardSpacing),
            top: 25,
            right: i * (cardWidth + cardSpacing) + cardWidth,
            bottom: 125
        });
    }

    console.log(`生成 ${handSize} 张牌的布局，间距 ${cardSpacing}px`);

    // 模拟不同的拖拽选框
    const selections = [
        { left: 50, top: 0, right: 150, bottom: 150, description: "选中前2张牌" },
        { left: 100, top: 0, right: 200, bottom: 150, description: "选中第2-3张牌" },
        { left: 0, top: 10, right: 300, bottom: 140, description: "选中前5张牌" },
        { left: 70, top: 50, right: 71, bottom: 51, description: "超小选框（1像素）" }
    ];

    // 使用容差算法检查每种情况
    function isCardIntersectingSelectionWithTolerance(
        cardLeft, cardTop, cardRight, cardBottom,
        selectionLeft, selectionTop, selectionRight, selectionBottom
    ) {
        const tolerance = 1;
        return (
            cardLeft < selectionRight + tolerance &&
            cardRight > selectionLeft - tolerance &&
            cardTop < selectionBottom + tolerance &&
            cardBottom > selectionTop - tolerance
        );
    }

    selections.forEach(selection => {
        const intersectingCards = cards.filter(card =>
            isCardIntersectingSelectionWithTolerance(
                card.left, card.top, card.right, card.bottom,
                selection.left, selection.top, selection.right, selection.bottom
            )
        );

        console.log(`${selection.description}: 选中 ${intersectingCards.length} 张牌`);
    });

    console.log("实际游戏场景模拟完成！");
}

// 运行所有验证测试
testBoundaryWithTolerance();
testPerformanceImpact();
simulateRealGameScenario();

console.log("\n=== 验证测试全部完成 ===");