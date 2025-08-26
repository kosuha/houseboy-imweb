// VReview API 함수들
const getVReviews = async (count) => {
  if (count > 24) {
    console.error('리뷰 최대 24개까지 요청 가능.');
    return { results: [] };
  }
  
  try {
    const res = await fetch(
      `https://one.vreview.tv/api/embed/v2/d078aac4-6258-4061-bdbe-d93ab978f521/reviews?offset=0&limit=${count}&ordering=-helpful_count&expand=created_at%2Cproduct%2Crating`,
      {
        referrerPolicy: 'no-referrer',
        headers: { 'Accept': 'application/json' }
      }
    );
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('리뷰 가져오기 실패:', error);
    return { results: [] };
  }
};

const getVReviewData = async (reviewId) => {
  try {
    const res = await fetch(
      `https://one.vreview.tv/api/embed/v2/d078aac4-6258-4061-bdbe-d93ab978f521/reviews/${reviewId}`,
      {
        referrerPolicy: 'no-referrer',
        headers: { 'Accept': 'application/json' }
      }
    );
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('리뷰 데이터 가져오기 실패:', error);
    return null;
  }
};

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

// 메인 실행 함수
const initReviewSlider = async () => {
  try {
    const newReviewPosition = document.querySelector(".houseboy-slide-review-section");
    
    if (!newReviewPosition) {
      console.warn('리뷰 위치를 찾을 수 없습니다.');
      return;
    }
    
    const review = document.createElement('div');
    review.classList.add('hb-review');
    
    // 모든 리뷰 데이터를 병렬로 가져오기
    const reviewData = JSON.parse(newReviewPosition.dataset.reviews);
    if (!Array.isArray(reviewData)) {
      console.warn('리뷰 데이터 형식이 올바르지 않습니다.');
      return;
    }
    const reviewPromises = reviewData.map(async (item, index) => {
      const vReview = await getVReviewData(item.id);
      
      if (!vReview) return '';
      
      console.log('리뷰 데이터:', vReview);
      
      // 이미지와 텍스트가 있는 경우만 카드 생성
      if (vReview.media_contents && 
          vReview.media_contents[0] && 
          vReview.media_contents[0].type === 'image' && 
          vReview.text) {
        
        // XSS 방지를 위한 기본적인 텍스트 이스케이핑
        const escapeHtml = (text) => {
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        };
        
        // 아이콘 HTML 생성 (좌표가 있는 경우만)
        let iconHtml = '';
        let productCardHtml = '';
        
        if (item.iconPosition) {
          const { x, y } = item.iconPosition;
          
          // 상품 정보가 있으면 미리 카드 HTML 생성
          if (vReview.product_origin_id) {
            // 상품 데이터 미리 가져오기
            const productData = await getProdData(vReview.product_origin_id);
            
            if (productData && productData.msg === 'SUCCESS') {
              const product = productData.data;
              const discountRate = Math.round((1 - product.price / product.price_org) * 100);
              
              productCardHtml = `
                <div class='hb-product-mini-card' key=${index} data-product-id='${vReview.product_origin_id}' style='display: none;'>
                  <img src='${product.image_url[product.images[0]]}' alt='${product.name}' class='hb-product-mini-image' />
                  <div class='hb-product-mini-info'>
                    <div class='hb-product-mini-name'>${product.name}</div>
                    <div class='hb-product-mini-price'>
                      <span class='hb-product-mini-price-current'>${product.price.toLocaleString()}원</span>
                      ${product.price_org > product.price ? `
                        <span class='hb-product-mini-price-original'>${product.price_org.toLocaleString()}원</span>
                      ` : ''}
                    </div>
                  </div>
                </div>
              `;
            }
          }
          
          iconHtml = `
            <div class='hb-review-icon' 
              key=${index}
              style='left: ${x}%; top: ${y}%;'
              data-product-id='${vReview.product_origin_id || ''}'
            >
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <circle cx='12' cy='12' r='11' fill='#212121' stroke='#333' stroke-width='1'/>
                <path d='M12 6v12M6 12h12' stroke='white' stroke-width='2' stroke-linecap='round'/>
              </svg>
              ${productCardHtml}
            </div>
          `;
        }
        
        return `
          <div class='hb-review-card'>
            <div class='hb-review-thumbnail-image-wrap'>
              <img 
                class='hb-review-thumbnail-image'
                src='${vReview.media_contents[0].urls.origin}' 
                alt='리뷰 이미지'
                loading='lazy'
                draggable='false'
                onerror="this.style.display='none'"
              />
              ${iconHtml}
            </div>
            <span class='hb-review-comment'>
              ${escapeHtml(vReview.text)}
            </span>
          </div>
        `;
      }
      
      return '';
    });
    
    // Promise.all로 모든 비동기 작업 완료 대기
    const reviewContent = await Promise.all(reviewPromises);
    
    // 빈 문자열 필터링
    const filteredContent = reviewContent.filter(content => content);
    
    if (filteredContent.length === 0) {
      console.warn('표시할 리뷰가 없습니다.');
      return;
    }
    
    // HTML 삽입
    review.innerHTML = `
      <div class='hb-review-container'>
        <div class='hb-review-content-wrap'>
          <h3 class='hb-review-title'>하우스보이와 함께하는 온라인 집들이 🏠</h3>
          <div class='hb-review-content'>
            ${filteredContent.join('')}
          </div>
        </div>
      </div>
    `;
    
    // DOM에 추가
    newReviewPosition.appendChild(review);

    // 슬라이더 기능 초기화
    const slider = review.querySelector('.hb-review-content');
    
    // 이미지 드래그 방지
    review.querySelectorAll('.hb-review-thumbnail-image').forEach(img => {
      img.addEventListener('dragstart', (e) => {
        e.preventDefault();
      });
    });
    
    if (slider) {
      let isDown = false;
      let startX;
      let scrollLeft;
      
      // 마우스 이벤트
      slider.addEventListener('mousedown', (e) => {
        // 아이콘이나 상품 카드 클릭 시 드래그 방지
        if (e.target.closest('.hb-review-icon') || e.target.closest('.hb-product-mini-card')) return;
        
        isDown = true;
        slider.classList.add('grabbing');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
      });
      
      slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('grabbing');
      });
      
      slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('grabbing');
      });
      
      slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.5;
        slider.scrollLeft = scrollLeft - walk;
      });
      
      // 터치 이벤트 (모바일 지원)
      slider.addEventListener('touchstart', (e) => {
        if (e.target.closest('.hb-review-icon') || e.target.closest('.hb-product-mini-card')) return;
        
        isDown = true;
        slider.classList.add('grabbing');
        startX = e.touches[0].pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
      }, { passive: true });
      
      slider.addEventListener('touchend', () => {
        isDown = false;
        slider.classList.remove('grabbing');
      });
      
      slider.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.5;
        slider.scrollLeft = scrollLeft - walk;
      }, { passive: true });
    }
    
    // 아이콘 클릭 이벤트 - 카드 토글
    review.querySelectorAll('.hb-review-icon').forEach((icon) => {
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // 현재 열려있는 다른 카드들 모두 닫기
        document.querySelectorAll('.hb-product-mini-card').forEach(card => {
          if (icon.getAttribute('key') !== card.getAttribute('key') && card.style.display === 'flex') {
            card.style.display = 'none';
          }
        });
        
        // 해당 아이콘의 카드 찾기
        const wrapper = icon.closest('.hb-review-thumbnail-image-wrap');
        const card = wrapper.querySelector('.hb-product-mini-card');
        
        if (card) {
          // 토글
          if (card.style.display === 'flex') {
            card.style.display = 'none';
          } else {
            card.style.display = 'flex';
          }
        }
      });
    });
    
    // 상품 카드 클릭 이벤트
    review.querySelectorAll('.hb-product-mini-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = card.getAttribute('data-product-id');
        // 상품 페이지로 이동 (실제 상품 페이지 URL 구조에 맞게 수정)
        window.location.href = `/shop_view/?idx=${productId}`;
      });
    });
    
    // 외부 클릭 시 모든 카드 닫기
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.hb-review-icon') && !e.target.closest('.hb-product-mini-card')) {
        document.querySelectorAll('.hb-product-mini-card').forEach(card => {
          card.style.display = 'none';
        });
      }
    });
    
    console.log('리뷰 슬라이더 초기화 완료');
    
  } catch (error) {
    console.error('리뷰 슬라이더 초기화 실패:', error);
  }
};

initReviewSlider();