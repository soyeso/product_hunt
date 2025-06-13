import OpenAI from 'openai';

export class ProductAnalyzer {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  async analyzeProduct(product) {
    const systemPrompt = `
      당신은 Product Hunt 전문 분석가입니다.

      **역할:**
      - 스타트업과 제품 런칭에 10년 경험을 가진 전문가
      - AI VC 투자자
      - AI 기술과 스타트업 생태계에 대한 깊은 이해

      **분석 관점:**
      1. 제품 성공 요인 (마케팅, 기술, UX, 시장 타이밍)
      2. AI 기술 활용도와 구현 방식
      3. 스타트업 성장 전략과 시사점
      4. 시장 트렌드와 기회 분석

      다음 제품 정보를 분석해주세요:
      ${JSON.stringify(product, null, 2)}
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "이 제품에 대한 상세 분석을 제공해주세요." }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const analysis = completion.choices[0].message.content;
      return this.parseAnalysis(analysis);
    } catch (error) {
      console.error('Product Analysis Error:', error);
      return this.getDefaultAnalysis(product);
    }
  }

  parseAnalysis(analysis) {
    // 분석 결과를 구조화된 형태로 파싱
    const insights = [];
    const aiTech = {
      used: false,
      technologies: [],
      codeExample: null
    };

    // 분석 텍스트를 줄 단위로 분리
    const lines = analysis.split('\n');
    let currentSection = '';

    for (const line of lines) {
      if (line.includes('성공 요인') || line.includes('핵심 인사이트')) {
        currentSection = 'insights';
        continue;
      } else if (line.includes('AI 기술') || line.includes('기술 스택')) {
        currentSection = 'aiTech';
        continue;
      }

      if (line.trim() && line.startsWith('-') || line.startsWith('•')) {
        const content = line.replace(/^[-•]\s*/, '').trim();
        if (currentSection === 'insights') {
          insights.push(content);
        } else if (currentSection === 'aiTech') {
          if (content.toLowerCase().includes('ai') || 
              content.toLowerCase().includes('인공지능') ||
              content.toLowerCase().includes('머신러닝')) {
            aiTech.used = true;
            aiTech.technologies.push(content);
          }
        }
      }
    }

    return {
      insights: insights.length > 0 ? insights : this.getDefaultInsights(),
      aiTech: aiTech.used ? aiTech : this.getDefaultAITech()
    };
  }

  getDefaultInsights() {
    return [
      "성공 패턴: 명확한 문제 해결과 사용자 중심 접근",
      "기술 트렌드: 최신 기술 스택과 확장 가능한 아키텍처",
      "시장 기회: 성장하는 시장에서의 차별화된 가치 제안"
    ];
  }

  getDefaultAITech() {
    return {
      used: false,
      technologies: [],
      codeExample: null
    };
  }

  getDefaultAnalysis(product) {
    return {
      insights: this.getDefaultInsights(),
      aiTech: this.getDefaultAITech()
    };
  }
} 