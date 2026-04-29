// 提示词优化服务

// AI提示词优化模板库
const promptTemplates = {
  写实: (subject) =>
    `${subject}，超现实主义风格，8K分辨率，精细细节，自然光线，真实感渲染，景深效果`,
  动漫: (subject) =>
    `${subject}，日本动漫风格，精致线条，明亮色彩，二次元美学，动画截图风格`,
  油画: (subject) =>
    `${subject}，油画风格，丰富纹理，古典色调，印象派笔触，博物馆级别艺术品`,
  水彩: (subject) =>
    `${subject}，水彩画风格，柔和色调，透明层次，手绘质感，艺术氛围`,
  科幻: (subject) =>
    `${subject}，赛博朋克风格，霓虹灯光，未来主义，高科技元素，暗色调背景`,
  幻想: (subject) =>
    `${subject}，奇幻风格，魔法元素，梦幻光线，超现实场景，史诗级构图`,
  极简: (subject) =>
    `${subject}，极简主义风格，大量留白，几何构图，纯净色彩，现代设计`,
  复古: (subject) =>
    `${subject}，复古风格，怀旧色调，胶片颗粒感，经典美学，老照片质感`,
};

const VALID_STYLES = Object.keys(promptTemplates);
const MAX_INPUT_LENGTH = 500;
const MIN_INPUT_LENGTH = 2;

// 输入清理
function sanitizeInput(input) {
  return input
    .trim()
    .replace(/[<>\"'&]/g, "")
    .slice(0, MAX_INPUT_LENGTH);
}

// 优化提示词（修复：移除validateStyle，直接使用模板）
export function optimizePrompt(userInput, style = "写实") {
  if (!userInput || !userInput.trim()) {
    return { success: false, message: "请输入图片描述以生成优化提示词" };
  }

  const subject = sanitizeInput(userInput);

  if (subject.length < MIN_INPUT_LENGTH) {
    return { success: false, message: "描述太短，请输入更详细的图片描述" };
  }

  // 直接使用style，如果不存在则使用写实模板
  const template = promptTemplates[style] || promptTemplates["写实"];

  const basePrompt = template(subject);
  const enhancedPrompt = `${basePrompt}，专业摄影，大师级构图，完美光影`;

  return { success: true, prompt: enhancedPrompt };
}

// 获取所有可用风格
export function getAvailableStyles() {
  return [...VALID_STYLES];
}
