{
  const bannerData = [
    { message: '플러스친구하고,  브랜드 소식과 함께 10% 할인 받기 ➡️', link: 'https://pf.kakao.com/_bjGQxj' },
    { message: '오후 1시까지 주문하시면, 오늘 출발해요 🚛', link: 'https://pf.kakao.com/_bjGQxj' }
  ];

  function createBannerSlider() {
    const topBanner = document.createElement('div');
    topBanner.style.position = 'relative';
    topBanner.style.display = 'flex';
    topBanner.style.justifyContent = 'center';
    topBanner.style.alignItems = 'center';
    topBanner.style.width = '100%';
    topBanner.style.height = '28px';
    topBanner.style.backgroundColor = '#ffe14d';
    topBanner.style.zIndex = 'auto';

    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'banner-slider';
    sliderContainer.style.width = '100%';
    sliderContainer.style.height = '100%';

    const slidesContainer = document.createElement('div');
    slidesContainer.className = 'banner-slides';

    bannerData.forEach((data, index) => {
      const slide = document.createElement('div');
      slide.className = 'banner-slide';
      slide.innerText = data.message;
      slide.style.cursor = 'pointer';
      slide.dataset.link = data.link;
      slide.dataset.index = index;
      slidesContainer.appendChild(slide);
    });

    const firstSlideClone = slidesContainer.firstElementChild.cloneNode(true);
    slidesContainer.appendChild(firstSlideClone);

    sliderContainer.appendChild(slidesContainer);
    topBanner.appendChild(sliderContainer);

    sliderContainer.addEventListener('click', () => {
      const currentBannerData = bannerData[currentSlide];
      if (currentBannerData && currentBannerData.link) {
        window.open(currentBannerData.link, '_blank');
      }
    });

    let currentSlide = 0;
    
    setInterval(() => {
      currentSlide++;
      slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
      
      if (currentSlide === bannerData.length) {
        setTimeout(() => {
          slidesContainer.style.transition = 'none';
          currentSlide = 0;
          slidesContainer.style.transform = `translateX(0%)`;
          setTimeout(() => {
            slidesContainer.style.transition = 'transform 0.5s ease-in-out';
          }, 50);
        }, 500);
      }
    }, 3000);

    return topBanner;
  }

  const headerFixed = document.querySelector('header#doz_header_wrap > #doz_header > .new_fixed_header > #inline_header_fixed > .inline-section-wrap');
  const headerNormal = document.querySelector('header#doz_header_wrap > #doz_header > .new_org_header > #inline_header_normal > .inline-section-wrap');
  const headerMobile = document.querySelector('header#doz_header_wrap > #doz_header > .new_org_header > #inline_header_mobile');
  const headerMobileNav = document.querySelector('header#doz_header_wrap > #doz_header > .new_org_header > #inline_header_mobile > .inline-section-wrap');

  const topBannerFixed = createBannerSlider();
  headerFixed.insertAdjacentElement('afterbegin', topBannerFixed);

  const topBannerNormal = createBannerSlider();
  topBannerNormal.style.zIndex = '1';
  headerNormal.insertAdjacentElement('afterbegin', topBannerNormal);
  
  const topBannerMobile = createBannerSlider();
  if (headerMobile) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (mutation.target.className.includes('tansparent_bg')) {
            topBannerMobile.style.zIndex = '2000';
            topBannerMobile.style.position = 'fixed';
            topBannerMobile.style.top = '0px';
            topBannerMobile.style.marginLeft = '0px';
            topBannerMobile.style.width = '100%';
            topBannerMobile.style.left = '0px';
            headerMobileNav.style.marginTop = '28px';
          } else {
            topBannerMobile.style.zIndex = 'auto';
            topBannerMobile.style.position = 'relative';
            topBannerMobile.style.top = '';
            topBannerMobile.style.marginLeft = '';
            topBannerMobile.style.width = '100%';
            topBannerMobile.style.left = '';
          }
        }
      });
    });

    observer.observe(headerMobile, {
      attributes: true,
      attributeFilter: ['class']
    });
  }
  headerMobile.insertAdjacentElement('afterbegin', topBannerMobile);
}