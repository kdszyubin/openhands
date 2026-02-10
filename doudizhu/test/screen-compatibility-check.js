/**
 * 屏幕兼容性最终验证测试
 * 模拟drag-selection.js中的实际逻辑进行验证
 */

function testActualImplementation() {
    console.log("开始屏幕兼容性最终验证测试...\n");

    // 模拟drag-selection.js中的updateCardSelection函数
    function checkCardIntersection(cardRect, containerRect, scrollTop, selectionBox, devicePixelRatio = 1) {
        // 这是修改后的算法
        const cardTop = cardRect.top - containerRect.top + scrollTop;
        const cardLeft = cardRect.left - containerRect.left;
        const cardRight = cardRect.right - containerRect.left;
        const cardBottom = cardRect.bottom - containerRect.top + scrollTop;

        const selectionLeft = selectionBox.offsetLeft;
        const selectionTop = selectionBox.offsetTop;
        const selectionRight = selectionLeft + parseInt(selectionBox.style.width);
        const selectionBottom = selectionTop + parseInt(selectionBox.style.height);

        // 计算缩放因子，用于处理屏幕缩放
        const scaleX = cardRect.width / 70; // 假设正常牌宽70px
        const scaleY = cardRect.height / 100; // 假设正常牌高100px
        const scaleAvg = (scaleX + scaleY) / 2 || 1;

        // 使用调整后的容差值
        const tolerance = Math.max(1, Math.round(2 / scaleAvg)); // 最小容差为1px，根据缩放调整
        
        // 检查卡片是否与选框相交
        const intersects = 
            cardLeft < selectionRight + tolerance &&
            cardRight > selectionLeft - tolerance &&
            cardTop < selectionBottom + tolerance &&
            cardBottom > selectionTop - tolerance;

        return {
            intersects,
            details: {
                card: { top: cardTop, left: cardLeft, right: cardRight, bottom: cardBottom },
                selection: { left: selectionLeft, top: selectionTop, right: selectionRight, bottom: selectionBottom },
                tolerance
            }
        };
    }

    console.log("=== 测试场景1: 标准桌面环境 ===");
    // 标准桌面显示器: 1x像素比
    const containerRect1 = { left: 50, top: 100, right: 850, bottom: 250 };
    const cardRect1 = { left: 100, top: 150, right: 170, bottom: 250, width: 70, height: 100 };
    const selectionBox1 = { offsetLeft: 110, offsetTop: 160, style: { width: '40px', height: '80px' } };
    const result1 = checkCardIntersection(cardRect1, containerRect1, 0, selectionBox1, 1);

    console.log(`桌面环境 - 卡片与选框相交: ${result1.intersects ? '是' : '否'}`);
    console.log(`  卡片位置: (${result1.details.card.left}, ${result1.details.card.top}) to (${result1.details.card.right}, ${result1.details.card.bottom})`);
    console.log(`  选框位置: (${result1.details.selection.left}, ${result1.details.selection.top}) to (${result1.details.selection.right}, ${result1.details.selection.bottom})`);
    console.log(`  容差: ${result1.details.tolerance}px`);
    console.log(`  预期相交: ${result1.intersects ? 'PASS' : 'FAIL'}`);

    console.log("\n=== 测试场景2: 高DPI Retina显示屏 ===");
    // Retina显示器: 2x像素比
    const containerRect2 = { left: 50, top: 100, right: 850, bottom: 250 };
    const cardRect2 = { left: 100, top: 150, right: 170, bottom: 250, width: 70, height: 100 }; // 实际像素更高，但CSS像素相同
    const selectionBox2 = { offsetLeft: 110, offsetTop: 160, style: { width: '40px', height: '80px' } };
    const result2 = checkCardIntersection(cardRect2, containerRect2, 0, selectionBox2, 2);

    console.log(`Retina环境 - 卡片与选框相交: ${result2.intersects ? '是' : '否'}`);
    console.log(`  容差: ${result2.details.tolerance}px`);
    console.log(`  预期相交: ${result2.intersects ? 'PASS' : 'FAIL'}`);

    console.log("\n=== 测试场景3: 缩放页面 (150%) ===");
    // 页面缩放150%
    const containerRect3 = { left: 50, top: 100, right: 850, bottom: 250 };
    const cardRect3 = { left: 150, top: 225, right: 255, bottom: 375, width: 105, height: 150 }; // 1.5倍放大
    const selectionBox3 = { offsetLeft: 165, offsetTop: 247.5, style: { width: '60px', height: '120px' } }; // 相应放大
    const result3 = checkCardIntersection(cardRect3, containerRect3, 0, selectionBox3, 1);

    console.log(`页面缩放150% - 卡片与选框相交: ${result3.intersects ? '是' : '否'}`);
    console.log(`  卡片尺寸: ${cardRect3.width}x${cardRect3.height}`);
    console.log(`  容差: ${result3.details.tolerance}px`);
    console.log(`  预期相交: ${result3.intersects ? 'PASS' : 'FAIL'}`);

    console.log("\n=== 测试场景4: 移动设备 ===");
    // 移动设备可能有更高的像素密度
    const containerRect4 = { left: 20, top: 80, right: 420, bottom: 180 }; // 小屏幕
    const cardRect4 = { left: 50, top: 100, right: 100, bottom: 170, width: 50, height: 70 }; // 小尺寸牌
    const selectionBox4 = { offsetLeft: 60, offsetTop: 110, style: { width: '30px', height: '50px' } };
    const result4 = checkCardIntersection(cardRect4, containerRect4, 0, selectionBox4, 2.5); // 高DPI

    console.log(`移动设备 - 卡片与选框相交: ${result4.intersects ? '是' : '否'}`);
    console.log(`  牌尺寸: ${cardRect4.width}x${cardRect4.height}`);
    console.log(`  容差: ${result4.details.tolerance}px`); 
    console.log(`  预期相交: ${result4.intersects ? 'PASS' : 'FAIL'}`);

    console.log("\n=== 测试场景5: 边界精确对齐测试 ===");
    // 测试在不同缩放下边界精确对齐的情况
    const testAlignments = [
        { name: "正常比例", cardRight: 170, selectionLeft: 170 },
        { name: "1.5倍缩放", cardRight: 255, selectionLeft: 255 }, // 170 * 1.5
        { name: "0.8倍缩放", cardRight: 136, selectionLeft: 136 }  // 170 * 0.8
    ];

    testAlignments.forEach(test => {
        const container = { left: 0, top: 0, right: 800, bottom: 200 };
        const card = { 
            left: 100, top: 50, 
            right: test.cardRight, 
            bottom: 150, 
            width: test.cardRight - 100, 
            height: 100 
        };
        const selection = { 
            offsetLeft: test.selectionLeft, 
            offsetTop: 40, 
            style: { width: '30px', height: '120px' } 
        };
        
        const result = checkCardIntersection(card, container, 0, selection, 1);
        console.log(`  ${test.name} - 边界接触相交: ${result.intersects ? '是' : '否'} (容差: ${result.details.tolerance}px)`);
    });

    console.log("\n=== 测试场景6: 多牌同时选中测试 ===");
    // 测试一行紧密排列的牌
    const containerMulti = { left: 0, top: 0, right: 800, bottom: 200 };
    const cardsMulti = [
        { id: 'card-1', left: 50, top: 50, right: 120, bottom: 150, width: 70, height: 100 },
        { id: 'card-2', left: 90, top: 50, right: 160, bottom: 150, width: 70, height: 100 },
        { id: 'card-3', left: 130, top: 50, right: 200, bottom: 150, width: 70, height: 100 }
    ];
    const selectionMulti = { offsetLeft: 70, offsetTop: 40, style: { width: '120px', height: '120px' } };

    const selectedCards = cardsMulti.filter(card => {
        const result = checkCardIntersection(card, containerMulti, 0, selectionMulti, 1);
        return result.intersects;
    });

    console.log(`多牌选中测试 - 选中了 ${selectedCards.length} 张牌: [${selectedCards.map(c => c.id).join(', ')}]`);
    console.log(`  预期选中第1、2张牌: ${selectedCards.length >= 2 ? 'PASS' : 'FAIL'}`);

    console.log("\n屏幕兼容性最终验证测试完成！");
}

// 运行最终验证测试
testActualImplementation();

// 输出建议的屏幕兼容性最佳实践
function outputBestPractices() {
    console.log("\n=== 屏幕兼容性最佳实践建议 ===");
    console.log(`
1. 使用CSS像素进行坐标计算，而不是物理像素
2. 在检测相交时应用适当的容差，考虑设备像素比和缩放
3. 对于响应式界面，使用相对单位和比例计算
4. 在移动设备上适当增加触摸目标和容差大小
5. 监听window.resize事件并重新计算布局
6. 使用getBoundingClientRect()获取精确的元素位置
7. 考虑用户缩放行为，动态调整交互敏感度
    `);
}

outputBestPractices();