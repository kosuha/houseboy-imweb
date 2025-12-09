document.addEventListener('DOMContentLoaded', function() {
    let levelsSwiper = undefined;
    let kakaoSwiper = undefined;

    function initSwipers() {
        const screenWidth = window.innerWidth;
        
        if (screenWidth <= 768 && !levelsSwiper) {
            levelsSwiper = new Swiper('.levels-swiper', {
                slidesPerView: 1,
                spaceBetween: 20,
                pagination: {
                    el: '.levels-pagination',
                    clickable: true,
                },
            });
        } else if (screenWidth > 768 && levelsSwiper) {
            levelsSwiper.destroy(true, true);
            levelsSwiper = undefined;
            document.querySelector('.levels-swiper .swiper-wrapper').removeAttribute('style');
            document.querySelectorAll('.levels-swiper .swiper-slide').forEach(slide => slide.removeAttribute('style'));
        }

        if (screenWidth <= 768 && !kakaoSwiper) {
            kakaoSwiper = new Swiper('.kakao-swiper', {
                slidesPerView: 1,
                spaceBetween: 20,
                pagination: {
                    el: '.kakao-pagination',
                    clickable: true,
                },
            });
        } else if (screenWidth > 768 && kakaoSwiper) {
            kakaoSwiper.destroy(true, true);
            kakaoSwiper = undefined;
            document.querySelector('.kakao-swiper .swiper-wrapper').removeAttribute('style');
            document.querySelectorAll('.kakao-swiper .swiper-slide').forEach(slide => slide.removeAttribute('style'));
        }
    }

    initSwipers();
    window.addEventListener('resize', initSwipers);
});