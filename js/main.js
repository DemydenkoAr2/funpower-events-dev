(function () {
	const burger = document.getElementById('headerBurger');
	const menu = document.getElementById('headerMobileMenu');
	if (!burger || !menu) return;

	burger.addEventListener('click', () => {
		const isOpen = menu.classList.toggle('is-open');
		burger.classList.toggle('is-open', isOpen);
		burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
	});

	menu.querySelectorAll('a').forEach((link) => {
		link.addEventListener('click', () => {
			menu.classList.remove('is-open');
			burger.classList.remove('is-open');
			burger.setAttribute('aria-expanded', 'false');
		});
	});
})();

(function () {
	const track = document.getElementById('servicesTrack');
	if (!track) return;

	const originalCards = Array.from(track.children);
	const realCount = originalCards.length;

	function cloneSet() {
		const frag = document.createDocumentFragment();
		originalCards.forEach((card) => {
			const clone = card.cloneNode(true);
			clone.setAttribute('aria-hidden', 'true');
			clone.querySelectorAll('a, button').forEach((el) => {
				el.tabIndex = -1;
			});
			frag.appendChild(clone);
		});
		return frag;
	}

	track.insertBefore(cloneSet(), track.firstChild);
	track.appendChild(cloneSet());

	const allItems = Array.from(track.children);

	const prevBtn = document.querySelector('.services__arrow--prev');
	const nextBtn = document.querySelector('.services__arrow--next');
	const dotsWrap = document.getElementById('servicesDots');

	let index = realCount;

	function getStep() {
		const trackStyle = getComputedStyle(track);
		const gap = parseFloat(trackStyle.columnGap || trackStyle.gap || '0');
		return allItems[0].getBoundingClientRect().width + gap;
	}

	function getVisibleCount() {
		const containerWidth = track.parentElement.getBoundingClientRect().width;
		return Math.max(1, Math.round(containerWidth / getStep()));
	}

	function getMiddleOffset() {
		return Math.floor(getVisibleCount() / 2);
	}

	function activeDotIndex() {
		const centered = index + getMiddleOffset();
		return ((centered - realCount) % realCount + realCount) % realCount;
	}

	function renderDots() {
		Array.from(dotsWrap.children).forEach((dot, i) => {
			dot.classList.toggle('is-active', i === activeDotIndex());
		});
	}

	function setPosition(animate) {
		track.style.transition = animate ? '' : 'none';
		track.style.transform = `translateX(-${index * getStep()}px)`;
		if (!animate) {
			void track.offsetHeight;
			track.style.transition = '';
		}
		renderDots();
	}

	function handleTransitionEnd(e) {
		if (e.target !== track || e.propertyName !== 'transform') return;
		if (index >= realCount * 2) {
			index -= realCount;
			setPosition(false);
		} else if (index < realCount) {
			index += realCount;
			setPosition(false);
		}
	}

	function goTo(newIndex) {
		index = newIndex;
		setPosition(true);
	}

	function nearestEquivalentIndex(target) {
		const candidates = [target - realCount, target, target + realCount];
		return candidates.reduce((best, c) =>
			Math.abs(c - index) < Math.abs(best - index) ? c : best
		);
	}

	function buildDots() {
		dotsWrap.innerHTML = '';
		originalCards.forEach((_, i) => {
			const dot = document.createElement('button');
			dot.type = 'button';
			dot.className = 'services__dot';
			dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
			dot.addEventListener('click', () => {
				const target = realCount + i - getMiddleOffset();
				goTo(nearestEquivalentIndex(target));
			});
			dotsWrap.appendChild(dot);
		});
	}

	function vibrateIcon(btn) {
		const icon = btn.querySelector('svg');
		if (!icon) return;
		icon.classList.remove('is-vibrating');
		void btn.offsetWidth;
		icon.classList.add('is-vibrating');
	}

	let isDragging = false;
	let didDrag = false;
	let dragStartX = 0;
	let dragStartOffset = 0;

	function currentOffset() {
		return index * getStep();
	}

	track.addEventListener('pointerdown', (e) => {
		isDragging = true;
		didDrag = false;
		dragStartX = e.clientX;
		dragStartOffset = currentOffset();
		track.style.transition = 'none';
		track.setPointerCapture(e.pointerId);
	});

	track.addEventListener('pointermove', (e) => {
		if (!isDragging) return;
		const delta = e.clientX - dragStartX;
		if (Math.abs(delta) > 5) didDrag = true;
		track.style.transform = `translateX(${-(dragStartOffset - delta)}px)`;
	});

	function endDrag(e) {
		if (!isDragging) return;
		isDragging = false;
		track.style.transition = '';
		const delta = e.clientX - dragStartX;
		const step = getStep();
		let steps = Math.round(-delta / step);
		if (steps === 0 && Math.abs(delta) >= step / 4) {
			steps = delta < 0 ? 1 : -1;
		}
		if (steps !== 0) {
			goTo(index + steps);
		} else {
			setPosition(true);
		}
	}

	track.addEventListener('pointerup', endDrag);
	track.addEventListener('pointercancel', endDrag);

	track.addEventListener(
		'click',
		(e) => {
			if (didDrag) {
				e.preventDefault();
				e.stopPropagation();
				didDrag = false;
			}
		},
		true
	);

	track.addEventListener('transitionend', handleTransitionEnd);
	prevBtn.addEventListener('click', () => {
		goTo(index - 1);
		vibrateIcon(prevBtn);
	});
	nextBtn.addEventListener('click', () => {
		goTo(index + 1);
		vibrateIcon(nextBtn);
	});
	window.addEventListener('resize', () => setPosition(false));

	buildDots();
	setPosition(false);
})();

(function () {
	const scrollBtn = document.getElementById('heroScrollBtn');
	const target = document.querySelector('.services__title') || document.getElementById('services');
	if (!scrollBtn || !target) return;

	scrollBtn.addEventListener('click', () => {
		target.scrollIntoView({ behavior: 'smooth', block: 'start' });
		scrollBtn.classList.add('is-hidden');
	});
})();

function whenFontsReady(callback) {
	if (document.fonts && document.fonts.ready) {
		document.fonts.ready.then(callback);
	} else {
		callback();
	}
}

whenFontsReady(() => {
	const about = document.getElementById('about');
	if (!about) return;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				about.classList.toggle('is-visible', entry.isIntersecting);
			});
		},
		{ threshold: 0.2 }
	);

	observer.observe(about);
});

whenFontsReady(() => {
	const reviewsBand = document.getElementById('reviewsBand');
	if (!reviewsBand) return;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				reviewsBand.classList.toggle('is-visible', entry.isIntersecting);
			});
		},
		{ threshold: 0, rootMargin: '-15% 0px -15% 0px' }
	);

	observer.observe(reviewsBand);
});

(function () {
	const track = document.getElementById('reviewsTrack');
	if (!track) return;

	const originalCount = track.children.length;
	const cards = Array.from(track.children).map((card) => {
		const clone = card.cloneNode(true);
		clone.setAttribute('aria-hidden', 'true');
		return clone;
	});
	cards.forEach((clone) => track.appendChild(clone));

	track.style.animationDuration = `${originalCount * 5}s`;
})();

(function () {
	const tracks = ['socialTrackTop', 'socialTrackBottom'];

	tracks.forEach((id) => {
		const track = document.getElementById(id);
		if (!track) return;

		const originalCount = track.children.length;
		Array.from(track.children).forEach((tile) => {
			const clone = tile.cloneNode(true);
			clone.setAttribute('aria-hidden', 'true');
			track.appendChild(clone);
		});

		track.style.animationDuration = `${originalCount * 6}s`;
	});
})();

(function () {
	const items = Array.from(document.querySelectorAll('.qa__item'));
	if (!items.length) return;

	items.forEach((item) => {
		const question = item.querySelector('.qa__question');
		question.addEventListener('click', () => {
			item.classList.toggle('is-open');
		});
	});
})();

(function () {
	const navLinks = Array.from(document.querySelectorAll('.nav__link[data-section]'));
	if (!navLinks.length) return;

	const sections = navLinks
		.map((link) => document.getElementById(link.dataset.section))
		.filter(Boolean);
	if (!sections.length) return;

	function setActive(id) {
		navLinks.forEach((link) => {
			link.classList.toggle('is-active', link.dataset.section === id);
		});
	}

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) setActive(entry.target.id);
			});
		},
		{ rootMargin: '-50% 0px -50% 0px', threshold: 0 }
	);

	sections.forEach((section) => observer.observe(section));
})();
