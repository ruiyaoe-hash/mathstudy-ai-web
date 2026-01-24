/**
 * 知识图谱服务
 * 提供知识图谱的查询、分析和学习路径推荐功能
 */

import { supabase } from '@/integrations/supabase/client';

export interface KnowledgeNode {
  id: string;
  name: string;
  grade: number;
  module: string;
  description?: string;
  difficulty: number;
  prerequisites: string[];
  question_types: string[];
  metadata: {
    skillDimension?: string[];
    masteryLevels?: number[];
    keyConcepts?: string[];
    learningObjectives?: string[];
    is_core?: boolean;
    moduleId?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface LearningPathNode {
  node: KnowledgeNode;
  status: 'locked' | 'available' | 'mastered';
  progress: number;
}

class KnowledgeGraphService {
  /**
   * 获取指定年级的所有知识点
   */
  async getNodesByGrade(grade: number): Promise<KnowledgeNode[]> {
    const { data, error } = await supabase
      .from('knowledge_nodes')
      .select('*')
      .eq('grade', grade)
      .order('difficulty', { ascending: true });

    if (error) {
      console.error('Failed to fetch knowledge nodes by grade:', error);
      return [];
    }

    return data || [];
  }

  /**
   * 获取指定模块的所有知识点
   */
  async getNodesByModule(module: string): Promise<KnowledgeNode[]> {
    const { data, error } = await supabase
      .from('knowledge_nodes')
      .select('*')
      .eq('module', module)
      .order('difficulty', { ascending: true });

    if (error) {
      console.error('Failed to fetch knowledge nodes by module:', error);
      return [];
    }

    return data || [];
  }

  /**
   * 获取指定年级和模块的知识点
   */
  async getNodesByGradeAndModule(grade: number, module: string): Promise<KnowledgeNode[]> {
    const { data, error } = await supabase
      .from('knowledge_nodes')
      .select('*')
      .eq('grade', grade)
      .eq('module', module)
      .order('difficulty', { ascending: true });

    if (error) {
      console.error('Failed to fetch knowledge nodes:', error);
      return [];
    }

    return data || [];
  }

  /**
   * 获取单个知识点的详细信息
   */
  async getNodeById(id: string): Promise<KnowledgeNode | null> {
    const { data, error } = await supabase
      .from('knowledge_nodes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Failed to fetch knowledge node:', error);
      return null;
    }

    return data;
  }

  /**
   * 获取知识点的前置依赖节点
   */
  async getPrerequisites(id: string): Promise<KnowledgeNode[]> {
    const node = await this.getNodeById(id);
    if (!node || node.prerequisites.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('knowledge_nodes')
      .select('*')
      .in('id', node.prerequisites);

    if (error) {
      console.error('Failed to fetch prerequisites:', error);
      return [];
    }

    return data || [];
  }

  /**
   * 获取知识点的后置依赖节点（即依赖当前知识点的节点）
   */
  async getDependents(id: string): Promise<KnowledgeNode[]> {
    const { data, error } = await supabase
      .from('knowledge_nodes')
      .select('*')
      .contains('prerequisites', [id]);

    if (error) {
      console.error('Failed to fetch dependents:', error);
      return [];
    }

    return data || [];
  }

  /**
   * 获取所有知识点
   */
  async getAllNodes(): Promise<KnowledgeNode[]> {
    const { data, error } = await supabase
      .from('knowledge_nodes')
      .select('*')
      .order('grade', { ascending: true })
      .order('module')
      .order('difficulty', { ascending: true });

    if (error) {
      console.error('Failed to fetch all knowledge nodes:', error);
      return [];
    }

    return data || [];
  }

  /**
   * 生成学习路径（拓扑排序）
   * 返回按依赖关系排序的知识点列表
   */
  async generateLearningPath(grade?: number, module?: string): Promise<KnowledgeNode[]> {
    // 获取所有相关节点
    let nodes: KnowledgeNode[];
    if (grade && module) {
      nodes = await this.getNodesByGradeAndModule(grade, module);
    } else if (grade) {
      nodes = await this.getNodesByGrade(grade);
    } else {
      nodes = await this.getAllNodes();
    }

    if (nodes.length === 0) {
      return [];
    }

    // 构建邻接表和入度表
    const adjList: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();
    const nodeMap: Map<string, KnowledgeNode> = new Map();

    nodes.forEach(node => {
      nodeMap.set(node.id, node);
      adjList.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    // 填充邻接表和入度
    nodes.forEach(node => {
      node.prerequisites.forEach(prereqId => {
        if (nodeMap.has(prereqId)) {
          adjList.get(prereqId)?.push(node.id);
          inDegree.set(node.id, (inDegree.get(node.id) || 0) + 1);
        }
      });
    });

    // 拓扑排序（Kahn算法）
    const result: KnowledgeNode[] = [];
    const queue: string[] = [];

    // 找到所有入度为0的节点
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    while (queue.length > 0) {
      // 按难度排序，优先学习简单内容
      queue.sort((a, b) => {
        const nodeA = nodeMap.get(a);
        const nodeB = nodeMap.get(b);
        return (nodeA?.difficulty || 0) - (nodeB?.difficulty || 0);
      });

      const nodeId = queue.shift()!;
      const node = nodeMap.get(nodeId);
      if (node) {
        result.push(node);
      }

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

    return result;
  }

  /**
   * 获取用户的学习进度和推荐学习路径
   * @param userId 用户ID
   * @param grade 年级
   * @param module 模块
   */
  async getLearningPathWithProgress(
    userId: string,
    grade?: number,
    module?: number
  ): Promise<LearningPathNode[]> {
    const path = await this.generateLearningPath(grade);
    const masteredNodes = await this.getMasteredNodes(userId);

    const result: LearningPathNode[] = path.map(node => {
      const isMastered = masteredNodes.includes(node.id);
      const prerequisitesMet = node.prerequisites.every(prereqId =>
        masteredNodes.includes(prereqId)
      );

      return {
        node,
        status: isMastered ? 'mastered' : prerequisitesMet ? 'available' : 'locked',
        progress: isMastered ? 100 : 0
      };
    });

    return result;
  }

  /**
   * 获取用户已掌握的知识点
   */
  private async getMasteredNodes(userId: string): Promise<string[]> {
    // TODO: 从user_knowledge_mastery表查询
    // 目前返回空数组，后续实现
    return [];
  }

  /**
   * 搜索知识点（支持按名称和关键字搜索）
   */
  async searchNodes(keyword: string, grade?: number): Promise<KnowledgeNode[]> {
    let query = supabase
      .from('knowledge_nodes')
      .select('*')
      .or(`name.ilike.%${keyword}%,metadata->>'keyConcepts'.ilike.%${keyword}%`);

    if (grade !== undefined) {
      query = query.eq('grade', grade);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to search knowledge nodes:', error);
      return [];
    }

    return data || [];
  }

  /**
   * 获取知识点的建议学习顺序（基于依赖关系和难度）
   */
  async getSuggestedOrder(nodeIds: string[]): Promise<KnowledgeNode[]> {
    if (nodeIds.length === 0) {
      return [];
    }

    const nodes = await Promise.all(
      nodeIds.map(id => this.getNodeById(id))
    );

    const validNodes = nodes.filter((node): node is KnowledgeNode => node !== null);

    // 简单排序：先按前置依赖数量排序，再按难度排序
    return validNodes.sort((a, b) => {
      const prereqDiff = a.prerequisites.length - b.prerequisites.length;
      if (prereqDiff !== 0) return prereqDiff;
      return a.difficulty - b.difficulty;
    });
  }
}

// 导出单例实例
export const knowledgeGraphService = new KnowledgeGraphService();
