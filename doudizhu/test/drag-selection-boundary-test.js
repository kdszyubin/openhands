/**
 * 拖拽选牌边界值测试
 * 验证框选准确性及边界值处理
 */

// 测试卡片相交检测函数
function testCardIntersection() {
    console.log("开始测试卡片相交检测...");

    /**
     * 检测两个矩形是否相交
     * @param {number} cardLeft - 卡片左边界
     * @param {number} cardTop - 卡片上边界
     * @param {number} cardRight - 卡片右边界
     * @param {number} cardBottom - 卡片下边界
     * @param {number} selectionLeft - 选框左边界
     * @param {number} selectionTop - 选框上边界
     * @param {number} selectionRight - 选框右边界
     * @param {number} selectionBottom - 选框下边界
     * @returns {boolean} 是否相交
     */
    function isCardIntersectingSelection(
        cardLeft, cardTop, cardRight, cardBottom,
        selectionLeft, selectionTop, selectionRight, selectionBottom
    ) {
        return (
            cardLeft < selectionRight &&
            cardRight > selectionLeft &&
            cardTop < selectionBottom &&
            cardBottom > selectionTop
        );
    }

    // 测试用例1: 完全包含的情况
    let result = isCardIntersectingSelection(
        10, 10, 30, 40,  // 卡片: 左10, 上10, 右30, 下40
        5, 5, 35, 45    // 选框: 左5, 上5, 右35, 下45
    );
    console.log(`测试1 - 卡片完全包含在选框内: ${result ? 'PASS' : 'FAIL'}`);

    // 测试用例2: 卡片完全在选框之外（右侧）
    result = isCardIntersectingSelection(
        50, 10, 70, 40,  // 卡片在右侧
        5, 5, 35, 45    // 选框
    );
    console.log(`测试2 - 卡片在选框右侧: ${!result ? 'PASS' : 'FAIL'}`);

    // 测试用例3: 卡片完全在选框之外（左侧）
    result = isCardIntersectingSelection(
        0, 10, 4, 40,    // 卡片在左侧
        5, 5, 35, 45    // 选框
    );
    console.log(`测试3 - 卡片在选框左侧: ${!result ? 'PASS' : 'FAIL'}`);

    // 测试用例4: 卡片完全在选框之外（下方）
    result = isCardIntersectingSelection(
        10, 50, 30, 80,  // 卡片在下方
        5, 5, 35, 45    // 选框
    );
    console.log(`测试4 - 卡片在选框下方: ${!result ? 'PASS' : 'FAIL'}`);

    // 测试用例5: 卡片完全在选框之外（上方）
    result = isCardIntersectingSelection(
        10, 0, 30, 4,    // 卡片在上方
        5, 5, 35, 45    // 选框
    );
    console.log(`测试5 - 卡片在选框上方: ${!result ? 'PASS' : 'FAIL'}`);

    // 测试用例6: 部分相交（右下角）
    result = isCardIntersectingSelection(
        32, 32, 60, 70,  // 卡片右下角
        5, 5, 35, 45    // 选框
    );
    console.log(`测试6 - 卡片与选框部分相交(右下角): ${result ? 'PASS' : 'FAIL'}`);

    // 测试用例7: 部分相交（左上角）
    result = isCardIntersectingSelection(
        0, 0, 15, 15,    // 卡片左上角
        5, 5, 35, 45    // 选框
    );
    console.log(`测试7 - 卡片与选框部分相交(左上角): ${result ? 'PASS' : 'FAIL'}`);

    // 测试用例8: 边缘接触（在标准矩形相交算法中不算相交）
    result = isCardIntersectingSelection(
        35, 20, 55, 40,  // 卡片左边界与选框右边界重合
        5, 5, 35, 45    // 选框
    );
    console.log(`测试8 - 卡片与选框边缘接触(标准算法): ${!result ? 'PASS (符合标准算法)' : 'FAIL'}`);
    
    // 补充测试用例8a: 微小重叠
    result = isCardIntersectingSelection(
        34.9, 20, 55, 40,  // 卡片左边界略微进入选框
        5, 5, 35, 45    // 选框
    );
    console.log(`测试8a - 卡片与选框微小重叠: ${result ? 'PASS' : 'FAIL'}`);

    // 测试用例9: 像素级别的精确边界测试
    result = isCardIntersectingSelection(
        10.5, 10.5, 11.5, 11.5,  // 很小的卡片
        11, 11, 12, 12            // 很小的选框
    );
    console.log(`测试9 - 像素级别的边界测试: ${result ? 'PASS' : 'FAIL'}`);

    // 测试用例10: 临界点测试 - 恰好不接触
    result = isCardIntersectingSelection(
        36, 20, 55, 40,  // 卡片在选框右边界的紧邻位置
        5, 5, 35, 45    // 选框
    );
    console.log(`测试10 - 临界点测试(恰好不接触): ${!result ? 'PASS' : 'FAIL'}`);

    console.log("卡片相交检测测试完成！");
}

// 测试坐标转换函数
function testCoordinateConversion() {
    console.log("\n开始测试坐标转换...");

    /**
     * 将客户端坐标转换为相对容器坐标
     * @param {number} clientX - 客户端X坐标
     * @param {number} clientY - 客户端Y坐标
     * @param {ClientRect} containerRect - 容器的边界矩形
     * @param {number} scrollTop - 容器滚动位置
     * @returns {{x: number, y: number}} 相对容器坐标
     */
    function convertToContainerCoords(clientX, clientY, containerRect, scrollTop = 0) {
        return {
            x: clientX - containerRect.left,
            y: clientY - containerRect.top + scrollTop
        };
    }

    // 模拟容器位置
    const mockContainerRect = {
        left: 100,
        top: 150,
        right: 900,
        bottom: 300,
        width: 800,
        height: 150
    };

    // 测试用例1: 正常坐标转换
    let coords = convertToContainerCoords(150, 200, mockContainerRect);
    console.log(`测试1 - 正常坐标转换: 客户端(150,200) -> 容器(${coords.x},${coords.y}) 应为(50,50): ${coords.x === 50 && coords.y === 50 ? 'PASS' : 'FAIL'}`);

    // 测试用例2: 带滚动的坐标转换
    coords = convertToContainerCoords(120, 160, mockContainerRect, 30);
    console.log(`测试2 - 带滚动坐标转换: 客户端(120,160)滚动30 -> 容器(${coords.x},${coords.y}) 应为(20,40): ${coords.x === 20 && coords.y === 40 ? 'PASS' : 'FAIL'}`);

    // 测试用例3: 边界坐标转换
    coords = convertToContainerCoords(100, 150, mockContainerRect);  // 应该在容器左上角
    console.log(`测试3 - 边界坐标转换(左上角): 容器(${coords.x},${coords.y}) 应为(0,0): ${coords.x === 0 && coords.y === 0 ? 'PASS' : 'FAIL'}`);

    // 测试用例4: 容器外边界坐标转换
    coords = convertToContainerCoords(900, 300, mockContainerRect);  // 应该在容器右下角
    console.log(`测试4 - 边界坐标转换(右下角): 容器(${coords.x},${coords.y}) 应为(800,150): ${coords.x === 800 && coords.y === 150 ? 'PASS' : 'FAIL'}`);

    console.log("坐标转换测试完成！");
}

// 测试选框大小和位置计算
function testSelectionBoxCalculation() {
    console.log("\n开始测试选框大小和位置计算...");

    /**
     * 计算选框的位置和尺寸
     * @param {number} startX - 起始X坐标（相对于容器）
     * @param {number} startY - 起始Y坐标（相对于容器）
     * @param {number} currentX - 当前X坐标（相对于容器）
     * @param {number} currentY - 当前Y坐标（相对于容器）
     * @returns {{left: number, top: number, width: number, height: number}} 选框属性
     */
    function calculateSelectionBox(startX, startY, currentX, currentY) {
        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        return { left, top, width, height };
    }

    // 测试用例1: 正向拖拽（从左上到右下）
    let box = calculateSelectionBox(10, 10, 50, 40);
    console.log(`测试1 - 正向拖拽: 左${box.left}(10), 上${box.top}(10), 宽${box.width}(40), 高${box.height}(30): ${box.left === 10 && box.top === 10 && box.width === 40 && box.height === 30 ? 'PASS' : 'FAIL'}`);

    // 测试用例2: 反向拖拽（从右下到左上）
    box = calculateSelectionBox(50, 40, 10, 10);
    console.log(`测试2 - 反向拖拽: 左${box.left}(10), 上${box.top}(10), 宽${box.width}(40), 高${box.height}(30): ${box.left === 10 && box.top === 10 && box.width === 40 && box.height === 30 ? 'PASS' : 'FAIL'}`);

    // 测试用例3: 水平拖拽
    box = calculateSelectionBox(20, 30, 80, 30);
    console.log(`测试3 - 水平拖拽: 左${box.left}(20), 上${box.top}(30), 宽${box.width}(60), 高${box.height}(0): ${box.left === 20 && box.top === 30 && box.width === 60 && box.height === 0 ? 'PASS' : 'FAIL'}`);

    // 测试用例4: 垂直拖拽
    box = calculateSelectionBox(25, 10, 25, 60);
    console.log(`测试4 - 垂直拖拽: 左${box.left}(25), 上${box.top}(10), 宽${box.width}(0), 高${box.height}(50): ${box.left === 25 && box.top === 10 && box.width === 0 && box.height === 50 ? 'PASS' : 'FAIL'}`);

    // 测试用例5: 极小范围拖拽
    box = calculateSelectionBox(100.5, 100.3, 101.2, 100.9);
    console.log(`测试5 - 像素级拖拽: 宽${box.width}(~0.7), 高${box.height}(~0.6) (近似值检查)`);
    const widthOk = Math.abs(box.width - 0.7) < 0.01;
    const heightOk = Math.abs(box.height - 0.6) < 0.01;
    console.log(`      宽度和高度精度检查: ${widthOk && heightOk ? 'PASS' : 'FAIL'}`);

    // 测试用例6: 负值范围拖拽（实际上不应该出现，但算法应能处理）
    box = calculateSelectionBox(30, 40, 10, 20);
    console.log(`测试6 - 跨越起点拖拽: 左${box.left}(10), 上${box.top}(20), 宽${box.width}(20), 高${box.height}(20): ${box.left === 10 && box.top === 20 && box.width === 20 && box.height === 20 ? 'PASS' : 'FAIL'}`);

    console.log("选框计算测试完成！");
}

// 主测试函数
function runAllTests() {
    console.log("开始运行拖拽选牌边界值测试...\n");

    testCardIntersection();
    testCoordinateConversion();
    testSelectionBoxCalculation();

    console.log("\n所有测试完成！");
}

// 运行测试
runAllTests();