const getProdData = async (prodId) => {
  try {
    const res = await fetch(`/ajax/oms/OMS_get_product.cm?prod_idx=${prodId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('상품 데이터 가져오기 실패:', error);
    return null;
  }
};

const getCategoryData = () => {
  /**
   * https://houseboy.imweb.me/admin/ajax/shop/prod_category_list.cm
   * 카테고리 수정 후 직접 이 링크에 들어가서 모든 데이터를 categoryData에 복사해와야함.
   */
  
  const categoryData = {
    msg: "SUCCESS",
    data: [
      {
        code: "s202001076e572e08e1f9d",
        parent_code: "s20231129bc961793ab87d",
        name: {
          u201911265ddc8ecc24cf2: "Class Shop",
          u20230424644653b1c7e3f: "Bathroom"
        },
        is_leaf_node: true,
        no: 1,
        sort_no: 0,
        permission: "guest",
        permission_group: [],
        menu_code: [],
        menu_url: []
      },
      {
        code: "s20231129bc961793ab87d",
        parent_code: "",
        name: {
          u20230424644653b1c7e3f: "Shop"
        },
        is_leaf_node: false,
        no: 4,
        sort_no: 0,
        permission: "guest",
        permission_group: [],
        menu_code: [],
        menu_url: []
      }
    ]
  }
  const categoryMap = {};
  categoryData.data.forEach(category => {
    const nameKeys = Object.keys(category.name);
    const latestKey = nameKeys[nameKeys.length - 1];
    categoryMap[category.code] = category.name[latestKey];
  });
  
  return categoryMap;
};

const initRecommendedProducts = async () => {
  const categoryData = getCategoryData();

  const recommendedProductsPositions = document.querySelectorAll(".houseboy-recommended-products-section");

  if (recommendedProductsPositions.length === 0) {
    console.warn('추천 상품 위치를 찾을 수 없습니다.');
    return;
  }

  for (const position of recommendedProductsPositions) {
    const recommended = document.createElement('div');
    recommended.classList.add('hb-recommended');

    const prodRecommendedContents = JSON.parse(position.dataset.prodRecommendedContent);
    if (!prodRecommendedContents) {
      console.warn('data-prod-recommended-content 속성이 없습니다.');
      continue;
    }

    const cardHTMLs = await Promise.all(prodRecommendedContents.map(async prodRecommendedContent => {
      const prodIdArray = prodRecommendedContent.productIds;
      const title = prodRecommendedContent.title;
      const subtitle = prodRecommendedContent.subtitle;
      const button = prodRecommendedContent.button;
      const buttonLink = prodRecommendedContent.buttonLink;
      const bannerImage = prodRecommendedContent.image;

      const productCardsHTML = await Promise.all(prodIdArray.map(async id => {
        const prodData = await getProdData(id);
        if (!prodData || !prodData.data || prodData.data.length === 0) {
          return `<span>상품 ${id} 로드 실패</span>`;
        }

        const product = prodData.data;
        const imageUrl = product.image_url ? Object.values(product.image_url)[0] : '';
        const categoryName = product.categories && product.categories.length > 0 
          ? categoryData[product.categories[0]] || '카테고리 없음' 
          : '카테고리 없음';

        return `
          <div class="hb-product-card" data-product-id="${id}" style="cursor: pointer;">
            <img src="${imageUrl}" alt="${product.name}" />
            <div class="hb-product-info">
              <h4>${product.name}</h4>
              <span class="hb-category">${categoryName}</span>
              <div class="hb-price">
                <span class="hb-price-current">${product.price.toLocaleString()}원</span>
                <span class="hb-price-org">${product.price_org.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        `;
      }));

      // 모바일에서 2개씩 그룹화
      const isMobile = window.innerWidth <= 768;
      let productSlidesHTML = '';
      
      if (isMobile) {
        const productPairs = [];
        for (let i = 0; i < productCardsHTML.length; i += 2) {
          productPairs.push(productCardsHTML.slice(i, i + 2));
        }
        
        productSlidesHTML = productPairs.map(pair => `
          <div class="hb-product-slide">
            ${pair.join('')}
          </div>
        `).join('');
      }

      const cardHTML = `
        <div class="hb-recommended-card">
          <div class="hb-card-header" style="background-image: url('${bannerImage}');">
            <h3>${title}</h3>
            <p>${subtitle}</p>
            <button onclick="location.href='${buttonLink}'">
              <span>${button}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <div class="hb-products-container ${isMobile ? 'mobile-slider' : ''}">
            ${isMobile ? productSlidesHTML : productCardsHTML.join('')}
          </div>
        </div>
      `;
      return cardHTML;
    }));

    const sectionHTML = `
      <div class="hb-recommended-products">
        <div class="hb-swiper-container">
          <div class="hb-swiper-wrapper">
            ${cardHTMLs.map(cardHTML => `<div class="hb-swiper-slide">${cardHTML}</div>`).join('')}
          </div>
          <div class="hb-swiper-pagination"></div>
        </div>
      </div>
    `;

    recommended.innerHTML = sectionHTML;
    position.appendChild(recommended);

    // 데스크톱에서는 기존 스와이프, 모바일에서는 상품 슬라이더
    if (window.innerWidth > 768) {
      const swiperContainer = recommended.querySelector('.hb-swiper-container');
      initSwiper(swiperContainer);
    } else {
      // 모바일 상품 슬라이더 초기화
      const mobileSliders = recommended.querySelectorAll('.mobile-slider');
      mobileSliders.forEach(slider => initMobileProductSlider(slider));
    }
  }
};

const initSwiper = (container) => {
  const wrapper = container.querySelector('.hb-swiper-wrapper');
  const slides = wrapper.querySelectorAll('.hb-swiper-slide');
  const pagination = container.querySelector('.hb-swiper-pagination');
  
  let currentIndex = 0;
  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  let initialTransform = 0;
  let hasMoved = false;
  
  // 페이지네이션 생성
  slides.forEach((_, index) => {
    const dot = document.createElement('span');
    dot.classList.add('hb-pagination-dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    pagination.appendChild(dot);
  });
  
  const updateSlidePosition = (immediate = false) => {
    wrapper.style.transition = immediate ? 'none' : 'transform 0.3s ease';
    wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // 페이지네이션 업데이트
    pagination.querySelectorAll('.hb-pagination-dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  };
  
  const goToSlide = (index) => {
    currentIndex = Math.max(0, Math.min(index, slides.length - 1));
    updateSlidePosition();
  };
  
  // 상품 카드 클릭 이벤트 처리
  container.addEventListener('click', (e) => {
    if (hasMoved) return; // 스와이프 동작이 있었으면 클릭 무시
    
    const productCard = e.target.closest('.hb-product-card');
    if (productCard) {
      const productId = productCard.dataset.productId;
      location.href = `/shop_view/?idx=${productId}`;
    }
  });

  // 터치 이벤트
  container.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    currentX = startX;
    isDragging = true;
    hasMoved = false;
    initialTransform = currentIndex * 100;
    wrapper.style.transition = 'none';
  });
  
  container.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    currentX = e.touches[0].clientX;
    const diffX = startX - currentX;
    
    // 움직임이 감지되면 hasMoved를 true로 설정
    if (Math.abs(diffX) > 10) {
      hasMoved = true;
    }
    
    const containerWidth = container.offsetWidth;
    const movePercent = (diffX / containerWidth) * 100;
    
    // 실시간으로 슬라이드 이동
    const newTransform = initialTransform + movePercent;
    wrapper.style.transform = `translateX(-${newTransform}%)`;
  });
  
  container.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    const containerWidth = container.offsetWidth;
    
    // 30% 이상 이동하거나 빠르게 스와이프한 경우 슬라이드 전환
    const threshold = containerWidth * 0.3;
    
    if (Math.abs(diffX) > threshold || Math.abs(diffX) > 50) {
      if (diffX > 0 && currentIndex < slides.length - 1) {
        goToSlide(currentIndex + 1);
      } else if (diffX < 0 && currentIndex > 0) {
        goToSlide(currentIndex - 1);
      } else {
        updateSlidePosition(); // 원래 위치로 복귀
      }
    } else {
      updateSlidePosition(); // 원래 위치로 복귀
    }
    
    isDragging = false;
    
    // 짧은 지연 후 hasMoved 리셋 (클릭 이벤트 처리를 위해)
    setTimeout(() => {
      hasMoved = false;
    }, 100);
  });
  
  // 마우스 이벤트 (데스크톱)
  container.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    currentX = startX;
    isDragging = true;
    hasMoved = false;
    initialTransform = currentIndex * 100;
    wrapper.style.transition = 'none';
    e.preventDefault();
  });
  
  container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    currentX = e.clientX;
    const diffX = startX - currentX;
    
    // 움직임이 감지되면 hasMoved를 true로 설정
    if (Math.abs(diffX) > 10) {
      hasMoved = true;
    }
    
    const containerWidth = container.offsetWidth;
    const movePercent = (diffX / containerWidth) * 100;
    
    // 실시간으로 슬라이드 이동
    const newTransform = initialTransform + movePercent;
    wrapper.style.transform = `translateX(-${newTransform}%)`;
  });
  
  container.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    
    const endX = e.clientX;
    const diffX = startX - endX;
    const containerWidth = container.offsetWidth;
    
    // 30% 이상 이동하거나 빠르게 스와이프한 경우 슬라이드 전환
    const threshold = containerWidth * 0.3;
    
    if (Math.abs(diffX) > threshold || Math.abs(diffX) > 50) {
      if (diffX > 0 && currentIndex < slides.length - 1) {
        goToSlide(currentIndex + 1);
      } else if (diffX < 0 && currentIndex > 0) {
        goToSlide(currentIndex - 1);
      } else {
        updateSlidePosition(); // 원래 위치로 복귀
      }
    } else {
      updateSlidePosition(); // 원래 위치로 복귀
    }
    
    isDragging = false;
    
    // 짧은 지연 후 hasMoved 리셋 (클릭 이벤트 처리를 위해)
    setTimeout(() => {
      hasMoved = false;
    }, 100);
  });
  
  container.addEventListener('mouseleave', () => {
    if (isDragging) {
      updateSlidePosition(); // 원래 위치로 복귀
      isDragging = false;
      setTimeout(() => {
        hasMoved = false;
      }, 100);
    }
  });
};

initRecommendedProducts();