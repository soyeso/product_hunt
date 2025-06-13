const PRODUCT_HUNT_API_BASE = 'https://api.producthunt.com/v2/api/graphql';

export class ProductHuntService {
  constructor() {
    this.apiKey = process.env.REACT_APP_PRODUCT_HUNT_TOKEN;
    if (!this.apiKey) {
      console.error('Product Hunt API 토큰이 설정되지 않았습니다.');
    }
  }

  async getSelectedProducts() {
    try {
      if (!this.apiKey) {
        throw new Error('Product Hunt API 토큰이 필요합니다.');
      }

      // 어제, 지난주, 지난달의 제품들을 가져오는 쿼리
      const query = `
        query {
          yesterday: posts(first: 1, postedAfter: "${this.getDateString(1)}", postedBefore: "${this.getDateString(0)}", order: VOTES) {
            edges {
              node {
                id
                name
                tagline
                description
                votesCount
                commentsCount
                createdAt
                website
                thumbnail {
                  url
                }
                topics {
                  edges {
                    node {
                      name
                    }
                  }
                }
              }
            }
          }
          lastWeek: posts(first: 2, postedAfter: "${this.getDateString(7)}", postedBefore: "${this.getDateString(1)}", order: VOTES) {
            edges {
              node {
                id
                name
                tagline
                description
                votesCount
                commentsCount
                createdAt
                website
                thumbnail {
                  url
                }
                topics {
                  edges {
                    node {
                      name
                    }
                  }
                }
              }
            }
          }
          lastMonth: posts(first: 3, postedAfter: "${this.getDateString(30)}", postedBefore: "${this.getDateString(7)}", order: VOTES) {
            edges {
              node {
                id
                name
                tagline
                description
                votesCount
                commentsCount
                createdAt
                website
                thumbnail {
                  url
                }
                topics {
                  edges {
                    node {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response = await fetch(PRODUCT_HUNT_API_BASE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(`API 에러: ${data.errors[0].message}`);
      }

      return this.processSelectedProducts(data);
    } catch (error) {
      console.error('Product Hunt API Error:', error);
      throw error;
    }
  }

  getDateString(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  }

  processSelectedProducts(data) {
    if (!data.data) {
      throw new Error('API 응답 형식이 올바르지 않습니다.');
    }

    const products = [];
    const yesterdayProduct = data.data.yesterday.edges[0]?.node;
    const lastWeekProducts = data.data.lastWeek.edges.map(edge => edge.node);
    const lastMonthProducts = data.data.lastMonth.edges.map(edge => edge.node);

    // 어제의 1위 제품이 600표를 넘었는지 확인
    if (yesterdayProduct && yesterdayProduct.votesCount >= 600) {
      products.push(this.formatProduct(yesterdayProduct, 'yesterday'));
    }

    // 지난주 1, 2위 제품 추가
    lastWeekProducts.forEach((product, index) => {
      products.push(this.formatProduct(product, 'lastWeek', index + 1));
    });

    // 지난달 제품 추가 (어제 1위가 600표를 넘지 않았다면 3개, 넘었다면 2개)
    const monthProductsToAdd = yesterdayProduct && yesterdayProduct.votesCount >= 600 ? 2 : 3;
    lastMonthProducts.slice(0, monthProductsToAdd).forEach((product, index) => {
      products.push(this.formatProduct(product, 'lastMonth', index + 1));
    });

    return products;
  }

  formatProduct(product, period, rank) {
    return {
      id: product.id,
      name: product.name,
      tagline: product.tagline,
      description: product.description,
      rank: rank || 1,
      upvotes: product.votesCount,
      comments: product.commentsCount,
      category: product.topics.edges[0]?.node.name || 'General',
      website: product.website,
      thumbnail: product.thumbnail?.url,
      createdAt: product.createdAt,
      period: period
    };
  }
}