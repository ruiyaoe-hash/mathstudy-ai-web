/**
 * 验证知识图谱数据完整性的脚本
 * 检查Supabase数据库中knowledge_nodes表的数据是否正确导入
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// 自动加载.env文件
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim().replace(/^"|"$/g, '');
      if (key && value) {
        process.env[key.trim()] = value;
      }
    }
  });
  console.log('已从.env文件加载环境变量');
} else {
  console.error('错误: 找不到.env文件');
  process.exit(1);
}

// 从环境变量获取Supabase配置
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

// 验证环境变量是否存在
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('错误: 缺少Supabase配置环境变量');
  console.error('请确保已设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 环境变量');
  process.exit(1);
}

// 连接到Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyKnowledgeData() {
  console.log('开始验证知识图谱数据完整性...');

  try {
    // 1. 检查表是否存在
    console.log('\n1. 检查knowledge_nodes表是否存在...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('knowledge_nodes')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('错误: 无法访问knowledge_nodes表:', tableError.message);
      process.exit(1);
    }
    console.log('✅ 表存在');

    // 2. 获取所有知识点
    console.log('\n2. 获取所有知识点...');
    const { data: nodes, error: nodesError } = await supabase
      .from('knowledge_nodes')
      .select('*');

    if (nodesError) {
      console.error('错误: 无法获取知识点数据:', nodesError.message);
      process.exit(1);
    }

    console.log(`✅ 共获取到 ${nodes.length} 个知识点`);

    // 3. 按年级分组统计
    console.log('\n3. 按年级分组统计...');
    const gradeCounts = nodes.reduce((acc, node) => {
      acc[node.grade] = (acc[node.grade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    for (const [grade, count] of Object.entries(gradeCounts)) {
      console.log(`   ${grade}年级: ${count}个知识点`);
    }

    // 4. 检查字段完整性
    console.log('\n4. 检查字段完整性...');
    let fieldErrors = 0;

    nodes.forEach((node, index) => {
      const requiredFields = ['id', 'name', 'grade', 'module', 'difficulty'];
      const missingFields = requiredFields.filter(field => !node[field]);

      if (missingFields.length > 0) {
        console.error(`   ❌ 知识点 ${index + 1} (${node.id || '无ID'}) 缺少字段: ${missingFields.join(', ')}`);
        fieldErrors++;
      }

      // 检查ID格式
      if (node.id && !/^g\d+-n\d+$/.test(node.id)) {
        console.error(`   ❌ 知识点 ${node.id} 的ID格式不正确`);
        fieldErrors++;
      }

      // 检查难度值范围
      if (node.difficulty && (node.difficulty < 1 || node.difficulty > 3)) {
        console.error(`   ❌ 知识点 ${node.id} 的难度值不在1-3范围内: ${node.difficulty}`);
        fieldErrors++;
      }

      // 检查metadata字段
      if (!node.metadata) {
        console.error(`   ❌ 知识点 ${node.id} 缺少metadata字段`);
        fieldErrors++;
      }
    });

    if (fieldErrors === 0) {
      console.log('✅ 所有字段都完整');
    } else {
      console.error(`❌ 发现 ${fieldErrors} 个字段错误`);
    }

    // 5. 检查metadata中的额外信息
    console.log('\n5. 检查metadata中的额外信息...');
    let metadataErrors = 0;

    nodes.forEach(node => {
      if (node.metadata) {
        const metadata = typeof node.metadata === 'string' ? JSON.parse(node.metadata) : node.metadata;
        
        // 检查必要的metadata字段
        const requiredMetadataFields = ['skillDimension', 'masteryLevels', 'keyConcepts'];
        const missingMetadataFields = requiredMetadataFields.filter(field => !metadata[field]);

        if (missingMetadataFields.length > 0) {
          console.error(`   ❌ 知识点 ${node.id} 的metadata缺少字段: ${missingMetadataFields.join(', ')}`);
          metadataErrors++;
        }
      }
    });

    if (metadataErrors === 0) {
      console.log('✅ 所有metadata字段都完整');
    } else {
      console.error(`❌ 发现 ${metadataErrors} 个metadata错误`);
    }

    // 6. 检查prerequisites字段
    console.log('\n6. 检查prerequisites字段...');
    let prerequisiteErrors = 0;

    nodes.forEach(node => {
      if (node.prerequisites) {
        const prerequisites = typeof node.prerequisites === 'string' ? JSON.parse(node.prerequisites) : node.prerequisites;
        
        if (!Array.isArray(prerequisites)) {
          console.error(`   ❌ 知识点 ${node.id} 的prerequisites不是数组`);
          prerequisiteErrors++;
        }
      }
    });

    if (prerequisiteErrors === 0) {
      console.log('✅ 所有prerequisites字段都正确');
    } else {
      console.error(`❌ 发现 ${prerequisiteErrors} 个prerequisites错误`);
    }

    // 7. 显示前几个知识点的详细信息
    console.log('\n7. 显示前3个知识点的详细信息...');
    nodes.slice(0, 3).forEach(node => {
      console.log(`   ID: ${node.id}`);
      console.log(`   名称: ${node.name}`);
      console.log(`   年级: ${node.grade}`);
      console.log(`   模块: ${node.module}`);
      console.log(`   难度: ${node.difficulty}`);
      console.log(`   前置知识点: ${JSON.stringify(node.prerequisites || [])}`);
      console.log(`   元数据: ${JSON.stringify(node.metadata || {})}`);
      console.log('   ---');
    });

    // 8. 总结
    console.log('\n8. 验证总结...');
    const totalErrors = fieldErrors + metadataErrors + prerequisiteErrors;

    if (totalErrors === 0) {
      console.log('🎉 验证完成，所有数据都完整正确！');
      console.log(`   总知识点数: ${nodes.length}`);
      console.log(`   年级分布: ${Object.entries(gradeCounts).map(([grade, count]) => `${grade}年级(${count})`).join(', ')}`);
    } else {
      console.error(`❌ 验证完成，发现 ${totalErrors} 个错误`);
      console.error(`   字段错误: ${fieldErrors}`);
      console.error(`   Metadata错误: ${metadataErrors}`);
      console.error(`   Prerequisites错误: ${prerequisiteErrors}`);
    }

  } catch (error) {
    console.error('错误: 验证过程中发生异常:', error);
    process.exit(1);
  }
}

// 执行验证
verifyKnowledgeData()
  .then(() => {
    console.log('\n✅ 验证脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 验证脚本执行失败:', error);
    process.exit(1);
  });
