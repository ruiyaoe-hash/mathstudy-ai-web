/**
 * 验证知识图谱关联关系的脚本
 * 检查知识点之间的依赖关系是否正确，确保前置知识点都存在
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

interface KnowledgeNode {
  id: string;
  name: string;
  grade: string;
  module: string;
  difficulty: number;
  prerequisites: string[];
  metadata: any;
  created_at: string;
  updated_at: string;
}

async function verifyKnowledgeRelationships() {
  console.log('开始验证知识图谱关联关系...');

  try {
    // 1. 获取所有知识点
    console.log('\n1. 获取所有知识点...');
    const { data: nodes, error: nodesError } = await supabase
      .from('knowledge_nodes')
      .select('*');

    if (nodesError) {
      console.error('错误: 无法获取知识点数据:', nodesError.message);
      process.exit(1);
    }

    if (!nodes || nodes.length === 0) {
      console.error('错误: 未找到知识点数据');
      process.exit(1);
    }

    console.log(`✅ 共获取到 ${nodes.length} 个知识点`);

    // 2. 构建知识点ID映射，方便快速查找
    const nodeMap = new Map<string, KnowledgeNode>();
    nodes.forEach(node => {
      nodeMap.set(node.id, node);
    });

    // 3. 检查前置知识点是否存在
    console.log('\n2. 检查前置知识点是否存在...');
    let missingPrerequisites = 0;
    const invalidDependencies: { nodeId: string; nodeName: string; prerequisiteId: string }[] = [];

    nodes.forEach(node => {
      if (node.prerequisites && node.prerequisites.length > 0) {
        node.prerequisites.forEach(prerequisiteId => {
          if (!nodeMap.has(prerequisiteId)) {
            missingPrerequisites++;
            invalidDependencies.push({
              nodeId: node.id,
              nodeName: node.name,
              prerequisiteId: prerequisiteId
            });
          }
        });
      }
    });

    if (missingPrerequisites === 0) {
      console.log('✅ 所有前置知识点都存在');
    } else {
      console.error(`❌ 发现 ${missingPrerequisites} 个不存在的前置知识点`);
      invalidDependencies.forEach(({ nodeId, nodeName, prerequisiteId }) => {
        console.error(`   ❌ 知识点 ${nodeId} (${nodeName}) 引用了不存在的前置知识点 ${prerequisiteId}`);
      });
    }

    // 4. 检查循环依赖
    console.log('\n3. 检查循环依赖...');
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const cycles: string[][] = [];

    function detectCycle(nodeId: string, path: string[]): boolean {
      if (!nodeMap.has(nodeId)) return false;
      if (recStack.has(nodeId)) {
        const cycleStartIndex = path.indexOf(nodeId);
        cycles.push([...path.slice(cycleStartIndex), nodeId]);
        return true;
      }
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recStack.add(nodeId);
      path.push(nodeId);

      const node = nodeMap.get(nodeId);
      if (node && node.prerequisites) {
        for (const prereqId of node.prerequisites) {
          if (detectCycle(prereqId, path)) {
            return true;
          }
        }
      }

      recStack.delete(nodeId);
      path.pop();
      return false;
    }

    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        detectCycle(node.id, []);
      }
    });

    if (cycles.length === 0) {
      console.log('✅ 未发现循环依赖');
    } else {
      console.error(`❌ 发现 ${cycles.length} 个循环依赖`);
      cycles.forEach((cycle, index) => {
        console.error(`   ❌ 循环 ${index + 1}: ${cycle.join(' → ')} → ${cycle[0]}`);
      });
    }

    // 5. 检查学习路径的有效性（拓扑排序）
    console.log('\n4. 检查学习路径的有效性...');
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    // 初始化入度和邻接表
    nodes.forEach(node => {
      inDegree.set(node.id, 0);
      adjList.set(node.id, []);
    });

    // 构建邻接表和入度
    nodes.forEach(node => {
      if (node.prerequisites && node.prerequisites.length > 0) {
        node.prerequisites.forEach(prereqId => {
          if (nodeMap.has(prereqId)) {
            adjList.get(prereqId)?.push(node.id);
            inDegree.set(node.id, (inDegree.get(node.id) || 0) + 1);
          }
        });
      }
    });

    // 拓扑排序
    const queue: string[] = [];
    const topoOrder: string[] = [];

    // 找到所有入度为0的节点
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      topoOrder.push(nodeId);

      // 处理后置节点
      const dependents = adjList.get(nodeId) || [];
      dependents.forEach(depId => {
        const newDegree = (inDegree.get(depId) || 0) - 1;
        inDegree.set(depId, newDegree);
        if (newDegree === 0) {
          queue.push(depId);
        }
      });
    }

    if (topoOrder.length === nodes.length) {
      console.log('✅ 学习路径有效，可以通过拓扑排序遍历所有知识点');
      console.log(`   拓扑排序结果（前10个）: ${topoOrder.slice(0, 10).join(', ')}${topoOrder.length > 10 ? '...' : ''}`);
    } else {
      console.error(`❌ 学习路径无效，存在无法到达的知识点`);
      console.error(`   可排序的知识点数: ${topoOrder.length}`);
      console.error(`   总知识点数: ${nodes.length}`);
      
      // 找出无法到达的知识点
      const reachable = new Set(topoOrder);
      const unreachable = nodes.filter(node => !reachable.has(node.id));
      console.error(`   无法到达的知识点: ${unreachable.map(node => node.id).join(', ')}`);
    }

    // 6. 按年级分析依赖关系
    console.log('\n5. 按年级分析依赖关系...');
    const gradeGroups = nodes.reduce((acc, node) => {
      const grade = node.grade;
      if (!acc[grade]) {
        acc[grade] = [];
      }
      acc[grade].push(node);
      return acc;
    }, {} as Record<string, KnowledgeNode[]>);

    for (const [grade, gradeNodes] of Object.entries(gradeGroups)) {
      console.log(`   ${grade}年级:`);
      console.log(`     知识点数: ${gradeNodes.length}`);
      
      // 统计依赖关系
      let internalDependencies = 0;
      let externalDependencies = 0;
      
      gradeNodes.forEach(node => {
        if (node.prerequisites && node.prerequisites.length > 0) {
          node.prerequisites.forEach(prereqId => {
            const prereqNode = nodeMap.get(prereqId);
            if (prereqNode && prereqNode.grade === grade) {
              internalDependencies++;
            } else {
              externalDependencies++;
            }
          });
        }
      });
      
      console.log(`     内部依赖（同年级）: ${internalDependencies}`);
      console.log(`     外部依赖（其他年级）: ${externalDependencies}`);
    }

    // 7. 分析知识点依赖深度
    console.log('\n6. 分析知识点依赖深度...');
    const depthMap = new Map<string, number>();

    function calculateDepth(nodeId: string): number {
      if (depthMap.has(nodeId)) {
        return depthMap.get(nodeId)!;
      }
      
      if (!nodeMap.has(nodeId)) {
        return 0;
      }
      
      const node = nodeMap.get(nodeId);
      if (!node || !node.prerequisites || node.prerequisites.length === 0) {
        depthMap.set(nodeId, 0);
        return 0;
      }
      
      let maxDepth = 0;
      node.prerequisites.forEach(prereqId => {
        const prereqDepth = calculateDepth(prereqId);
        maxDepth = Math.max(maxDepth, prereqDepth);
      });
      
      const depth = maxDepth + 1;
      depthMap.set(nodeId, depth);
      return depth;
    }

    nodes.forEach(node => {
      calculateDepth(node.id);
    });

    // 按深度排序
    const depthEntries = Array.from(depthMap.entries());
    depthEntries.sort((a, b) => b[1] - a[1]);

    console.log(`   最大依赖深度: ${depthEntries[0]?.[1] || 0}`);
    console.log(`   依赖深度分布:`);
    const depthCounts = depthEntries.reduce((acc, [, depth]) => {
      acc[depth] = (acc[depth] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    for (const [depth, count] of Object.entries(depthCounts).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))) {
      console.log(`     深度 ${depth}: ${count} 个知识点`);
    }

    // 8. 总结
    console.log('\n7. 验证总结...');
    const totalErrors = missingPrerequisites + cycles.length + (topoOrder.length !== nodes.length ? 1 : 0);

    if (totalErrors === 0) {
      console.log('🎉 验证完成，所有关联关系都正确！');
      console.log(`   总知识点数: ${nodes.length}`);
      console.log(`   年级分布: ${Object.entries(gradeGroups).map(([grade, group]) => `${grade}年级(${group.length})`).join(', ')}`);
      console.log(`   最大依赖深度: ${depthEntries[0]?.[1] || 0}`);
    } else {
      console.error(`❌ 验证完成，发现 ${totalErrors} 个错误`);
      console.error(`   缺少前置知识点: ${missingPrerequisites}`);
      console.error(`   循环依赖: ${cycles.length}`);
      console.error(`   拓扑排序错误: ${topoOrder.length !== nodes.length ? 1 : 0}`);
    }

  } catch (error) {
    console.error('错误: 验证过程中发生异常:', error);
    process.exit(1);
  }
}

// 执行验证
verifyKnowledgeRelationships()
  .then(() => {
    console.log('\n✅ 验证脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 验证脚本执行失败:', error);
    process.exit(1);
  });
