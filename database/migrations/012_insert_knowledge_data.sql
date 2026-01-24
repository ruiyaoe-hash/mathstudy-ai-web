-- ============================================
-- 知识图谱数据导入（4-6年级数学）
-- ============================================

-- 清空现有数据（可选，谨慎使用）
-- TRUNCATE knowledge_nodes CASCADE;

-- ==================== 四年级 ====================

-- 计算模块
INSERT INTO knowledge_nodes (id, name, grade, module, description, difficulty, prerequisites, question_types, metadata) VALUES
  ('g4-comp-01', '三位数加减法', 4, 'computation', '掌握三位数的加减法运算，包括进位和退位', 2, '[]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["进位", "退位", "竖式计算", "验算"],
    "learningObjectives": ["能够正确进行三位数加减法计算", "掌握进位和退位的方法", "能够解决简单的实际问题"],
    "commonMistakes": ["忘记进位或退位", "对齐错误", "计算错误"],
    "examples": ["345 + 278", "623 - 456"],
    "is_core": true
  }'::jsonb),
  
  ('g4-comp-02', '两位数乘法', 4, 'computation', '掌握两位数乘两位数的乘法运算', 3, '["g4-comp-01"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["乘法口诀", "部分积", "进位乘法"],
    "learningObjectives": ["理解两位数乘两位数的算理", "掌握竖式计算方法", "能解决相关应用题"],
    "commonMistakes": ["忘记进位", "部分积位置错误", "对齐错误"],
    "examples": ["23 × 45", "56 × 78"],
    "is_core": true
  }'::jsonb),
  
  ('g4-comp-03', '简单除法', 4, 'computation', '掌握除数是一位数的除法运算', 3, '["g4-comp-01"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["除法意义", "试商", "余数"],
    "learningObjectives": ["理解除法的意义", "掌握竖式计算方法", "理解余数的意义"],
    "commonMistakes": ["试商错误", "余数大于除数", "忘记商的0"],
    "examples": ["72 ÷ 6", "85 ÷ 3"],
    "is_core": true
  }'::jsonb);

-- 几何模块
INSERT INTO knowledge_nodes (id, name, grade, module, description, difficulty, prerequisites, question_types, metadata) VALUES
  ('g4-geo-01', '认识长方形和正方形', 4, 'geometry', '认识长方形和正方形的特征', 1, '[]'::jsonb, '["computation", "trueFalse"]'::jsonb, '{
    "keyConcepts": ["长方形", "正方形", "对边", "直角"],
    "learningObjectives": ["认识长方形和正方形的特征", "能区分长方形和正方形"],
    "commonMistakes": ["混淆长方形和正方形", "忽略对边平行"],
    "examples": ["识别图形", "数一数有几个直角"],
    "is_core": true
  }'::jsonb),
  
  ('g4-geo-02', '长方形和正方形的周长', 4, 'geometry', '掌握长方形和正方形周长的计算方法', 3, '["g4-geo-01"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["周长", "长", "宽", "边长"],
    "learningObjectives": ["理解周长的意义", "掌握周长计算公式", "能解决实际问题"],
    "commonMistakes": ["混淆面积和周长", "忘记乘以2", "单位错误"],
    "examples": ["长8宽5的长方形周长", "边长6的正方形周长"],
    "is_core": true
  }'::jsonb),
  
  ('g4-geo-03', '长方形和正方形的面积', 4, 'geometry', '掌握长方形和正方形面积的计算方法', 3, '["g4-geo-02"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["面积", "面积单位", "长×宽", "边长²"],
    "learningObjectives": ["理解面积的意义", "掌握面积计算公式", "区分周长和面积"],
    "commonMistakes": ["混淆周长和面积", "单位错误", "忘记单位"],
    "examples": ["长10宽6的长方形面积", "边长8的正方形面积"],
    "is_core": true
  }'::jsonb);

-- 代数模块
INSERT INTO knowledge_nodes (id, name, grade, module, description, difficulty, prerequisites, question_types, metadata) VALUES
  ('g4-alg-01', '认识方程', 4, 'algebra', '初步认识方程，理解方程的意义', 2, '["g4-comp-01"]'::jsonb, '["computation", "trueFalse"]'::jsonb, '{
    "keyConcepts": ["方程", "未知数", "等式"],
    "learningObjectives": ["认识方程", "能判断是不是方程"],
    "commonMistakes": ["混淆等式和方程", "含有未知数就认为是方程"],
    "examples": ["x + 5 = 12", "3x = 15"],
    "is_core": false
  }'::jsonb),
  
  ('g4-alg-02', '解简单方程', 4, 'algebra', '掌握简单方程的解法', 3, '["g4-alg-01"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["解方程", "检验", "逆运算"],
    "learningObjectives": ["掌握解简单方程的方法", "会检验方程的解"],
    "commonMistakes": ["等号两边不等", "移项错误"],
    "examples": ["x + 8 = 15", "x - 6 = 9"],
    "is_core": true
  }'::jsonb);

-- 统计模块
INSERT INTO knowledge_nodes (id, name, grade, module, description, difficulty, prerequisites, question_types, metadata) VALUES
  ('g4-stat-01', '简单的统计表', 4, 'statistics', '认识简单的统计表，能读懂数据', 1, '[]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["统计表", "数据", "合计"],
    "learningObjectives": ["认识统计表", "能从表中获取信息"],
    "commonMistakes": ["看错数据", "计算错误"],
    "examples": ["班级人数统计", "成绩统计"],
    "is_core": false
  }'::jsonb),
  
  ('g4-stat-02', '简单的条形统计图', 4, 'statistics', '认识条形统计图，能读取数据', 2, '["g4-stat-01"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["条形统计图", "刻度", "数据比较"],
    "learningObjectives": ["认识条形统计图", "能读取和比较数据"],
    "commonMistakes": ["看错刻度", "混淆数据"],
    "examples": ["天气统计图", "兴趣统计图"],
    "is_core": false
  }'::jsonb);

-- ==================== 五年级 ====================

-- 计算模块
INSERT INTO knowledge_nodes (id, name, grade, module, description, difficulty, prerequisites, question_types, metadata) VALUES
  ('g5-comp-01', '小数的加减法', 5, 'computation', '掌握小数加减法的计算方法', 3, '["g4-comp-01"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["小数点对齐", "进位", "退位"],
    "learningObjectives": ["掌握小数加减法的计算方法", "理解小数点对齐的原理"],
    "commonMistakes": ["小数点没有对齐", "忘记点小数点"],
    "examples": ["3.45 + 2.78", "5.63 - 2.89"],
    "is_core": true
  }'::jsonb),
  
  ('g5-comp-02', '小数乘法', 5, 'computation', '掌握小数乘法的计算方法', 4, '["g5-comp-01", "g4-comp-02"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["小数点", "积的小数位数", "近似数"],
    "learningObjectives": ["掌握小数乘法的计算方法", "会求积的近似数"],
    "commonMistakes": ["小数点位置错误", "忘记点小数点"],
    "examples": ["2.3 × 4.5", "0.56 × 0.78"],
    "is_core": true
  }'::jsonb),
  
  ('g5-comp-03', '小数除法', 5, 'computation', '掌握小数除法的计算方法', 4, '["g5-comp-02", "g4-comp-03"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["小数点移动", "循环小数", "商的近似数"],
    "learningObjectives": ["掌握小数除法的计算方法", "认识循环小数"],
    "commonMistakes": ["小数点位置错误", "除数是小数时出错"],
    "examples": ["7.2 ÷ 0.6", "5.6 ÷ 3"],
    "is_core": true
  }'::jsonb);

-- 几何模块
INSERT INTO knowledge_nodes (id, name, grade, module, description, difficulty, prerequisites, question_types, metadata) VALUES
  ('g5-geo-01', '平行四边形和梯形', 5, 'geometry', '认识平行四边形和梯形的特征', 2, '["g4-geo-01"]'::jsonb, '["computation", "trueFalse"]'::jsonb, '{
    "keyConcepts": ["平行四边形", "梯形", "平行", "底", "高"],
    "learningObjectives": ["认识平行四边形和梯形", "会画高"],
    "commonMistakes": ["混淆底和高", "高画错位置"],
    "examples": ["识别图形", "画高"],
    "is_core": true
  }'::jsonb),
  
  ('g5-geo-02', '三角形的面积', 5, 'geometry', '掌握三角形面积的计算方法', 3, '["g4-geo-03", "g5-geo-01"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["底", "高", "面积公式", "等底等高"],
    "learningObjectives": ["掌握三角形面积公式", "理解推导过程"],
    "commonMistakes": ["忘记除以2", "混淆底和高"],
    "examples": ["底8高6的三角形面积", "平行四边形剪成两个三角形"],
    "is_core": true
  }'::jsonb),
  
  ('g5-geo-03', '平行四边形和梯形的面积', 5, 'geometry', '掌握平行四边形和梯形面积的计算方法', 3, '["g5-geo-01", "g5-geo-02"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["底", "高", "面积公式", "割补法"],
    "learningObjectives": ["掌握平行四边形和梯形面积公式"],
    "commonMistakes": ["梯形忘记除以2", "高取错"],
    "examples": ["底12高8的平行四边形", "上底6下底10高8的梯形"],
    "is_core": true
  }'::jsonb);

-- 代数模块
INSERT INTO knowledge_nodes (id, name, grade, module, description, difficulty, prerequisites, question_types, metadata) VALUES
  ('g5-alg-01', '用字母表示数', 5, 'algebra', '学会用字母表示数和数量关系', 2, '["g4-alg-01"]'::jsonb, '["computation", "fillBlank"]'::jsonb, '{
    "keyConcepts": ["字母表示数", "数量关系", "公式"],
    "learningObjectives": ["会用字母表示数", "会用字母表示公式"],
    "commonMistakes": ["认为字母只能是正数", "书写不规范"],
    "examples": ["a + b = b + a", "长方形面积S = ab"],
    "is_core": true
  }'::jsonb),
  
  ('g5-alg-02', '解较复杂的方程', 5, 'algebra', '掌握解ax±b=c类型的方程', 3, '["g4-alg-02", "g5-alg-01"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["合并同类项", "移项", "等式性质"],
    "learningObjectives": ["掌握ax±b=c的解法", "会用方程解决问题"],
    "commonMistakes": ["移项忘记变号", "计算错误"],
    "examples": ["2x + 5 = 17", "3x - 8 = 13"],
    "is_core": true
  }'::jsonb);

-- 统计模块
INSERT INTO knowledge_nodes (id, name, grade, module, description, difficulty, prerequisites, question_types, metadata) VALUES
  ('g5-stat-01', '平均数', 5, 'statistics', '理解平均数的意义，掌握计算方法', 3, '["g4-stat-02"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["平均数", "总数", "份数", "移多补少"],
    "learningObjectives": ["理解平均数的意义", "会计算平均数"],
    "commonMistakes": ["总人数算错", "除法计算错误"],
    "examples": ["5人平均分", "平均成绩"],
    "is_core": true
  }'::jsonb),
  
  ('g5-stat-02', '中位数和众数', 5, 'statistics', '认识中位数和众数，理解它们的区别', 3, '["g5-stat-01"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["中位数", "众数", "数据集中趋势"],
    "learningObjectives": ["认识中位数和众数", "能计算中位数和众数"],
    "commonMistakes": ["忘记排序", "混淆中位数和平均数"],
    "examples": ["找出一组数据的中位数", "找出众数"],
    "is_core": false
  }'::jsonb);

-- ==================== 六年级 ====================

-- 计算模块
INSERT INTO knowledge_nodes (id, name, grade, module, description, difficulty, prerequisites, question_types, metadata) VALUES
  ('g6-comp-01', '分数加减法', 6, 'computation', '掌握分数加减法的计算方法', 3, '["g5-comp-01"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["通分", "异分母", "约分", "最简分数"],
    "learningObjectives": ["掌握异分母分数加减法", "会化简结果"],
    "commonMistakes": ["忘记通分", "结果没有化简"],
    "examples": ["1/3 + 2/5", "5/6 - 3/8"],
    "is_core": true
  }'::jsonb),
  
  ('g6-comp-02', '分数乘法', 6, 'computation', '掌握分数乘法的计算方法', 3, '["g6-comp-01", "g5-comp-02"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["分子乘分子", "分母乘分母", "约分", "倒数"],
    "learningObjectives": ["掌握分数乘法", "理解倒数概念"],
    "commonMistakes": ["分子分母分别相乘出错", "没有先约分"],
    "examples": ["2/3 × 4/5", "3/4 × 12"],
    "is_core": true
  }'::jsonb),
  
  ('g6-comp-03', '分数除法', 6, 'computation', '掌握分数除法的计算方法', 4, '["g6-comp-02"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["倒数", "除法转乘法", "复杂分数"],
    "learningObjectives": ["掌握分数除法", "会解决复杂分数问题"],
    "commonMistakes": ["忘记取倒数", "倒数取错"],
    "examples": ["5/6 ÷ 2/3", "3/4 ÷ 6"],
    "is_core": true
  }'::jsonb),
  
  ('g6-comp-04', '百分数', 6, 'computation', '理解百分数的意义，掌握百分数与小数、分数的互化', 3, '["g6-comp-01"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["百分数", "百分号", "互化", "百分率"],
    "learningObjectives": ["理解百分数意义", "掌握互化方法"],
    "commonMistakes": ["百分数与分数混淆", "互化错误"],
    "examples": ["0.25=25%", "1/4=25%", "50%=0.5"],
    "is_core": true
  }'::jsonb);

-- 几何模块
INSERT INTO knowledge_nodes (id, name, grade, module, description, difficulty, prerequisites, question_types, metadata) VALUES
  ('g6-geo-01', '圆的认识', 6, 'geometry', '认识圆，掌握圆的特征', 2, '["g5-geo-01"]'::jsonb, '["computation", "trueFalse"]'::jsonb, '{
    "keyConcepts": ["圆心", "半径", "直径", "圆周率"],
    "learningObjectives": ["认识圆的各部分名称", "理解d=2r"],
    "commonMistakes": ["混淆半径和直径", "圆周率记错"],
    "examples": ["画圆", "找圆心和半径"],
    "is_core": true
  }'::jsonb),
  
  ('g6-geo-02', '圆的周长', 6, 'geometry', '掌握圆周长的计算方法', 3, '["g6-geo-01"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["周长", "C=2πr", "C=πd", "近似值"],
    "learningObjectives": ["掌握圆周长公式", "会计算圆周长"],
    "commonMistakes": ["公式记错", "π取值错误"],
    "examples": ["r=5的圆周长", "d=10的圆周长"],
    "is_core": true
  }'::jsonb),
  
  ('g6-geo-03', '圆的面积', 6, 'geometry', '掌握圆面积的计算方法', 4, '["g6-geo-02"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["面积", "S=πr²", "推导", "近似计算"],
    "learningObjectives": ["掌握圆面积公式", "理解推导过程"],
    "commonMistakes": ["公式记错", "没有平方"],
    "examples": ["r=4的圆面积", "d=6的圆面积"],
    "is_core": true
  }'::jsonb),
  
  ('g6-geo-04', '圆柱的表面积', 6, 'geometry', '掌握圆柱表面积的计算方法', 4, '["g6-geo-03"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["底面", "侧面", "侧面积", "表面积"],
    "learningObjectives": ["掌握圆柱表面积公式", "会计算实际问题"],
    "commonMistakes": ["忘记底面积", "侧面积公式错"],
    "examples": ["r=3 h=10的圆柱表面积"],
    "is_core": true
  }'::jsonb);

-- 代数模块
INSERT INTO knowledge_nodes (id, name, grade, module, description, difficulty, prerequisites, question_types, metadata) VALUES
  ('g6-alg-01', '一元一次方程', 6, 'algebra', '掌握一元一次方程的解法', 3, '["g5-alg-02"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["一元一次方程", "去分母", "去括号", "移项"],
    "learningObjectives": ["掌握解一元一次方程的步骤", "能解较复杂方程"],
    "commonMistakes": ["去分母时忘记乘常数项", "移项忘记变号"],
    "examples": ["(x-2)/3 + 1 = 2x", "2(x+3) - x = 10"],
    "is_core": true
  }'::jsonb),
  
  ('g6-alg-02', '比例', 6, 'algebra', '理解比例的意义，掌握比例的基本性质', 3, '["g5-alg-01", "g5-comp-02"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["比例", "比例项", "内项", "外项", "基本性质"],
    "learningObjectives": ["理解比例的意义", "掌握比例的基本性质"],
    "commonMistakes": ["混淆比和比例", "内项外项搞错"],
    "examples": ["判断是否成比例", "解比例"],
    "is_core": true
  }'::jsonb);

-- 统计模块
INSERT INTO knowledge_nodes (id, name, grade, module, description, difficulty, prerequisites, question_types, metadata) VALUES
  ('g6-stat-01', '概率入门', 6, 'statistics', '初步认识概率，理解可能性', 2, '["g5-stat-02"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["概率", "可能性", "随机事件", "必然事件"],
    "learningObjectives": ["认识随机事件", "会用分数表示可能性"],
    "commonMistakes": ["概率计算错误", "总情况数数错"],
    "examples": ["抛硬币的概率", "摸球的可能性"],
    "is_core": true
  }'::jsonb),
  
  ('g6-stat-02', '可能性大小', 6, 'statistics', '理解可能性大小，能进行比较', 3, '["g6-stat-01"]'::jsonb, '["computation", "wordProblem"]'::jsonb, '{
    "keyConcepts": ["可能性", "大小比较", "公平性"],
    "learningObjectives": ["能比较可能性大小", "判断游戏是否公平"],
    "commonMistakes": ["可能性大小判断错误"],
    "examples": ["比较两个事件可能性", "设计公平游戏"],
    "is_core": false
  }'::jsonb);

-- 添加索引优化查询
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_grade_module ON knowledge_nodes(grade, module);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_difficulty_grade ON knowledge_nodes(difficulty, grade);

-- 添加统计信息
COMMENT ON TABLE knowledge_nodes IS '已导入4-6年级数学知识图谱数据（共32个知识点）';
