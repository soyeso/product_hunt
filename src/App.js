import React, { useState, useEffect } from 'react';
import { TrendingUp, Code, Lightbulb, Calendar, Star, MessageCircle, ChevronDown, ChevronUp, ExternalLink, Brain } from 'lucide-react';
import { ProductHuntService } from './services/productHuntAPI';
import { ProductAnalyzer } from './services/productAnalyzer';
import './App.css';

const ProductHuntAnalyzer = () => {
  const productHuntService = new ProductHuntService();
  const productAnalyzer = new ProductAnalyzer();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedProduct, setExpandedProduct] = useState(null);

  const loadTodaysProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productHuntService.getSelectedProducts();
      if (!data || data.length === 0) {
        throw new Error('제품 데이터를 가져오는데 실패했습니다.');
      }
      setProducts(data);
      await analyzeProductsWithAI(data);
    } catch (error) {
      console.error('Error loading products:', error);
      setError(error.message || '제품을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodaysProducts();
  }, []);

  const generateProductInsights = async (product) => {
    return [
      "성공 패턴: 명확한 문제 해결과 사용자 중심 접근",
      "기술 트렌드: 최신 기술 스택과 확장 가능한 아키텍처",
      "시장 기회: 성장하는 시장에서의 차별화된 가치 제안"
    ];
  };

  const detectAITechnology = async (product) => {
    return {
      used: product.name.toLowerCase().includes('ai'),
      technologies: ["GPT-4", "Computer Vision", "Natural Language Processing"],
      codeExample: "// AI 기술 구현 예시 코드"
    };
  };

  const analyzeProductsWithAI = async (products) => {
    try {
      const analyzedProducts = await Promise.all(
        products.map(async (product) => {
          try {
            const analysis = await productAnalyzer.analyzeProduct(product);
            return {
              ...product,
              insights: analysis.insights,
              aiTech: analysis.aiTech
            };
          } catch (error) {
            console.error(`Error analyzing product ${product.name}:`, error);
            return {
              ...product,
              insights: productAnalyzer.getDefaultInsights(),
              aiTech: productAnalyzer.getDefaultAITech()
            };
          }
        })
      );
      
      return analyzedProducts;
    } catch (error) {
      console.error('Error in batch analysis:', error);
      throw error;
    }
  };

  const renderProductCard = (product) => (
    <div key={product.id} className="bg-white rounded-lg shadow-md border border-gray-200 mb-4">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              #{product.rank}
            </span>
            <span className="text-gray-500 text-sm">{product.category}</span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4" />
              <span>{product.upvotes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>{product.comments}</span>
            </div>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-3">{product.tagline}</p>
        <p className="text-sm text-gray-700 mb-4">{product.description}</p>
        
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <Lightbulb className="w-4 h-4 mr-1" />
            핵심 인사이트
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {product.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>

        {product.aiTech.used && (
          <div className="border-t pt-4">
            <button
              onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center">
                <Code className="w-4 h-4 mr-2 text-purple-600" />
                <span className="font-medium text-purple-600">AI 기술 상세 분석</span>
              </div>
              {expandedProduct === product.id ? 
                <ChevronUp className="w-4 h-4" /> : 
                <ChevronDown className="w-4 h-4" />
              }
            </button>
            
            {expandedProduct === product.id && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="mb-3">
                  <h5 className="font-medium text-gray-900 mb-2">사용된 AI 기술:</h5>
                  <div className="flex flex-wrap gap-2">
                    {product.aiTech.technologies.map((tech, idx) => (
                      <span key={idx} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">코드 예시:</h5>
                  <pre className="bg-gray-900 text-green-400 text-xs p-3 rounded overflow-x-auto max-h-64">
                    <code>{product.aiTech.codeExample}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="app">
      <header className="header">
        <h1>
          <TrendingUp />
          Product Hunt 분석기
        </h1>
      </header>

      <main className="main">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <span className="loading-text">Product Hunt 데이터를 가져오는 중...</span>
          </div>
        ) : error ? (
          <div className="error">
            <div className="error-content">
              <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="error-message">{error}</p>
                <button
                  onClick={loadTodaysProducts}
                  className="retry-button"
                >
                  다시 시도
                </button>
              </div>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="loading">
            <p className="loading-text">분석할 제품이 없습니다.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-content">
                  <div className="product-header">
                    <div>
                      <div className="product-badges">
                        <span className="badge badge-primary">
                          {product.period === 'yesterday' ? '어제' : 
                           product.period === 'lastWeek' ? '지난주' : '지난달'} {product.rank}위
                        </span>
                        <span className="badge badge-success">
                          {product.upvotes} upvotes
                        </span>
                      </div>
                      <h2 className="product-title">
                        <a 
                          href={product.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {product.name}
                          <ExternalLink className="w-4 h-4 ml-2 inline opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </h2>
                      <p className="product-tagline">{product.tagline}</p>
                      <p className="product-description">{product.description}</p>

                      <div className="product-meta">
                        <span className="badge badge-gray">
                          {product.category}
                        </span>
                        <span className="badge badge-gray">
                          {product.comments} comments
                        </span>
                        {product.website && (
                          <a
                            href={product.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="website-button"
                          >
                            웹사이트 방문
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {product.insights && (
                    <div className="insights">
                      <h3 className="insights-header">
                        <Brain />
                        AI 분석 인사이트
                      </h3>
                      <div className="insights-grid">
                        <div className="insight-card">
                          <h4 className="insight-title">성공 요인</h4>
                          <p className="insight-content">{product.insights.successFactors}</p>
                        </div>
                        <div className="insight-card">
                          <h4 className="insight-title">AI 기술 활용</h4>
                          <p className="insight-content">{product.insights.aiTechnology}</p>
                        </div>
                        <div className="insight-card">
                          <h4 className="insight-title">시장 트렌드</h4>
                          <p className="insight-content">{product.insights.marketTrends}</p>
                        </div>
                        <div className="insight-card">
                          <h4 className="insight-title">성장 전략</h4>
                          <p className="insight-content">{product.insights.growthStrategy}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductHuntAnalyzer;
