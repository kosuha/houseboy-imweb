/**
  [자사몰 멤버십]
  구매 금액에 따라 더욱더 커지는 특별한 혜택을 확인해보세요!

  1. GREEN 등급
  등급조건 : 구매 금액 30만원 미만
  등급혜택 : 구매적립금1% + 웰컴 쿠폰팩 (2000원 할인, 무료배송 쿠폰)

  2. HOUSE GREEN 등급
  등급조건 : 구매 금액 30만원 이상
  등급혜택 : 구매적립금 3% + 상시무료배송 + 1000원 추가 할인 쿠폰 X2

  3. SPECIAL GREEN 등급
  등급조건 : 구매 금액 60만원 이상
  등급혜택 : 구매적립금 5% + 상시무료배송 + 1000원 추가 할인 쿠폰 X3 + 신제품 체험단 우선 참여권

  구매 금액은 (각종 할인,적립금,취소 및 환불을 제외한)실결제 금액 기준으로 집계됩니다.
  멤버십 회원 등급은 최근 6개월 누적 실 결제금액을 기준으로 매월 1일 자동 변경됩니다.
  회원 등급, 쿠폰, 적립금은 마이페이지에서 확인 가능합니다.
  구매 적립금은 배송 완료 7일 후 발급되며, 적립금은 구매금액에 상관없이 사용 가능합니다.
*/
{
  const membershipTableContainer = document.querySelector('#list-popover > div.lp_content_wrap > div.lp_table');
  const membershipData = [
    {
      grade: 'GREEN',
      condition: '구매 금액 30만원 미만',
      benefits: ['구매적립금 1%', '+ 웰컴 쿠폰팩 (2000원 할인, 무료배송 쿠폰)']
    },
    {
      grade: 'HOUSE GREEN',
      condition: '구매 금액 30만원 이상',
      benefits: ['구매적립금 3%', '+ 상시무료배송', '+ 1000원 추가 할인 쿠폰 X2']
    },
    {
      grade: 'SPECIAL GREEN',
      condition: '구매 금액 60만원 이상',
      benefits: ['구매적립금 5%', '+ 상시무료배송', '+ 1000원 추가 할인 쿠폰 X3', '+ 신제품 체험단 우선 참여권']
    }
  ];
  const membershipNoticeData = [
    '구매 금액은 (각종 할인,적립금,취소 및 환불을 제외한)실결제 금액 기준으로 집계됩니다.',
    '멤버십 회원 등급은 최근 6개월 누적 실 결제금액을 기준으로 매월 1일 자동 변경됩니다.',
    '회원 등급, 쿠폰, 적립금은 마이페이지에서 확인 가능합니다.',
    '구매 적립금은 배송 완료 7일 후 발급되며, 적립금은 구매금액에 상관없이 사용 가능합니다.'
  ];

  const membershipTitle = membershipTableContainer.querySelector('div:nth-child(1)');
  const membershipTable = membershipTableContainer.querySelector('div:nth-child(2) > table');
  const membershipNotice = membershipTableContainer.querySelector('div:nth-child(3)');

  membershipTitle.classList.add('title');
  membershipTitle.innerHTML = '회원 등급별 혜택 안내';

  membershipTable.querySelector('thead > tr').innerHTML = `
    <th>등급</th>
    <th>등급 조건</th>
    <th>등급 혜택</th>
  `;

  membershipTable.querySelectorAll('tbody > tr').forEach((tr, index) => {
    const item = membershipData[index];
    tr.innerHTML = `
      <td>${item.grade}</td>
      <td>${item.condition}</td>
      <td>${item.benefits.join('<br>')}</td>
    `;
  });

  membershipNotice.classList.add('notice');
  membershipNotice.innerHTML = membershipNoticeData.map(item => `<p>${item}</p>`).join('');
}
