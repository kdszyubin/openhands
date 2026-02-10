/**
 * 缩放处理验证测试
 * 验证页面缩放情况下拖拽选牌的准确性
 */

function testScalingHandling() {
    console.log("开始缩放处理验证测试...\n");

    // 模拟页面缩放检测逻辑
    function calculateEffectiveScale() {
        // 模拟计算缩放因子的方法
        const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const scale = window.innerWidth && document.documentElement.clientWidth ? 
                     viewportWidth / document.documentElement.clientWidth : 1;
        // 限制缩放范围合理值
        return Math.min(Math.max(scale, 0.5), 2);
    }

    console.log("=== 测试1: 不同缩放级别下的容差计算 ===");

    // 仿真不同缩放级别
    const zoomLevels = [
        { name: "正常 (100%)", zoom: 1.0, clientWidth: 1024, innerWidth: 1024 },
        { name: "放大 (125%)", zoom: 1.25, clientWidth: 819, innerWidth: 1024 }, // 1024/0.8 = 1280, 显示819
        { name: "放大 (150%)", zoom: 1.5, clientWidth: 683, innerWidth: 1024 },  // 1024/(2/3) ≈ 1536, 显示683
        { name: "缩小 (75%)", zoom: 0.75, clientWidth: 1365, innerWidth: 1024 }, // 1024/1.33 ≈ 768, 显示1365
        { name: "缩小 (50%)", zoom: 0.5, clientWidth: 2048, innerWidth: 1024 }   // 1024*2 = 2048
    ];

    zoomLevels.forEach(level => {
        // 模拟计算
        const computedScale = level.innerWidth / level.clientWidth;
        const effectiveScale = Math.min(Math.max(computedScale, 0.5), 2);
        const baseTolerance = 2;
        const adaptiveTolerance = Math.max(1, Math.round(baseTolerance / effectiveScale));

        console.log(`${level.name} (计算缩放: ${computedScale.toFixed(2)}) -> 有效缩放: ${effectiveScale.toFixed(2)}, 自适应容差: ${adaptiveTolerance}px`);
    });

    console.log("\n=== 测试2: 坐标转换准确性 ===");

    // 模拟坐标转换
    function convertCoordinates(rect, containerRect, scrollTop, scale) {
        return {
            cardTop: rect.top - containerRect.top + scrollTop/scale,
            cardLeft: rect.left - containerRect.left,
            cardRight: rect.right - containerRect.left,
            cardBottom: rect.bottom - containerRect.top + scrollTop/scale
        };
    }

    const testScenarios = [
        {
            name: "桌面正常",
            rect: { top: 150, left: 100, right: 170, bottom: 250 },
            container: { top: 100, left: 50 },
            scrollTop: 0,
            scale: 1.0
        },
        {
            name: "缩放页面",
            rect: { top: 112.5, left: 75, right: 127.5, bottom: 187.5 }, // 1.33x缩放后
            container: { top: 75, left: 37.5 },
            scrollTop: 0,
            scale: 1.33
        },
        {
            name: "高DPI屏",
            rect: { top: 300, left: 200, right: 340, bottom: 500 }, // 2x像素比
            container: { top: 200, left: 100 },
            scrollTop: 50,
            scale: 1.0
        }
    ];

    testScenarios.forEach(scenario => {
        const converted = convertCoordinates(
            scenario.rect,
            scenario.container,
            scenario.scrollTop,
            scenario.scale
        );

        console.log(`${scenario.name}:`);
        console.log(`  原始: T=${scenario.rect.top}, L=${scenario.rect.left}, R=${scenario.rect.right}, B=${scenario.rect.bottom}`);
        console.log(`  转换后: T=${converted.cardTop.toFixed(2)}, L=${converted.cardLeft.toFixed(2)}, R=${converted.cardRight.toFixed(2)}, B=${converted.cardBottom.toFixed(2)}`);
    });

    console.log("\n=== 测试3: 多设备兼容性模拟 ===");

    // 模拟完整的检测逻辑
    function simulateSelectionCheck(cardRect, containerRect, scrollTop, selectionBox, windowInfo) {
        const { clientWidth, innerWidth } = windowInfo;
        const computedScale = innerWidth && clientWidth ? innerWidth / clientWidth : 1;
        const effectiveScale = Math.min(Math.max(computedScale, 0.5), 2);

        const cardTop = cardRect.top - containerRect.top + scrollTop/effectiveScale;
        const cardLeft = cardRect.left - containerRect.left;
        const cardRight = cardRect.right - containerRect.left;
        const cardBottom = cardRect.bottom - containerRect.top + scrollTop/effectiveScale;

        const selectionLeft = selectionBox.offsetLeft;
        const selectionTop = selectionBox.offsetTop;
        const selectionRight = selectionLeft + parseInt(selectionBox.style.width);
        const selectionBottom = selectionTop + parseInt(selectionBox.style.height);

        const baseTolerance = 2;
        const adaptiveTolerance = Math.max(1, Math.round(baseTolerance / effectiveScale));

        const intersects = 
            cardLeft < selectionRight + adaptiveTolerance &&
            cardRight > selectionLeft - adaptiveTolerance &&
            cardTop < selectionBottom + adaptiveTolerance &&
            cardBottom > selectionTop - adaptiveTolerance;

        return {
            intersects,
            details: {
                effectiveScale,
                tolerance: adaptiveTolerance,
                card: { top: cardTop, left: cardLeft, right: cardRight, bottom: cardBottom },
                selection: { left: selectionLeft, top: selectionTop, right: selectionRight, bottom: selectionBottom }
            }
        };
    }

    const deviceSimulations = [
        { name: "普通笔记本", clientWidth: 1440, innerWidth: 1440 },
        { name: "放大浏览器50%", clientWidth: 1440, innerWidth: 2160 },
        { name: "MacBook Pro (Retina)", clientWidth: 1440, innerWidth: 1440 },
        { name: "手机竖屏", clientWidth: 375, innerWidth: 375 },
        { name: "平板横屏", clientWidth: 1024, innerWidth: 1024 }
    ];

    deviceSimulations.forEach(device => {
        const card = { top: 150, left: 100, right: 170, bottom: 250 };
        const container = { top: 100, left: 50 };
        const selection = { offsetLeft: 105, offsetTop: 155, style: { width: '60px', height: '90px' } };

        const result = simulateSelectionCheck(card, container, 0, selection, device);
        console.log(`${device.name} (缩放: ${(device.innerWidth/device.clientWidth).toFixed(2)}) - 相交: ${result.intersects}, 容差: ${result.details.tolerance}px`);
    });

    console.log("\n缩放处理验证测试完成！");
}

function testWithRealisticScenario() {
    console.log("\n=== 现实场景测试 ===");
    
    // 模拟一个现实场景：用户在不同设备上拖拽选牌
    const realisticTests = [
        {
            name: "MacBook Safari 100%",
            device: { clientWidth: 1440, innerWidth: 1440 },
            action: "短距离精确选择单张牌"
        },
        {
            name: "MacBook Safari 125%", 
            device: { clientWidth: 1152, innerWidth: 1440 }, // 1440/1.25
            action: "放大后选择相邻两张牌"
        },
        {
            name: "iPhone Safari",
            device: { clientWidth: 375, innerWidth: 375 },
            action: "触摸屏选择多张牌"
        },
        {
            name: "Windows Chrome 90%",
            device: { clientWidth: 1600, innerWidth: 1440 }, // 1440/0.9
            action: "缩小后进行长距离拖拽"
        }
    ];

    realisticTests.forEach(test => {
        console.log(`${test.name} - ${test.action}`);
        
        // 模拟缩放计算
        const scale = test.device.innerWidth / test.device.clientWidth;
        const effectiveScale = Math.min(Math.max(scale, 0.5), 2);
        
        // 模拟容差调整
        const baseTolerance = 2;
        const adaptiveTolerance = Math.max(1, Math.round(baseTolerance / effectiveScale));
        
        console.log(`  - 计算缩放: ${scale.toFixed(2)}, 有效缩放: ${effectiveScale.toFixed(2)}`);
        console.log(`  - 自适应容差: ${adaptiveTolerance}px`);
        console.log(`  - 选择精确度: ${adaptiveTolerance <= 2 ? '高' : adaptiveTolerance <= 4 ? '中' : '低'}`);
        console.log("");
    });
}

// 运行所有测试
testScalingHandling();
testWithRealisticScenario();

console.log("\n=== 建议的优化措施 ===");
console.log(`
1. 监听zoom和resize事件，动态调整计算参数
2. 为触摸设备使用更大的默认容差值
3. 保存用户偏好设置，记住他们喜欢的精确度水平
4. 在UI上提供视觉反馈，让用户知道选中的精确程度
`);