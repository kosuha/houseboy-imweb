// 지정된 컨테이너를 선택합니다.
const targetContainer = document.querySelector('#w20230523986f777136222 > div > div > div > div:nth-child(2)');
const menuSection = document.querySelector('#s20230523fed2896ad9a66');
const expandedMenuSection = document.querySelector('.hb-expanded-menu');
console.log(expandedMenuSection);
// 컨테이너가 존재하는지 확인합니다.
if (targetContainer) {
    // 기존 콘텐츠를 비웁니다.
    targetContainer.innerHTML = '';

    // 메뉴를 열고 닫는 버튼을 생성합니다.
    const menuButton = document.createElement('button');
    menuButton.className = 'custom-menu-toggle';
    menuButton.setAttribute('aria-label', '메뉴 토글');

    // 버튼 안에 들어갈 SVG 아이콘(가로줄 2개)을 설정합니다.
    menuButton.innerHTML = '<svg viewBox="0 0 100 60" width="14" height="14" fill="#333"><rect width="100" height="7"></rect><rect y="45" width="100" height="7"></rect></svg>';

    // 생성한 요소들을 DOM에 추가합니다.
    targetContainer.appendChild(menuButton);
    menuSection.after(expandedMenuSection);

    // 버튼 클릭 시 메뉴를 토글하는 이벤트 리스너를 추가합니다.
    menuButton.addEventListener('click', () => {
        expandedMenuSection.classList.toggle('show');
    });
} else {
    console.error('지정한 컨테이너 요소를 찾을 수 없습니다.');
}
