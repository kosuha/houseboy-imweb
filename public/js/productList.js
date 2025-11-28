(() => {
  console.log('상품 리스트 섹션 로드됨');

  const SECTION_SELECTOR = '.houseboy-products-list-section';
  const PRODUCT_ENDPOINT = '/ajax/oms/OMS_get_product.cm?prod_idx=';
  const productCache = new Map();

  const getCategoryData = () => {
    /**
     * https://houseboy.imweb.me/admin/ajax/shop/prod_category_list.cm
     * 카테고리 수정 후 직접 이 링크에 들어가서 모든 데이터를 categoryData에 복사해와야함.
     */
    const categoryData = {
      msg: "SUCCESS",
      data: []
    };

    return categoryData.data.reduce((acc, category) => {
      const nameKeys = Object.keys(category.name);
      const latestKey = nameKeys[nameKeys.length - 1];
      acc[category.code] = category.name[latestKey];
      return acc;
    }, {});
  };

  const normalizeImageWidth = (url) => {
    if (!url) return '';
    return url.replace(/([?&]w=)(\d+)/, (_, prefix) => `${prefix}800`);
  };

  const fetchProduct = async (productId) => {
    if (productCache.has(productId)) {
      return productCache.get(productId);
    }

    try {
      const response = await fetch(`${PRODUCT_ENDPOINT}${productId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: '*/*',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      const product = json?.data;

      if (!product) {
        throw new Error('상품 데이터 없음');
      }

      productCache.set(productId, product);
      return product;
    } catch (error) {
      console.error(`상품 ${productId} 데이터 가져오기 실패:`, error);
      productCache.set(productId, null);
      return null;
    }
  };

  const formatPrice = (value) => {
    if (value === undefined || value === null) return '';

    const numericValue = typeof value === 'number' ? value : Number(value);

    if (Number.isNaN(numericValue)) return '';

    return numericValue.toLocaleString('ko-KR');
  };

  const createProductCardHTML = (product, productId, categoryMap, explicitCategoryName) => {
    if (!product) return '';

    const rawImageUrl = product.image_url ? Object.values(product.image_url)[0] : '';
    const imageUrl = normalizeImageWidth(rawImageUrl);
    const primaryCategoryCode = Array.isArray(product.categories) && product.categories.length > 0
      ? product.categories[0]
      : null;
    const fallbackCategoryName = primaryCategoryCode ? (categoryMap[primaryCategoryCode] || '카테고리 없음') : '카테고리 없음';
    const categoryName = explicitCategoryName || fallbackCategoryName;
    const isSoldOut = typeof product.prod_soldout_status === 'string'
      && product.prod_soldout_status.toLowerCase() === 'soldout';
    const currentPrice = formatPrice(product.price);
    const originalPrice = formatPrice(product.price_org);

    const priceHTML = [
      currentPrice ? `<span class="hb-price-current">${currentPrice}원</span>` : '',
      originalPrice ? `<span class="hb-price-org">${originalPrice}원</span>` : ''
    ].filter(Boolean).join('');

    return `
      <a class="hb-product-card" data-product-id="${productId}" style="cursor: pointer;" href="/shop_view/?idx=${productId}">
        <div class="hb-product-image${isSoldOut ? ' hb-product-image--soldout' : ''}">
          <img src="${imageUrl}" alt="${product.name || ''}" loading="lazy" />
          ${isSoldOut ? '<span class="hb-product-soldout">SOLD OUT</span>' : ''}
        </div>
        <div class="hb-product-info">
          <h4>${product.name || '상품명 미정'}</h4>
          <span class="hb-category">${categoryName}</span>
          <div class="hb-price">${priceHTML}</div>
        </div>
      </a>
    `;
  };

  const parseProductEntries = (section) => {
    try {
      const { prodListContent } = section.dataset;
      if (!prodListContent) return [];
      const parsed = JSON.parse(prodListContent);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .map((item) => {
          if (Array.isArray(item) && item.length > 0) {
            const [productId, categoryName] = item;
            return {
              productId,
              categoryName: typeof categoryName === 'string' ? categoryName : null
            };
          }

          return {
            productId: item,
            categoryName: null
          };
        })
        .filter(({ productId }) => productId !== undefined && productId !== null);
    } catch (error) {
      console.error('상품 리스트 데이터 파싱 실패:', error);
      return [];
    }
  };

  const renderProductSections = async () => {
    const sections = document.querySelectorAll(SECTION_SELECTOR);
    if (!sections.length) return;

    const categoryMap = getCategoryData();

    for (const section of sections) {
      const productEntries = parseProductEntries(section);
      if (!productEntries.length) continue;

      const cardsHTML = (await Promise.all(productEntries.map(async ({ productId, categoryName }) => {
        const product = await fetchProduct(productId);
        return createProductCardHTML(product, productId, categoryMap, categoryName);
      }))).filter(Boolean);

      const container = document.createElement('div');
      container.classList.add('hb-product-list', 'hb-section');

      if (!cardsHTML.length) {
        container.innerHTML = '<p class="hb-product-list-empty">상품 정보를 불러오지 못했습니다.</p>';
        section.innerHTML = '';
        section.appendChild(container);
        continue;
      }

      container.innerHTML = `
        <div class="hb-product-list-grid">
          ${cardsHTML.join('')}
        </div>
      `;

      section.innerHTML = '';
      section.appendChild(container);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderProductSections);
  } else {
    renderProductSections();
  }
})();
