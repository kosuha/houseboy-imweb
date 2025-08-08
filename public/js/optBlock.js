// option_btn_tools
function moveOptionBtnTools() {
  const prodSelectedOptions = document.querySelector('#prod_selected_options').children;
  Array.from(prodSelectedOptions).forEach(e => {
    const areaTit = e.querySelector('.area_tit');
    const areaPrice = e.querySelector('.area_price');
    
    // 이미 이동되었는지 체크
    if (areaTit && areaPrice && !areaTit.contains(areaPrice)) {
      areaTit.appendChild(areaPrice);
    }
    
    // 정확한 닫기 버튼 선택 (absolute_right 클래스를 가진 a 태그)
    const closeBtn = e.querySelector('.area_tit a.absolute_right');
    const areaCount = e.querySelector('.area_count > .option_btn_wrap');

    if (closeBtn && areaCount && !areaCount.contains(closeBtn)) {
      areaCount.appendChild(closeBtn);
    }
  });
}

let isMoving = false;

// MutationObserver로 #prod_selected_options 변화 감지
const observer = new MutationObserver((mutations) => {
    if (isMoving) return; // 이동 중이면 무시
    
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            isMoving = true;
            requestAnimationFrame(() => {
                moveOptionBtnTools();
                isMoving = false;
            });
        }
    });
});

// 관찰 시작
const prodSelectedOptions = document.getElementById('prod_selected_options');
if (prodSelectedOptions) {
    observer.observe(prodSelectedOptions, {
        childList: true,
        subtree: true
    });
    
    // 초기 실행
    moveOptionBtnTools();
}