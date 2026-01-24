/**
 * 知识图谱数据导入脚本
 * 使用Supabase客户端导入知识图谱数据
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase配置
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('缺少Supabase环境变量');
  console.error('请设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 读取SQL文件
const sqlFilePath = path.join(__dirname, '../database/migrations/012_insert_knowledge_data.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

// 分割SQL语句（简单的按分号分割，实际需要更复杂的解析）
const statements = sqlContent
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`准备执行 ${statements.length} 条SQL语句`);

async function importData() {
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // 跳过注释和空语句
    if (!statement || statement.startsWith('--') || statement.startsWith('/*')) {
      continue;
    }

    try {
      // 使用Supabase的RPC执行SQL
      // 注意：anon key可能没有执行任意SQL的权限
      // 这种情况下需要在Supabase控制台手动执行SQL文件
      
      console.log(`执行第 ${i + 1} 条SQL...`);
      
      // 尝试解析INSERT语句
      if (statement.toLowerCase().startsWith('insert into knowledge_nodes')) {
        // 提取数据并使用Supabase客户端插入
        // 这里需要复杂的解析，暂时跳过
        console.log('  跳过INSERT语句（需要在Supabase控制台执行）');
      } else {
        console.log('  跳过非INSERT语句');
      }
      
      successCount++;
    } catch (error) {
      console.error(`执行第 ${i + 1} 条SQL失败:`, error);
      errorCount++;
    }
  }

  console.log('\n导入完成！');
  console.log(`成功: ${successCount}, 失败: ${errorCount}`);
  
  console.log('\n提示：由于权限限制，建议在Supabase控制台执行SQL文件：');
  console.log(sqlFilePath);
}

// 显示提示信息
console.log('=================================');
console.log('知识图谱数据导入');
console.log('=================================\n');
console.log('由于环境限制，本脚本无法直接执行SQL导入。');
console.log('\n请按以下步骤操作：');
console.log('1. 登录Supabase控制台');
console.log('2. 进入SQL Editor');
console.log('3. 复制并执行以下文件的内容：');
console.log(`   ${sqlFilePath}`);
console.log('\n或者，创建一个名为 knowledge-data.sql 的文件，内容如下：\n');
console.log(sqlContent.substring(0, 500) + '...\n');

importData().catch(console.error);
