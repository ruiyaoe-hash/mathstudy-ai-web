/**
 * 知识图谱数据导入脚本
 * 将knowledge-graph.json中的数据导入到Supabase的knowledge_nodes表
 */

import { createClient } from '@supabase/supabase-js';
import knowledgeGraph from '../database/data/knowledge-graph.json';

// 自动加载.env文件
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取.env文件
const envPath = join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    // 忽略注释和空行
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim().replace(/^"|"$/g, '');
      if (key && value) {
        process.env[key.trim()] = value;
      }
    }
  });
  console.log('已从.env文件加载环境变量');
}

// 从环境变量获取Supabase配置
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

// 验证环境变量是否存在
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('错误: 缺少Supabase配置环境变量');
  console.error('请确保已设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 环境变量');
  console.error('或在项目根目录创建.env文件，填入配置信息');
  process.exit(1);
}

// 验证URL格式是否正确
if (SUPABASE_URL === 'your_supabase_url_here' || !SUPABASE_URL.startsWith('https://')) {
  console.error('错误: Supabase URL 格式无效');
  console.error('当前URL:', SUPABASE_URL);
  console.error('请确保URL以 https:// 开头，格式应为: https://your-project-id.supabase.co');
  console.error('请在 .env 文件中修改 VITE_SUPABASE_URL 配置');
  process.exit(1);
}

// 验证密钥是否有效
if (SUPABASE_KEY === 'your_supabase_anon_key_here' || SUPABASE_KEY.length < 10) {
  console.error('错误: Supabase 匿名密钥无效');
  console.error('当前密钥:', SUPABASE_KEY);
  console.error('请确保密钥长度足够，且不是占位符');
  console.error('请在 .env 文件中修改 VITE_SUPABASE_ANON_KEY 配置');
  process.exit(1);
}

let supabase;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('成功连接到 Supabase');
} catch (error) {
  console.error('错误: 无法连接到 Supabase');
  console.error('详细错误:', error.message);
  console.error('请检查 .env 文件中的配置是否正确');
  process.exit(1);
}

async function importKnowledgeGraph() {
  console.log('开始导入知识图谱数据...');

  // 遍历每个年级
  for (const gradeData of knowledgeGraph) {
    console.log(`\n处理 ${gradeData.grade} 年级数据...`);

    // 遍历每个模块
    for (const module of gradeData.modules) {
      console.log(`  模块: ${module.name}`);

      // 遍历每个知识点
      for (const node of module.knowledgeNodes) {
        console.log(`    导入知识点: ${node.name} (${node.id})`);

        const { error } = await supabase
          .from('knowledge_nodes')
          .upsert({
            id: node.id,
            name: node.name,
            grade: gradeData.grade,
            module: module.name,
            difficulty: node.difficulty,
            prerequisites: node.prerequisites,
            metadata: {
              skillDimension: node.skillDimension,
              masteryLevels: node.masteryLevels,
              keyConcepts: node.keyConcepts,
              learningObjectives: node.learningObjectives,
              is_core: node.is_core,
              moduleId: module.id
            }
          }, {
            onConflict: 'id'
          });

        if (error) {
          console.error(`      ❌ 导入失败: ${error.message}`);
        } else {
          console.log(`      ✅ 导入成功`);
        }
      }
    }
  }

  console.log('\n知识图谱数据导入完成！');

  // 验证导入结果
  const { count, error: countError } = await supabase
    .from('knowledge_nodes')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error(`❌ 验证失败: ${countError.message}`);
  } else {
    console.log(`\n✅ 数据库中共有 ${count} 个知识点`);
  }
}

// 执行导入
importKnowledgeGraph()
  .then(() => {
    console.log('\n✅ 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 脚本执行失败:', error);
    process.exit(1);
  });
