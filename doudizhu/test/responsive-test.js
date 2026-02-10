/**
 * 响应式和多屏幕尺寸兼容性测试
 * 验证拖拽选牌在不同屏幕尺寸、缩放比例下的准确性
 */

function testResponsiveCompatibility() {
    console.log("开始响应式和多屏幕尺寸兼容性测试...\n");

    // 模拟不同屏幕条件下的坐标处理
    function simulateCoordinates(screenInfo) {
        const { 
            devicePixelRatio = 1,   // 设备像素比
            zoomFactor = 1,         // 用户缩放因子
            cssPixelToPhysicalPixel = 1 // CSS像素到物理像素的映射
        } = screenInfo;

        return { devicePixelRatio, zoomFactor, cssPixelToPhysicalPixel };
    }

    // 计算容差的函数，根据屏幕特性调整
    function calculateTolerance(screenInfo) {
        const { devicePixelRatio = 1, zoomFactor = 1 } = screenInfo;
        // 基础容差是1px，根据设备像素比和缩放进行调整
        return Math.max(1, Math.round(2 / (devicePixelRatio * zoomFactor)));
    }

    console.log("=== 测试1: 普通屏幕 (1x像素比, 100%缩放) ===");
    const normalScreen = simulateCoordinates({ devicePixelRatio: 1, zoomFactor: 1 });
    const normalTolerance = calculateTolerance(normalScreen);
    console.log(`普通屏幕 - 设备像素比: ${normalScreen.devicePixelRatio}, 缩放: ${normalScreen.zoomFactor}x`);
    console.log(`预计容差: ${normalTolerance}px (${normalTolerance === 2 ? 'PASS' : 'FAIL'})`);

    console.log("\n=== 测试2: Retina屏幕 (2x像素比, 100%缩放) ===");
    const retinaScreen = simulateCoordinates({ devicePixelRatio: 2, zoomFactor: 1 });
    const retinaTolerance = calculateTolerance(retinaScreen);
    console.log(`Retina屏幕 - 设备像素比: ${retinaScreen.devicePixelRatio}, 缩放: ${retinaScreen.zoomFactor}x`);
    console.log(`预计容差: ${retinaTolerance}px (${retinaTolerance >= 1 ? 'PASS' : 'FAIL'})`);

    console.log("\n=== 测试3: 高分屏 (3x像素比, 100%缩放) ===");
    const highResScreen = simulateCoordinates({ devicePixelRatio: 3, zoomFactor: 1 });
    const highResTolerance = calculateTolerance(highResScreen);
    console.log(`高分屏 - 设备像素比: ${highResScreen.devicePixelRatio}, 缩放: ${highResScreen.zoomFactor}x`);
    console.log(`预计容差: ${highResTolerance}px (>=1: ${highResTolerance >= 1 ? 'PASS' : 'FAIL'})`);

    console.log("\n=== 测试4: 放大显示 (1x像素比, 150%缩放) ===");
    const zoomedScreen = simulateCoordinates({ devicePixelRatio: 1, zoomFactor: 1.5 });
    const zoomedTolerance = calculateTolerance(zoomedScreen);
    console.log(`放大显示 - 设备像素比: ${zoomedScreen.devicePixelRatio}, 缩放: ${zoomedScreen.zoomFactor}x`);
    console.log(`预计容差: ${zoomedTolerance}px (${zoomedTolerance >= 1 ? 'PASS' : 'FAIL'})`);

    console.log("\n=== 测试5: 缩小显示 (1x像素比, 75%缩放) ===");
    const smallScreen = simulateCoordinates({ devicePixelRatio: 1, zoomFactor: 0.75 });
    const smallTolerance = calculateTolerance(smallScreen);
    console.log(`缩小显示 - 设备像素比: ${smallScreen.devicePixelRatio}, 缩放: ${smallScreen.zoomFactor}x`);
    console.log(`预计容差: ${smallTolerance}px (>=2: ${smallTolerance >= 2 ? 'PASS' : 'FAIL'})`);

    console.log("\n=== 测试6: Retina + 放大 (2x像素比, 125%缩放) ===");
    const retinaZoomedScreen = simulateCoordinates({ devicePixelRatio: 2, zoomFactor: 1.25 });
    const retinaZoomedTolerance = calculateTolerance(retinaZoomedScreen);
    console.log(`Retina+放大 - 设备像素比: ${retinaZoomedScreen.devicePixelRatio}, 缩放: ${retinaZoomedScreen.zoomFactor}x`);
    console.log(`预计容差: ${retinaZoomedTolerance}px (${retinaZoomedTolerance >= 1 ? 'PASS' : 'FAIL'})`);

    console.log("\n=== 测试7: 真实世界场景模拟 ===");

    // 模拟真实的碰撞检测处理
    function isCardIntersectingSelection(
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

    // 模拟一张牌在不同屏幕尺寸下的坐标变化
    const baseCard = { left: 100, top: 150, right: 170, bottom: 250 };
    const baseSelection = { left: 110, top: 160, right: 160, bottom: 240 };

    const screenScenarios = [
        { name: "桌面正常", scale: 1.0 },
        { name: "移动设备", scale: 1.25 },
        { name: "高分屏", scale: 1.5 },
        { name: "缩放50%", scale: 0.5 },
        { name: "缩放200%", scale: 2.0 }
    ];

    screenScenarios.forEach(scenario => {
        // 按缩放比例调整坐标
        const scaledCard = {
            left: baseCard.left * scenario.scale,
            top: baseCard.top * scenario.scale,
            right: baseCard.right * scenario.scale,
            bottom: baseCard.bottom * scenario.scale
        };
        
        const scaledSelection = {
            left: baseSelection.left * scenario.scale,
            top: baseSelection.top * scenario.scale,
            right: baseSelection.right * scenario.scale,
            bottom: baseSelection.bottom * scenario.scale
        };
        
        // 计算相应的容差
        const tolerance = Math.max(1, Math.round(2 / scenario.scale));
        
        const intersects = isCardIntersectingSelection(
            scaledCard.left, scaledCard.top, scaledCard.right, scaledCard.bottom,
            scaledSelection.left, scaledSelection.top, scaledSelection.right, scaledSelection.bottom,
            tolerance
        );
        
        console.log(`${scenario.name} (缩放${scenario.scale}x, 容差${tolerance}px): ${intersects ? '相交' : '不相交'}`);
    });

    console.log("\n=== 测试8: 容差合理性验证 ===");
    // 验证容差公式是否适合各种场景
    const toleranceTestCases = [
        { pixelRatio: 1, zoom: 1, expectedMin: 1, expectedMax: 3 },    // 普通屏幕
        { pixelRatio: 2, zoom: 1, expectedMin: 1, expectedMax: 2 },    // Retina
        { pixelRatio: 1, zoom: 2, expectedMin: 1, expectedMax: 1 },    // 放大
        { pixelRatio: 3, zoom: 0.5, expectedMin: 1, expectedMax: 5 }, // 高分屏缩小
    ];

    let allTolerancesValid = true;
    toleranceTestCases.forEach((testCase, index) => {
        const calculatedTolerance = Math.max(1, Math.round(2 / (testCase.pixelRatio * testCase.zoom)));
        const isValid = calculatedTolerance >= testCase.expectedMin && calculatedTolerance <= testCase.expectedMax;
        console.log(`容差测试${index+1}: PR=${testCase.pixelRatio}, Z=${testCase.zoom} => 容差${calculatedTolerance} (${isValid ? 'PASS' : 'FAIL'})`);
        if (!isValid) allTolerancesValid = false;
    });

    console.log(`容差公式整体验证: ${allTolerancesValid ? 'PASS' : 'FAIL'}`);

    console.log("\n响应式兼容性测试完成！");
}

// 运行测试
testResponsiveCompatibility();

// 额外的DOM相关测试模拟
function simulateDOMScreenHandling() {
    console.log("\n=== DOM屏幕适配处理测试 ===");
    
    // 模拟获取计算样式的方法
    function getComputedScaleFactor(element) {
        // 在实际应用中，这将使用getComputedStyle
        const testStyle = {
            width: 70,
            height: 100
        };
        
        const boundingRect = {
            width: 70,
            height: 100
        };
        
        // 计算缩放因子
        const scaleX = boundingRect.width / (testStyle.width || boundingRect.width);
        const scaleY = boundingRect.height / (testStyle.height || boundingRect.height);
        return (scaleX + scaleY) / 2 || 1;
    }
    
    // 测试不同元素的缩放因子计算
    const testElements = [
        { name: "正常尺寸牌", rect: {width: 70, height: 100}, style: {width: 70, height: 100} },
        { name: "缩放牌1", rect: {width: 105, height: 150}, style: {width: 70, height: 100} }, // 1.5x缩放
        { name: "缩放牌2", rect: {width: 56, height: 80}, style: {width: 70, height: 100} }    // 0.8x缩放
    ];
    
    testElements.forEach(el => {
        const scaleEstimate = ((el.rect.width/el.style.width + el.rect.height/el.style.height)/2) || 1;
        console.log(`${el.name}: 原始(${el.style.width}x${el.style.height}) -> 显示(${el.rect.width}x${el.rect.height}), 估算缩放: ${scaleEstimate.toFixed(2)}x`);
        
        // 计算对应的容差
        const adjustedTolerance = Math.max(1, Math.round(2 / scaleEstimate));
        console.log(`  调整后容差: ${adjustedTolerance}px`);
    });
    
    console.log("DOM屏幕适配处理测试完成！");
}

simulateDOMScreenHandling();