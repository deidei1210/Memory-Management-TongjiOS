
(function (window) {
    //获取页面DOM
    var document = window.document;
    // 初始化控制台
    var console                            //控制台
    var numberOfTotalMemoryBlocks          //内存块的个数
    var numberOfTotalInstructions          //指令的个数
    var numberOfInstructionsInEachPage     //每个页面上的指令个数
    var currentInstructionSpan             //当前指令
    var numberOfMissingPagesSpan           //缺页个数的标签
    var pageFaultRateSpan                  //缺页率的标签

    // 获取“开始”按钮
    var startBtn = document.getElementById("startBtn");

    function Console(consoleID) {
        this.consoleMain = document.getElementById(consoleID);

        Console.prototype.log = function (string) {
            this.consoleMain.value += (string + "\n");
        };

        Console.prototype.clear = function () {
            this.consoleMain.value = "";
        };

    };


    console = new Console("console");
    numberOfTotalMemoryBlocks = parseInt(document.getElementById("numberOfTotalMemoryBlocks").textContent); // 4
    numberOfTotalInstructions = parseInt(document.getElementById("numberOfTotalInstructions").textContent); // 320
    numberOfInstructionsInEachPage = parseInt(document.getElementById("numberOfInstructionsInEachPage").textContent); // 10

    // 需要改变的标签元素
    currentInstructionSpan = document.getElementById("currentInstruction"); //当前指令模块
    numberOfMissingPagesSpan = document.getElementById("numberOfMissingPages"); //缺页次数模块
    pageFaultRateSpan = document.getElementById("pageFaultRate");//缺页率模块

    // 内存
    var memory = [];
    // 记录指令是否被执行
    var instructions = [];
    // 记录执行的指令个数
    var insCount = 0;
    // 缺页个数
    var missingPage = 0;

    //用于判断指令是否被执行过
    function isInstructionExecuted(number) {
        if (typeof instructions[number] === "undefined") {
            instructions[number] = false;
        };
        return instructions[number];
    };
    //查找物理块中是否有该页⾯
    function isInstructionAvailable(number) {
        for (var i = 0; i < memory.length; i++) {
            if (Math.floor(number / numberOfInstructionsInEachPage) === memory[i]) {
                // 已经存在，没有发生缺页
                console.log("指令" + number + "在内存块" + (i + 1) + "中\n");
                return true;
            };
        };
        // 缺页
        console.log("发生缺页，指令" + number + "不在内存中");
        return false;
    };

    function init() {
        //初始化执行的指令个数为0
        insCount = 0;
        //初始化缺页个数为0
        missingPage = 0;
        currentInstructionSpan.textContent = -1;             //显示当前指令
        numberOfMissingPagesSpan.textContent = missingPage;  //显示缺页次数
        pageFaultRateSpan.textContent = missingPage / 320;   //显示缺页率
        
        //给memory分配相对应内存快个数的空间
        memory = new Array(numberOfTotalMemoryBlocks);
        //给指令数组分配相对应指令个数的内存空间
        instructions = new Array(numberOfTotalInstructions);

    };

    function initMemory() {
        console.log("<初始化内存块>");
        var i = 0;
        for (var i = 0; i < memory.length; i++) {
            var page = Math.floor(Math.random() * (numberOfTotalInstructions / numberOfInstructionsInEachPage));
            var offset = Math.floor(Math.random() * numberOfInstructionsInEachPage);
            var instruct = page * numberOfInstructionsInEachPage + offset;

            // 将指令所在的页调入内存
            console.log("将指令" + instruct + "所在的页调入内存空白块" + (i + 1));
            memory[i] = page;
        };
        console.log("<初始化结束>\n");
    };
    function FIFO() {
        console.log("使用FIFO算法");

        // 选择指令的策略
        //  0 : 顺序执行
        //  1 : 向后跳转
        // -1 : 向前跳转
        var strategy = 1;
        var po = 0;
        var instruct = -1;

        while (insCount < 320) {
            // 选择运行的指令
            if (strategy === 0) { // 顺序执行
                instruct++;
                // 更新策略
                if (insCount % 4 === 1) {
                    // 向前跳转
                    strategy = -1;
                }
                else if (insCount % 4 === 3) {
                    // 向后跳转
                    strategy = 1;
                };
            }
            else if (strategy === 1) {   // 向后跳转

                if (instruct + 1 > 319) {  //如果发现再往后就要越界了，那就改变策略为向前跳转
                    strategy = -1;
                    continue;
                };

                //随机生成一个后面的指令
                instruct = Math.floor(Math.random() * (numberOfTotalInstructions - (instruct + 1)) + (instruct + 1));

                // 更新策略
                // 顺序执行
                strategy = 0;
            }
            else if (strategy === -1) { // 向前跳转
                if (instruct - 2 < 0) {
                    strategy = 1;     //改成向后跳转
                    continue;
                };

                //随机生成一个前面的指令
                instruct = Math.floor(Math.random() * (instruct - 1));

                // 更新策略
                // 顺序执行
                strategy = 0;
            };

            // 处理越界
            if (instruct < 0) {
                // 向下越界
                instruct = -1;

                // 更新策略
                // 向后跳转
                strategy = 1;

                continue;
            }
            else if (instruct >= 320) {
                // 向上越界
                instruct = 321

                // 更新策略
                // 向前跳转
                strategy = -1;

                continue;
            };


            // 判断选中的指令是否被运行过
            if (!isInstructionExecuted(instruct)) {
                // 当前指令没有被运行过
                // 更新右上角的显示当前指令的标签
                currentInstructionSpan.textContent = instruct;
                var flag = 0; //如果flag=0表示当前指令就在内存中
                //如果flag=1表示当前指令不在内存中
                // 判断选中指令是否在内存中
                if (!isInstructionAvailable(instruct)) {
                    // 不在内存中，缺页
                    missingPage++;
                    flag = 1;
                    // 更新右上角显示当前缺页个数的标签
                    numberOfMissingPagesSpan.textContent = missingPage;
                    // 更新右上角显示当前缺页率的标签
                    pageFaultRateSpan.textContent = missingPage / 320;

                    console.log("将指令" + instruct + "所在的页调入内存，替换块" + (po % 4 + 1) + '\n');

                    // setTimeout(function () {
                    document.getElementById('block-' + po % 4).textContent = '指令' + instruct;


                    memory[(po++) % 4] = Math.floor(instruct / numberOfInstructionsInEachPage);
                    // memory[(po++) % 4] = Math.floor(instruct);
                };
                insCount++;  //当前指令被执行过了，所以执行过的指令条数加1
                instructions[instruct] = true;//把判断instruct指令是否执行过的相对应的数组的项变成true

                var row = document.getElementById("memory_table").insertRow()
                row.insertCell(0).innerHTML = "💃" + insCount
                row.insertCell(1).innerHTML = "🌸 NO. " + instruct
                row.insertCell(2).innerHTML =
                    memory[0] == undefined ? "Empty" : memory[0]
                row.insertCell(3).innerHTML =
                    memory[1] == undefined ? "Empty" : memory[1]
                row.insertCell(4).innerHTML =
                    memory[2] == undefined ? "Empty" : memory[2]
                row.insertCell(5).innerHTML =
                    memory[3] == undefined ? "Empty" : memory[3]

                //在内存中
                if (!flag) {
                    row.insertCell(6).innerHTML = "👌 指令" + instruct + "已在内存中"
                }
                else {
                    row.insertCell(6).innerHTML = "❕缺页，指令" + instruct + "不在内存中," + "将指令" + instruct + "所在的页调入内存，替换块" + ((po - 1) % 4 + 1)
                }

            };
        };
    };

    function LRU() {
        console.log("使用LRU算法");

        // 选择指令的策略
        //  0 - 顺序执行
        //  1 - 向后跳转
        // -1 - 向前跳转
        var strategy = 1;

        // 访问顺序，靠近末尾的为最近访问的
        var stack = [0, 1, 2, 3];

        var instruct = -1;
        while (insCount < 320) {
            // 选择运行的指令
            if (strategy === 0) {
                // 顺序执行
                instruct++;

                // 更新策略
                if (insCount % 4 === 1) {
                    // 向前跳转
                    strategy = -1;
                } else if (insCount % 4 === 3) {
                    // 向后跳转
                    strategy = 1;
                };
            } else if (strategy === 1) {
                // 向后跳转
                if (instruct + 1 > 319) {
                    strategy = -1;
                    continue;
                };

                instruct = Math.floor(Math.random() * (numberOfTotalInstructions - (instruct + 1)) + (instruct + 1));

                // 更新策略
                // 顺序执行
                strategy = 0;
            } else if (strategy === -1) {
                // 向前跳转
                if (instruct - 2 < 0) {
                    strategy = 1;
                    continue;
                };

                instruct = Math.floor(Math.random() * (instruct - 1));

                // 更新策略
                // 顺序执行
                strategy = 0;
            };

            // 处理越界
            if (instruct < 0) {
                // 向下越界
                instruct = -1;

                // 更新策略
                // 向后跳转
                strategy = 1;

                continue;
            } else if (instruct >= 320) {
                // 向上越界
                instruct = 321

                // 更新策略
                // 向前跳转
                strategy = -1;

                continue;
            };

            // 判断选中的指令是否被运行过
            if (!isInstructionExecuted(instruct)) {
                // 当前指令没有被运行过
                // 更新右上角的显示当前指令的标签
                currentInstructionSpan.textContent = instruct;
                var flag = 0; //如果flag=0表示当前指令就在内存中
                //如果flag=1表示当前指令不在内存中
                // 判断选中指令是否在内存中
                if (!isInstructionAvailable(instruct)) {
                    // 不在内存中，缺页
                    missingPage++;
                    flag = 1;
                    // 更新右上角显示当前缺页个数的标签
                    numberOfMissingPagesSpan.textContent = missingPage;
                    // 更新右上角显示当前缺页率的标签
                    pageFaultRateSpan.textContent = missingPage / 320;

                    // 替换
                    console.log("将指令" + instruct + "所在的页调入内存，替换块" + (stack[0] + 1));
                    document.getElementById('block-' + stack[0]).textContent = '指令' + instruct;
                    memory[stack[0]] = Math.floor(instruct / numberOfInstructionsInEachPage);
                };

                // 更新访问顺序
                var page = Math.floor(instruct / numberOfInstructionsInEachPage);
                var block = memory.indexOf(page);

                // 将当前块在访问顺序数组中挪到最后一位
                stack.splice(stack.indexOf(block), 1);
                stack.push(block);

                insCount++;
                instructions[instruct] = true;

                var row = document.getElementById("memory_table").insertRow()
                row.insertCell(0).innerHTML = "💃" + insCount
                row.insertCell(1).innerHTML = "🌸 NO. " + instruct
                row.insertCell(2).innerHTML =
                    memory[0] == undefined ? "Empty" : memory[0]
                row.insertCell(3).innerHTML =
                    memory[1] == undefined ? "Empty" : memory[1]
                row.insertCell(4).innerHTML =
                    memory[2] == undefined ? "Empty" : memory[2]
                row.insertCell(5).innerHTML =
                    memory[3] == undefined ? "Empty" : memory[3]

                //在内存中
                if (!flag) {
                    row.insertCell(6).innerHTML = "👌 指令" + instruct + "已在内存中"
                }
                else {
                    row.insertCell(6).innerHTML = "❕缺页，指令" + instruct + "不在内存中," + "将指令" + instruct + "所在的页调入内存，替换块" + (stack[0] === 0 ? 4 : stack[0]);
                }

            };
        };
    };

    //根据单选的算法来判断需要执行哪一个算法
    function chooseAlgorithm() {
        var ratio = document.querySelector("input:checked");
        if (ratio.value === "FIFO") {
            FIFO();
        } else if (ratio.value === "LRU") {
            LRU();
        };
    };

    function start() {
        // 禁用“开始”按钮
        startBtn.disabled = true;

        // 初始化变量
        init();

        const tableRows = document.querySelectorAll("#memory_table tr");
        for (let i = 1; i < tableRows.length; i++) {
            tableRows[i].style.display = "none";
        }
        // $("#memory_table  tr:not(:first)").hide();
        //清空控制台
        console.clear();

        // 输出开始信息
        console.log("<开始模拟>")

        // 初始化内存
        initMemory();

        // Choose algrithm and start
        chooseAlgorithm();

        // 输出结束信息
        console.log("<模拟结束>");
        console.log("----------------");

        // 输出结果
        console.log("缺页率为：" + missingPage + "/320");

        // 启用“开始”按钮
        startBtn.disabled = false;
    }

    // 当监听到“开始”按钮被按下的时候，就调用执行start函数
    startBtn.addEventListener('click', start);
})(window)


