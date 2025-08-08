{
// CSS를 문자열로 정의
const cssString = `
  .opt_block {
  background: transparent !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.opt_product_area {
  display: flex;
  flex-direction: row;
}

.area_tit > span {
  font-size: 14px !important;
  color: #898989 !important
}

.area_tit.holder {
  flex: 1;
}

.area_price {
  position: relative;
  margin-top: 12px;
  top: 0;
}

.area_price > span {
  font-size: 14px;
  font-weight: bold;
}

.opt_product_area .area_tit:before {
  border: none !important;
}

.option_btn_wrap {
  display: flex;
  flex-direction: row;
}

.area_count > .option_btn_wrap > a {
  position: relative;
  margin-top: 16px;
  margin-left: 12px;
}

.opt_product_area > .area_count > .option_btn_wrap > .option_btn_tools > input {
  height: 30px !important;
  border: none !important;
}

.opt_product_area > .area_count > .option_btn_wrap > .option_btn_tools > a {
  font-size: 14px;
}

.goods_payment {
  border-top: 1px solid #eee;
  border-radius: 0;
  margin-top: 28px;
}

.goods_payment > .opt_block.bottom {
  border-top: 1px solid #eee;
  border-radius: 0;
}

.shop-content .goods_wrap > .goods_payment > .opt_block.bottom > p {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.shop-content .goods_wrap > .goods_payment > .opt_block.bottom > p > span:nth-child(1) {
  font-weight: bold;
}

.shop-content .goods_wrap > .goods_payment > .opt_block.bottom > p > span:nth-child(2) {
  font-size: 22px !important;
}
`;

// 스타일 태그를 생성하고 CSS를 삽입
const style = document.createElement('style');
style.type = 'text/css';
style.appendChild(document.createTextNode(cssString));

// 문서의 head에 스타일 태그를 추가
document.head.appendChild(style);


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
}