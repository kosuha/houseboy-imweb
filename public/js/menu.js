const MENU_CONTAINER_SELECTOR = '#doz_header';
  const DOTTED = "*";

  const menuContainers = document.querySelectorAll(MENU_CONTAINER_SELECTOR);
  console.log(menuContainers);
  menuContainers.forEach(menuContainer => {
	const spans = menuContainer.querySelectorAll('span');
	spans.forEach(span => {
	  if (span.textContent.includes(DOTTED)) {
		span.textContent = span.textContent.replace(DOTTED, '').trim();

		const parent = span.parentElement;
		parent.style.position = 'relative';
		const dot = document.createElement('div');
		dot.className = 'dotted';
		span.appendChild(dot);
	  }
	});
});