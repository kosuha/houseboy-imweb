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
      
      // vReview 데이터를 전역으로 저장해서 나중에 모달에서 사용
      if (!window.vReviewsData) {
        window.vReviewsData = {};
      }
      if (vReview) {
        window.vReviewsData[item.id] = vReview;
      }
      
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
          <div class='hb-review-card' data-review-id='${item.id}'>
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
      let hasDragged = false; // 드래그 여부 추적
      
      // 마우스 이벤트
      slider.addEventListener('mousedown', (e) => {
        // 아이콘이나 상품 카드, 리뷰 이미지 클릭 시 드래그 방지
        if (e.target.closest('.hb-review-icon') || 
            e.target.closest('.hb-product-mini-card') || 
            e.target.closest('.hb-review-thumbnail-image')) return;
        
        isDown = true;
        hasDragged = false;
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
        
        // 일정 거리 이상 움직인 경우만 드래그로 판단
        if (Math.abs(walk) > 5) {
          hasDragged = true;
          slider.scrollLeft = scrollLeft - walk;
        }
      });
      
      // 터치 이벤트 (모바일 지원)
      slider.addEventListener('touchstart', (e) => {
        if (e.target.closest('.hb-review-icon') || 
            e.target.closest('.hb-product-mini-card') || 
            e.target.closest('.hb-review-thumbnail-image')) return;
        
        isDown = true;
        hasDragged = false;
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
        
        // 일정 거리 이상 움직인 경우만 드래그로 판단
        if (Math.abs(walk) > 5) {
          hasDragged = true;
          slider.scrollLeft = scrollLeft - walk;
        }
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
    
    // 리뷰 이미지 클릭 이벤트 - 모달 열기
    review.querySelectorAll('.hb-review-thumbnail-image').forEach((img) => {
      let clickStartX, clickStartY;
      let isDragging = false;
      
      img.addEventListener('mousedown', (e) => {
        clickStartX = e.pageX;
        clickStartY = e.pageY;
        isDragging = false;
        
        const mouseMoveHandler = (moveEvent) => {
          const deltaX = Math.abs(moveEvent.pageX - clickStartX);
          const deltaY = Math.abs(moveEvent.pageY - clickStartY);
          if (deltaX > 5 || deltaY > 5) {
            isDragging = true;
          }
        };
        
        const mouseUpHandler = () => {
          document.removeEventListener('mousemove', mouseMoveHandler);
          document.removeEventListener('mouseup', mouseUpHandler);
        };
        
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
      });
      
      img.addEventListener('click', (e) => {
        if (isDragging) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        
        e.stopPropagation();
        
        // 리뷰 카드에서 리뷰 ID 가져오기
        const reviewCard = img.closest('.hb-review-card');
        const reviewId = reviewCard.getAttribute('data-review-id');
        
        console.log('이미지 클릭됨, 리뷰 ID:', reviewId);
        
        // 저장된 vReview 데이터 가져오기
        if (window.vReviewsData && window.vReviewsData[reviewId]) {
          console.log('모달 열기');
          openReviewModal(window.vReviewsData[reviewId]);
        } else {
          console.log('리뷰 데이터 없음');
        }
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

// 모달 생성 함수
const createReviewModal = () => {
  const modal = document.createElement('div');
  modal.id = 'hb-review-modal';
  modal.innerHTML = `
    <div class="hb-modal-backdrop" id="hb-modal-backdrop">
      <div class="hb-modal-content-wrapper">
        <div class="hb-modal-header">
          <p class="hb-modal-title">리뷰 상세 보기</p>
          <div class="hb-modal-close" id="hb-modal-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
              <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
            </svg>
          </div>
        </div>
        <div class="hb-modal-body">
          <div class="hb-modal-product-info">
            <img class="hb-modal-product-image" src="" alt="">
            <div class="hb-modal-product-details">
              <p class="hb-modal-product-name"></p>
              <p class="hb-modal-product-rating"></p>
            </div>
          </div>
          <div class="hb-modal-image-section">
            <div class="hb-modal-main-image">
              <img class="hb-modal-current-image" src="" alt="">
            </div>
            <div class="hb-modal-thumbnail-container">
              <div class="hb-modal-thumbnails"></div>
            </div>
          </div>
          <div class="hb-modal-user-info">
            <div class="hb-modal-user-details">
              <p class="hb-modal-username"></p>
            </div>
            <div class="hb-modal-user-attributes"></div>
            <p class="hb-modal-purchase-options"></p>
          </div>
          <div class="hb-modal-review-content">
            <div class="hb-modal-rating-section">
              <div class="hb-modal-stars"></div>
              <div class="hb-modal-questions"></div>
            </div>
            <p class="hb-modal-review-text"></p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // body가 아닌 다른 위치에 추가 시도
  const targetContainer = document.querySelector('.houseboy-slide-review-section') || document.querySelector('.hb-review');
  if (targetContainer) {
    targetContainer.appendChild(modal);
    console.log('모달이 DOM에 추가됨:', modal);
    console.log('추가된 위치:', targetContainer);
  } else {
    document.body.appendChild(modal);
    console.log('모달이 body에 추가됨 (fallback)');
  }
  
  return modal;
};

// 모달 열기 함수
const openReviewModal = (vReview) => {
  console.log('openReviewModal 호출됨:', vReview);
  
  let modal = document.getElementById('hb-review-modal');
  if (!modal) {
    console.log('모달이 없어서 새로 생성');
    modal = createReviewModal();
  }
  
  // 데이터 채우기
  populateModalData(modal, vReview);
  
  // 모달 보이기
  console.log('모달 표시하기');
  console.log('모달 요소:', modal);
  console.log('모달 현재 스타일:', {
    display: modal.style.display,
    visibility: modal.style.visibility,
    opacity: modal.style.opacity,
    zIndex: getComputedStyle(modal).zIndex
  });
  
  modal.style.setProperty('display', 'block', 'important');
  modal.style.setProperty('visibility', 'visible', 'important');
  modal.style.setProperty('opacity', '1', 'important');
  modal.style.setProperty('z-index', '99999', 'important');
  document.body.style.overflow = 'hidden';
  
  console.log('모달 스타일 설정 후:', {
    display: modal.style.display,
    visibility: modal.style.visibility,
    opacity: modal.style.opacity,
    zIndex: modal.style.zIndex
  });
  
  // 모달이 실제로 DOM에 있는지 확인
  console.log('DOM에서 모달 찾기:', document.getElementById('hb-review-modal'));
  console.log('모달의 computed style:', getComputedStyle(modal));
  
  // 닫기 이벤트 설정
  const closeBtn = modal.querySelector('#hb-modal-close');
  const backdrop = modal.querySelector('#hb-modal-backdrop');
  
  const closeModal = () => {
    console.log('모달 닫기');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  };
  
  closeBtn.onclick = closeModal;
  backdrop.onclick = (e) => {
    // 백드롭 자체를 클릭했을 때만 닫기 (모달 내용 클릭 시에는 닫지 않음)
    if (e.target === backdrop) {
      closeModal();
    }
  };
  
  // ESC 키로 닫기
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
};

// 모달 데이터 채우기 함수
const populateModalData = async (modal, vReview) => {
  try {
    // 상품 정보 채우기
    if (vReview.product) {
      const productImg = modal.querySelector('.hb-modal-product-image');
      const productName = modal.querySelector('.hb-modal-product-name');
      const productRating = modal.querySelector('.hb-modal-product-rating');
      
      productImg.src = vReview.product.image_url_recorded;
      productName.textContent = vReview.product.name;
      productRating.textContent = `★ ${vReview.product.total_rating_average} (${vReview.product.review_total_count})`;
      
      // 상품 이름 클릭 시 상품 페이지 새창으로 열기
      productName.style.cursor = 'pointer';
      productName.addEventListener('click', () => {
        const productUrl = `/shop_view/?idx=${vReview.product.remote_id}`;
        window.open(productUrl, '_blank');
      });
      
      // 상품 이미지 클릭 시에도 상품 페이지 새창으로 열기
      productImg.style.cursor = 'pointer';
      productImg.addEventListener('click', () => {
        const productUrl = `/shop_view/?idx=${vReview.product.remote_id}`;
        window.open(productUrl, '_blank');
      });
    }
    
    // 이미지 섹션 채우기
    if (vReview.media_contents && vReview.media_contents.length > 0) {
      const mainImage = modal.querySelector('.hb-modal-current-image');
      const thumbnailsContainer = modal.querySelector('.hb-modal-thumbnails');
      
      // 첫 번째 이미지를 메인으로 설정
      mainImage.src = vReview.media_contents[0].urls.origin;
      
      // 썸네일들 생성
      thumbnailsContainer.innerHTML = '';
      vReview.media_contents.forEach((media, index) => {
        if (media.type === 'image') {
          const thumbnail = document.createElement('div');
          thumbnail.className = `hb-modal-thumbnail ${index === 0 ? 'active' : ''}`;
          thumbnail.innerHTML = `<img src="${media.urls.origin}" alt="">`;
          
          thumbnail.addEventListener('click', () => {
            // 기존 active 제거
            modal.querySelectorAll('.hb-modal-thumbnail').forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
            
            // 메인 이미지 변경
            mainImage.src = media.urls.origin;
          });
          
          thumbnailsContainer.appendChild(thumbnail);
        }
      });
    }
    
    // 사용자 정보 채우기
    const username = modal.querySelector('.hb-modal-username');
    const userAttributes = modal.querySelector('.hb-modal-user-attributes');
    const purchaseOptions = modal.querySelector('.hb-modal-purchase-options');
    
    username.textContent = vReview.user_nickname;
    
    // 사용자 속성들 채우기
    userAttributes.innerHTML = '';
    if (vReview.questions) {
      const userInfoQuestions = vReview.questions.filter(q => q.question_type === 'userinfo');
      userInfoQuestions.forEach((question, index) => {
        const attr = document.createElement('span');
        attr.className = 'hb-modal-user-attribute';
        attr.innerHTML = `${index > 0 ? '<span class="mx-1">·</span>' : ''}<b>${question.question} </b>${question.answer}`;
        userAttributes.appendChild(attr);
      });
    }
    
    // 구매 옵션 채우기
    if (vReview.selected_options) {
      const options = vReview.selected_options.map(opt => `${opt.name}: ${opt.value}`).join(' / ');
      purchaseOptions.textContent = `구매옵션: ${options}`;
    }
    
    // 별점 채우기
    const starsContainer = modal.querySelector('.hb-modal-stars');
    starsContainer.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const star = document.createElement('svg');
      star.className = 'hb-modal-star';
      star.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
          <path d="M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z"></path>
        </svg>
      `;
      if (i < vReview.rating) {
        star.style.color = '#ffc107';
      } else {
        star.style.color = '#e0e0e0';
      }
      starsContainer.appendChild(star);
    }
    
    // 질문들 채우기
    const questionsContainer = modal.querySelector('.hb-modal-questions');
    questionsContainer.innerHTML = '';
    if (vReview.questions) {
      const statisticalQuestions = vReview.questions.filter(q => q.question_type === 'statistical');
      statisticalQuestions.forEach(question => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'hb-modal-question';
        questionDiv.innerHTML = `
          <span class="hb-modal-question-label">${question.question}</span>
          <span class="hb-modal-question-answer">${question.answer}</span>
        `;
        questionsContainer.appendChild(questionDiv);
      });
    }
    
    // 리뷰 텍스트 채우기
    const reviewText = modal.querySelector('.hb-modal-review-text');
    reviewText.textContent = vReview.text;
    
  } catch (error) {
    console.error('모달 데이터 채우기 실패:', error);
  }
};