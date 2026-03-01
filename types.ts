import { Recipe, CategoryIdEnum } from './types';

// Helper to create a recipe
const createRecipe = (
  categoryId: string, 
  name: string, 
  desc: string, 
  time: string, 
  diff: 'Easy' | 'Medium' | 'Hard',
  ings: string[],
  insts: string[],
  tags: string[] = []
): Recipe => ({
  id: crypto.randomUUID(),
  categoryId,
  name,
  description: desc,
  cookingTime: time,
  difficulty: diff,
  ingredients: ings,
  instructions: insts,
  tags: tags,
  createdAt: Date.now(),
  views: 0,
  isFavorite: false
});

export const INITIAL_RECIPES: Recipe[] = [
  // Meat
  createRecipe(CategoryIdEnum.MEAT, '红烧肉', '肥而不腻，入口即化的经典本帮菜。', '90分钟', 'Medium', ['500g 五花肉', '20g 冰糖', '葱姜适量', '3勺 生抽', '1勺 老抽'], ['五花肉切块焯水', '炒糖色', '放入肉块翻炒上色', '加水炖煮60分钟', '收汁出锅'], ['传统', '高蛋白', '解馋']),
  createRecipe(CategoryIdEnum.MEAT, '回锅肉', '川菜之首，色泽红亮，肥而不腻。', '30分钟', 'Medium', ['300g 二刀肉', '100g 蒜苗', '郫县豆瓣酱'], ['肉煮至八分熟切片', '爆香豆瓣酱', '下肉片煸炒出油', '加入蒜苗炒断生'], ['香辣', '下饭']),
  createRecipe(CategoryIdEnum.MEAT, '糖醋排骨', '酸甜可口，老少皆宜。', '45分钟', 'Medium', ['500g 肋排', '冰糖', '醋', '白芝麻'], ['排骨焯水', '炸至金黄捞出', '锅留底油炒糖醋汁', '倒入排骨裹匀'], ['酸甜', '儿童最爱']),
  createRecipe(CategoryIdEnum.MEAT, '宫保鸡丁', '荔枝味型，鸡肉鲜嫩，花生香脆。', '20分钟', 'Hard', ['300g 鸡胸肉', '50g 花生米', '干辣椒', '花椒'], ['鸡肉切丁腌制', '调好宫保汁', '爆香辣椒花椒', '滑炒鸡丁', '加入花生淋汁'], ['高蛋白', '经典']),
  createRecipe(CategoryIdEnum.MEAT, '鱼香肉丝', '不见鱼而有鱼香，酸甜微辣。', '20分钟', 'Hard', ['200g 里脊肉', '木耳', '胡萝卜', '泡椒'], ['肉丝腌制上浆', '配菜切丝', '炒香泡椒', '滑炒肉丝', '倒入配菜和鱼香汁'], ['下饭', '微辣']),

  // Vegetable
  createRecipe(CategoryIdEnum.VEGETABLE, '麻婆豆腐', '麻辣鲜香烫，下饭神器。', '20分钟', 'Medium', ['400g 嫩豆腐', '50g 牛肉末', '花椒面', '豆瓣酱'], ['豆腐切块焯水', '炒香牛肉末和豆瓣酱', '加入高汤和豆腐', '勾芡撒花椒面'], ['高蛋白', '素食可改', '重口味']),
  createRecipe(CategoryIdEnum.VEGETABLE, '地三鲜', '茄子土豆青椒的完美结合。', '30分钟', 'Medium', ['1个 茄子', '2个 土豆', '1个 青椒'], ['食材切块', '分别炸熟备用', '炒香葱姜蒜', '放入食材勾芡翻炒'], ['家常', '素食']),
  createRecipe(CategoryIdEnum.VEGETABLE, '清炒时蔬', '保留蔬菜原汁原味，清淡健康。', '10分钟', 'Easy', ['300g 油菜/青菜', '蒜末', '盐'], ['青菜洗净', '爆香蒜末', '大火快炒', '加盐出锅'], ['低卡', '健康', '快手']),
  createRecipe(CategoryIdEnum.VEGETABLE, '干煸四季豆', '香辣脆嫩，开胃下酒。', '25分钟', 'Medium', ['400g 四季豆', '干辣椒', '花椒', '肉末'], ['四季豆炸至表皮起皱', '炒香佐料和肉末', '倒入四季豆翻炒'], ['下饭', '开胃']),
  createRecipe(CategoryIdEnum.VEGETABLE, '番茄炒蛋', '国民第一家常菜。', '10分钟', 'Easy', ['3个 鸡蛋', '2个 番茄', '葱花'], ['鸡蛋炒熟盛出', '番茄炒出汁', '倒入鸡蛋混合', '加糖盐调味'], ['快手', '营养均衡', '儿童']),

  // Soup
  createRecipe(CategoryIdEnum.SOUP, '紫菜蛋花汤', '快手汤，鲜美解腻。', '5分钟', 'Easy', ['1块 紫菜', '1个 鸡蛋', '虾皮'], ['水开入紫菜虾皮', '淋入蛋液', '加盐淋香油'], ['低卡', '快手']),
  createRecipe(CategoryIdEnum.SOUP, '玉米排骨汤', '清甜滋补，营养丰富。', '2小时', 'Easy', ['500g 排骨', '1根 甜玉米', '胡萝卜'], ['排骨焯水', '所有食材入锅', '小火慢炖2小时'], ['滋补', '老少皆宜']),
  createRecipe(CategoryIdEnum.SOUP, '酸辣汤', '酸辣开胃，暖身暖胃。', '15分钟', 'Medium', ['木耳', '豆腐', '火腿丝', '胡椒粉', '醋'], ['食材切丝煮开', '重胡椒重醋调味', '勾芡淋蛋液'], ['开胃', '暖身']),
  createRecipe(CategoryIdEnum.SOUP, '鲫鱼豆腐汤', '汤色奶白，鲜美无比。', '40分钟', 'Medium', ['1条 鲫鱼', '200g 豆腐', '姜片'], ['鲫鱼煎至两面金黄', '加开水大火煮白', '放入豆腐炖煮', '撒葱花'], ['高蛋白', '催乳', '养生']),
  createRecipe(CategoryIdEnum.SOUP, '罗宋汤', '酸甜浓郁，蔬菜丰富。', '1小时', 'Medium', ['牛腩', '番茄', '洋葱', '卷心菜'], ['牛腩炖软', '炒香蔬菜', '混合炖煮至浓稠'], ['营养丰富', '西式']),

  // Staple
  createRecipe(CategoryIdEnum.STAPLE, '扬州炒饭', '粒粒分明，配料丰富。', '15分钟', 'Medium', ['冷米饭', '鸡蛋', '火腿', '虾仁', '青豆'], ['鸡蛋打散炒熟', '炒香配料', '加入米饭炒散', '调味出锅'], ['主食', '快手']),
  createRecipe(CategoryIdEnum.STAPLE, '炸酱面', '酱香浓郁，面条劲道。', '45分钟', 'Medium', ['手擀面', '五花肉丁', '干黄酱', '甜面酱'], ['炸酱：小火慢熬肉丁和酱', '煮面', '切黄瓜丝', '拌匀食用'], ['面食', '传统']),
  createRecipe(CategoryIdEnum.STAPLE, '猪肉白菜饺子', '皮薄馅大，鲜嫩多汁。', '60分钟', 'Hard', ['面粉', '猪肉馅', '大白菜'], ['和面醒发', '调馅：白菜挤水拌入肉', '包饺子', '煮熟'], ['传统', '节日']),
  createRecipe(CategoryIdEnum.STAPLE, '葱油拌面', '葱香扑鼻，简单美味。', '15分钟', 'Easy', ['细面条', '小葱', '生抽', '老抽', '糖'], ['熬葱油至葱焦黄', '煮面过水', '淋入葱油酱汁'], ['快手', '早餐']),
  createRecipe(CategoryIdEnum.STAPLE, '皮蛋瘦肉粥', '咸鲜顺滑，早餐首选。', '60分钟', 'Medium', ['大米', '皮蛋', '瘦肉丝', '姜丝'], ['米粥熬粘稠', '放入肉丝姜丝', '加入皮蛋丁', '煮5分钟'], ['早餐', '养胃']),

  // Snack
  createRecipe(CategoryIdEnum.SNACK, '炸鸡翅', '外酥里嫩，孩子最爱。', '30分钟', 'Medium', ['鸡翅中', '炸鸡粉', '蒜蓉'], ['鸡翅腌制入味', '裹粉', '油温6成热炸熟', '复炸酥脆'], ['小吃', '高热量']),
  createRecipe(CategoryIdEnum.SNACK, '狼牙土豆', '街头风味，麻辣过瘾。', '20分钟', 'Easy', ['土豆', '辣椒粉', '孜然', '葱花'], ['土豆切波浪条', '炸熟捞出', '拌入调料'], ['街头小吃', '素食']),
  createRecipe(CategoryIdEnum.SNACK, '烤冷面', '东北特色，酸甜可口。', '10分钟', 'Easy', ['冷面片', '鸡蛋', '香肠', '洋葱'], ['煎冷面打蛋', '翻面刷酱', '卷入香肠洋葱', '切段'], ['小吃', '快手']),
  createRecipe(CategoryIdEnum.SNACK, '茶叶蛋', '茶香浓郁，风味独特。', '24小时', 'Easy', ['鸡蛋', '红茶', '八角', '桂皮'], ['鸡蛋煮熟敲碎壳', '加入香料茶水', '浸泡过夜'], ['早餐', '低卡']),
  createRecipe(CategoryIdEnum.SNACK, '春卷', '酥脆掉渣，馅料鲜美。', '40分钟', 'Medium', ['春卷皮', '豆芽', '韭菜', '肉丝'], ['炒馅晾凉', '包春卷', '炸至金黄'], ['节日', '传统']),

  // Dessert
  createRecipe(CategoryIdEnum.DESSERT, '红豆双皮奶', '奶香浓郁，口感顺滑。', '40分钟', 'Hard', ['全脂牛奶', '蛋清', '蜜红豆', '糖'], ['牛奶煮热结皮', '倒出奶液混蛋清', '倒回皮下', '蒸熟放红豆'], ['甜品', '下午茶']),
  createRecipe(CategoryIdEnum.DESSERT, '杨枝甘露', '芒果西米，清凉解暑。', '30分钟', 'Medium', ['芒果', '西柚', '西米', '椰浆', '牛奶'], ['煮西米过凉', '芒果打泥混椰奶', '加入西米果肉'], ['甜品', '夏日']),
  createRecipe(CategoryIdEnum.DESSERT, '银耳莲子羹', '胶质满满，滋阴润肺。', '2小时', 'Easy', ['干银耳', '莲子', '红枣', '冰糖'], ['银耳泡发撕碎', '炖出胶质', '加入配料煮熟'], ['美容', '养生']),
  createRecipe(CategoryIdEnum.DESSERT, '拔丝地瓜', '金黄拉丝，香甜可口。', '30分钟', 'Hard', ['红薯', '白糖', '油'], ['红薯炸熟', '熬糖至琥珀色', '倒入红薯快速翻裹'], ['甜食', '传统']),
  createRecipe(CategoryIdEnum.DESSERT, '芒果班戟', '奶油果肉，入口即化。', '40分钟', 'Medium', ['低筋粉', '鸡蛋', '牛奶', '淡奶油', '芒果'], ['摊薄饼皮', '打发奶油', '包入奶油芒果'], ['甜品', '下午茶']),

  // Drink
  createRecipe(CategoryIdEnum.DRINK, '珍珠奶茶', '自制更健康。', '30分钟', 'Medium', ['红茶包', '牛奶', '木薯粉', '黑糖'], ['搓珍珠煮熟', '煮浓红茶', '混合热牛奶', '加入珍珠'], ['饮品', '下午茶']),
  createRecipe(CategoryIdEnum.DRINK, '西瓜汁', '原汁原味，夏日必备。', '5分钟', 'Easy', ['西瓜', '冰块'], ['西瓜去籽', '加冰块榨汁'], ['饮品', '低卡', '夏日']),
  createRecipe(CategoryIdEnum.DRINK, '柠檬蜂蜜水', '美白养颜，酸甜解渴。', '5分钟', 'Easy', ['柠檬', '蜂蜜', '温水'], ['柠檬切片', '温水冲泡', '调入蜂蜜'], ['美白', '饮品']),
  createRecipe(CategoryIdEnum.DRINK, '红枣姜茶', '驱寒暖宫，经期必备。', '20分钟', 'Easy', ['红枣', '生姜', '红糖'], ['所有食材', '加水煮沸20分钟'], ['养生', '暖宫']),
  createRecipe(CategoryIdEnum.DRINK, '酸梅汤', '消食解腻，传统风味。', '1小时', 'Easy', ['乌梅', '山楂', '甘草', '冰糖', '桂花'], ['食材浸泡', '大火煮开小火慢炖', '撒桂花冷藏'], ['消暑', '传统']),

  // Health
  createRecipe(CategoryIdEnum.HEALTH, '山药排骨汤', '健脾养胃。', '1.5小时', 'Easy', ['铁棍山药', '排骨', '枸杞'], ['排骨炖1小时', '加入山药炖熟', '撒枸杞'], ['养生', '滋补']),
  createRecipe(CategoryIdEnum.HEALTH, '清蒸鲈鱼', '高蛋白低脂肪。', '15分钟', 'Medium', ['鲈鱼', '葱姜丝', '蒸鱼豉油'], ['鱼腌制', '水开蒸8分钟', '铺葱姜淋热油豉油'], ['高蛋白', '低卡']),
  createRecipe(CategoryIdEnum.HEALTH, '凉拌木耳', '清肠刮油。', '10分钟', 'Easy', ['干木耳', '洋葱', '醋', '蒜泥'], ['木耳泡发焯水', '拌入调料'], ['减脂', '低卡']),
  createRecipe(CategoryIdEnum.HEALTH, '杂粮粥', '膳食纤维丰富。', '1小时', 'Easy', ['黑米', '糙米', '红豆', '燕麦'], ['提前浸泡', '煮至软烂'], ['粗粮', '健康']),
  createRecipe(CategoryIdEnum.HEALTH, '白灼虾', '鲜甜弹牙。', '10分钟', 'Easy', ['鲜虾', '姜片', '料酒'], ['水开加姜酒', '下虾煮变色捞出', '蘸酱汁'], ['高蛋白', '低卡'])
];
