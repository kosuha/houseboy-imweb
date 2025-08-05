// 선택된 상품들과 일치하는 버튼을 활성화하는 함수
function updateButtonStates() {
  const selectedOptions = Array.from(document.querySelectorAll('#prod_selected_options .opt_block'))
    .filter(element => !element.classList.contains('total') && !element.classList.contains('bottom'));
  const allButtons = document.querySelectorAll('.option-button');
  
  // 모든 버튼 선택 해제
  allButtons.forEach(btn => btn.classList.remove('active'));
  
  selectedOptions.forEach(selectedOption => {
    const fullText = selectedOption.querySelector('.area_tit span').textContent.trim();
    // ": " 뒤의 실제 옵션 이름만 추출
    const colonIndex = fullText.lastIndexOf(':');
    const optionText = fullText.substring(colonIndex + 2).trim();
    // console.log(selectedOption);
    
    // 해당 텍스트와 일치하는 버튼 찾아서 활성화
    allButtons.forEach(button => {
      const productNameSpan = button.querySelector('.product-name');
      const buttonText = productNameSpan ? productNameSpan.textContent.trim() : button.textContent.trim();
      // console.log('Button Text:', buttonText);
      // console.log('Option Text:', optionText);
      if (buttonText === optionText) {
        button.classList.add('active');
      }
    });
  });
}

// 드롭다운을 숨기고 버튼으로 변경하는 함수
function replaceDropdownsWithButtons() {
  const dropdownMenus = document.querySelectorAll('#prod_options > div > div > div.form-select-wrap');
  
  dropdownMenus.forEach((menu) => {
    // 이미 처리된 메뉴는 건너뛰기
    if (menu.style.display === 'none' || menu.dataset.processed === 'true') {
      return;
    }
    
    const options = menu.querySelectorAll('div.dropdown-menu > div.dropdown-item');
    
    // 버튼 컨테이너 생성
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'option-buttons-container';
    
    options.forEach(option => {
      // console.log('Processing option:', option);
      const button = document.createElement('button');
      button.className = 'option-button';
      
      const spans = option.querySelectorAll('span');
      if (spans.length >= 2) {
        const productName = document.createElement('span');
        productName.className = 'product-name';
        productName.textContent = spans[0].textContent.trim();
        
        const productPrice = document.createElement('span');
        productPrice.className = 'product-price';
        productPrice.textContent = spans[1].textContent.trim();
        
        button.appendChild(productName);
        button.appendChild(productPrice);
      } else {
        button.textContent = option.innerText.trim();
      }
      
      // 품절 상품인지 확인하고 클래스 추가
      const priceText = spans.length >= 2 ? spans[1].textContent.trim() : option.innerText.trim();
      const isSoldOut = priceText.includes('(품절)');
      
      if (isSoldOut) {
        button.classList.add('sold-out');
      }
      
      // 버튼 클릭 시 실제 옵션의 onclick 함수 실행
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const linkElement = option.querySelector('a');
        if (linkElement && linkElement.onclick) {
          linkElement.onclick.call(linkElement, e);
        }
        
        // 선택된 상품과 버튼 상태 업데이트
        setTimeout(() => {
          updateButtonStates();
        }, 50);
      });
      
      buttonContainer.appendChild(button);
    });
    
    // 원래 드롭다운 메뉴 위치에 버튼 컨테이너 삽입
    menu.parentNode.insertBefore(buttonContainer, menu);
    
    // 드롭다운 메뉴 숨김 및 처리 완료 표시
    menu.style.display = 'none';
    menu.dataset.processed = 'true';
  });
  
  // 초기 버튼 상태 업데이트
  updateButtonStates();
}

// 초기 실행
replaceDropdownsWithButtons();

// DOM 변화 감지해서 새로 생성된 드롭다운도 처리
const observer = new MutationObserver(() => {
  replaceDropdownsWithButtons();
});

observer.observe(document.querySelector('#prod_options'), {
  childList: true,
  subtree: true
});