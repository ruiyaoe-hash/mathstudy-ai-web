/**
 * 知识图谱数据导入脚本
 * 将knowledge-graph.json中的数据导入到Supabase的knowledge_nodes表
 */

import { createClient } from '@supabase/supabase-js';
import knowledgeGraph from '../database/data/knowledge-graph.json';

const SUPABASE_URL = "https://szlkizzsnrjjpibsjizn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6bGtpenpzbnJqanBpYnNqaXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzODc4MTgsImV4cCI6MjA4Mzk2MzgxOH0.owbx7K0YVRE2xhNaJTlrS_uCrLCOesIIyBghroY8shs";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
