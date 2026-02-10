/**
 * 拖拽选牌复杂场景测试
 * 验证实际游戏场景中的各种边界情况
 */

function runComplexTests() {
    console.log("开始运行拖拽选牌复杂场景测试...\n");

    // 测试场景1: 多张间距很小的牌的选中
    console.log("=== 测试场景1: 紧密排列的牌选中 ===");
    function testTightlyPackedCards() {
        // 模拟紧密排列的牌（间距很小）
        const cards = [
            { id: 'card-1', left: 0, top: 0, right: 70, bottom: 100 },
            { id: 'card-2', left: 65, top: 0, right: 135, bottom: 100 },  // 与上一张牌有5px重叠
            { id: 'card-3', left: 130, top: 0, right: 200, bottom: 100 }, // 与上一张牌有5px重叠
            { id: 'card-4', left: 195, top: 0, right: 265, bottom: 100 }  // 与上一张牌有5px重叠
        ];

        // 一个小的选框，应该只选中第一张牌
        const selection = { left: 5, top: 5, right: 60, bottom: 95 };
        
        const intersecting = cards.filter(card => 
            card.left < selection.right &&
            card.right > selection.left &&
            card.top < selection.bottom &&
            card.bottom > selection.top
        );

        console.log(`紧密排列测试 - 选框(5,5,60,95)选中 ${intersecting.length} 张牌: ${intersecting.map(c => c.id).join(', ')}`);
        console.log(`预期选中1-2张牌: ${intersecting.length >= 1 && intersecting.length <= 2 ? 'PASS' : 'FAIL'}`);
    }
    testTightlyPackedCards();

    // 测试场景2: 超小选框测试
    console.log("\n=== 测试场景2: 超小选框测试 ===");
    function testTinySelection() {
        const cards = [
            { id: 'card-tiny', left: 50, top: 50, right: 120, bottom: 150 }
        ];

        // 非常小的选框，位于卡片中心
        const tinySelection = { left: 80, top: 90, right: 81, bottom: 91 };
        
        const intersecting = cards.filter(card => 
            card.left < tinySelection.right &&
            card.right > tinySelection.left &&
            card.top < tinySelection.bottom &&
            card.bottom > tinySelection.top
        );

        console.log(`超小选框测试 - 选框(80,90,81,91)选中 ${intersecting.length} 张牌: ${intersecting.map(c => c.id).join(', ')}`);
        console.log(`预期选中卡片: ${intersecting.length === 1 ? 'PASS' : 'FAIL'}`);
    }
    testTinySelection();

    // 测试场景3: 斜角拖拽测试
    console.log("\n=== 测试场景3: 斜角拖拽测试 ===");
    function testDiagonalDrag() {
        // 模拟网格状排列的牌
        const cards = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                cards.push({
                    id: `card-${row}-${col}`,
                    left: col * 80,
                    top: row * 120,
                    right: col * 80 + 70,
                    bottom: row * 120 + 100
                });
            }
        }

        // 从左上角到右下角的斜角选框
        const diagonalSelection = { left: 30, top: 20, right: 250, bottom: 200 };
        
        const intersecting = cards.filter(card => 
            card.left < diagonalSelection.right &&
            card.right > diagonalSelection.left &&
            card.top < diagonalSelection.bottom &&
            card.bottom > diagonalSelection.top
        );

        console.log(`斜角拖拽测试 - 选中 ${intersecting.length} 张牌`);
        console.log(`预期选中多张牌(4-8张): ${intersecting.length >= 4 && intersecting.length <= 8 ? 'PASS' : 'FAIL'}`);
    }
    testDiagonalDrag();

    // 测试场景4: 滚动容器内坐标转换测试
    console.log("\n=== 测试场景4: 滚动容器坐标转换 ===");
    function testScrollConversion() {
        function convertToContainerCoords(clientX, clientY, containerRect, scrollTop = 0, scrollLeft = 0) {
            return {
                x: clientX - containerRect.left + scrollLeft,
                y: clientY - containerRect.top + scrollTop
            };
        }

        // 模拟一个滚动的容器
        const containerRect = { left: 100, top: 100, right: 900, bottom: 250, width: 800, height: 150 };
        const scrollTop = 50;
        const scrollLeft = 20;

        // 测试客户端坐标到容器坐标的转换
        const coords = convertToContainerCoords(150, 180, containerRect, scrollTop, scrollLeft);
        const expectedX = 150 - 100 + 20;  // 70
        const expectedY = 180 - 100 + 50;  // 130

        console.log(`滚动容器坐标转换: 客户端(150,180) -> 容器(${coords.x},${coords.y}), 滚动(20,50)`);
        console.log(`预期坐标(70,130): ${coords.x === expectedX && coords.y === expectedY ? 'PASS' : 'FAIL'}`);
    }
    testScrollConversion();

    // 测试场景5: 边界溢出测试
    console.log("\n=== 测试场景5: 选框边界溢出容器测试 ===");
    function testOverflowSelection() {
        const containerBounds = { left: 0, top: 0, right: 800, bottom: 150 };
        
        // 模拟几张牌
        const cards = [
            { id: 'card-1', left: 50, top: 25, right: 120, bottom: 125 },  // 在容器内
            { id: 'card-2', left: 750, top: 25, right: 820, bottom: 125 }  // 部分超出容器
        ];

        // 一个大的选框，超出容器边界
        const bigSelection = { left: 30, top: 10, right: 850, bottom: 140 };
        
        const intersecting = cards.filter(card => 
            card.left < bigSelection.right &&
            card.right > bigSelection.left &&
            card.top < bigSelection.bottom &&
            card.bottom > bigSelection.top
        );

        console.log(`边界溢出测试 - 选中 ${intersecting.length} 张牌: ${intersecting.map(c => c.id).join(', ')}`);
        console.log(`预期选中2张牌: ${intersecting.length === 2 ? 'PASS' : 'FAIL'}`);
    }
    testOverflowSelection();

    // 测试场景6: 高频小幅度拖拽测试
    console.log("\n=== 测试场景6: 高频小幅度拖拽测试 ===");
    function testHighFrequencySmallDrag() {
        // 模拟快速小幅度鼠标移动
        const cards = [
            { id: 'card-hf', left: 100, top: 50, right: 170, bottom: 150 }
        ];

        // 多个小的变化量，模拟高频抖动
        const movements = [
            { x: 120, y: 75 },  // 点在卡片上
            { x: 121, y: 76 },  // 稍微移动
            { x: 119, y: 74 },  // 稍微回移
            { x: 120, y: 75 },  // 回到原点附近
        ];

        const results = movements.map(movement => {
            const tempSelection = { 
                left: movement.x - 2, 
                top: movement.y - 2, 
                right: movement.x + 2, 
                bottom: movement.y + 2 
            };
            
            return cards.filter(card => 
                card.left < tempSelection.right &&
                card.right > tempSelection.left &&
                card.top < tempSelection.bottom &&
                card.bottom > tempSelection.top
            ).length > 0;
        });

        const allMatch = results.every(result => result === true);
        console.log(`高频小幅度测试 - 4次小移动是否都能检测到卡片: ${allMatch ? 'PASS' : 'FAIL'}`);
        console.log(`每次移动的检测结果: [${results.join(', ')}]`);
    }
    testHighFrequencySmallDrag();

    // 测试场景7: 边界精度测试
    console.log("\n=== 测试场景7: 边界精度测试 ===");
    function testPrecisionAtBoundaries() {
        // 模拟带有浮点坐标的牌
        const cards = [
            { id: 'card-precise', left: 100.7, top: 50.3, right: 170.2, bottom: 149.8 }
        ];

        // 多种边界情况的选框
        const testCases = [
            { 
                name: '略微超过左边界', 
                selection: { left: 100.6, top: 50.2, right: 100.8, bottom: 50.4 },
                shouldIntersect: true
            },
            { 
                name: '恰好接触左边界', 
                selection: { left: 99.7, top: 50.2, right: 100.7, bottom: 50.4 },
                shouldIntersect: true
            },
            { 
                name: '紧贴左边界外侧', 
                selection: { left: 99.6, top: 50.2, right: 99.7, bottom: 50.4 },
                shouldIntersect: false
            }
        ];

        let allPassed = true;
        testCases.forEach(testCase => {
            const intersects = cards.filter(card => 
                card.left < testCase.selection.right &&
                card.right > testCase.selection.left &&
                card.top < testCase.selection.bottom &&
                card.bottom > testCase.selection.top
            ).length > 0;

            const passed = intersects === testCase.shouldIntersect;
            console.log(`  ${testCase.name}: ${passed ? 'PASS' : 'FAIL'} (实际:${intersects}, 期望:${testCase.shouldIntersect})`);
            if (!passed) allPassed = false;
        });
        
        console.log(`边界精度整体测试: ${allPassed ? 'PASS' : 'FAIL'}`);
    }
    testPrecisionAtBoundaries();

    console.log("\n复杂场景测试完成！");
}

// 运行所有复杂测试
runComplexTests();