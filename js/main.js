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
	const header = document.querySelector('.header');
	if (!header) return;

	function setHeaderHeightVar() {
		document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
	}
	setHeaderHeightVar();
	window.addEventListener('resize', setHeaderHeightVar);

	let lastScrollY = window.scrollY;
	const scrollDeltaThreshold = 30;

	window.addEventListener('scroll', () => {
		const currentScrollY = window.scrollY;
		const delta = currentScrollY - lastScrollY;

		if (Math.abs(delta) < scrollDeltaThreshold) return;

		const scrolledPastHeader = currentScrollY > header.offsetHeight + 150;
		header.classList.toggle('header--hidden', delta > 0 && scrolledPastHeader);

		lastScrollY = currentScrollY;
	}, { passive: true });
})();

(function () {
	document.querySelectorAll('[data-select]').forEach((wrap) => {
		const trigger = wrap.querySelector('.select-custom__trigger');
		const valueEl = wrap.querySelector('[data-select-value]');
		const options = Array.from(wrap.querySelectorAll('.select-custom__option'));
		const hiddenInput = wrap.querySelector('input[type="hidden"]');

		function close() {
			wrap.classList.remove('is-open');
			trigger.setAttribute('aria-expanded', 'false');
		}

		function open() {
			wrap.classList.add('is-open');
			trigger.setAttribute('aria-expanded', 'true');
		}

		trigger.addEventListener('click', () => {
			wrap.classList.contains('is-open') ? close() : open();
		});

		options.forEach((option) => {
			option.addEventListener('click', () => {
				options.forEach((o) => {
					o.classList.remove('is-selected');
					o.setAttribute('aria-selected', 'false');
				});
				option.classList.add('is-selected');
				option.setAttribute('aria-selected', 'true');
				valueEl.textContent = option.textContent;
				valueEl.classList.toggle('is-placeholder', !option.dataset.value);
				hiddenInput.value = option.dataset.value;
				hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
				close();
			});
		});

		document.addEventListener('click', (e) => {
			if (!wrap.contains(e.target)) close();
		});
	});
})();

(function () {
	const form = document.querySelector('.contact__form');
	if (!form) return;

	const fields = Array.from(form.querySelectorAll('input, select, textarea'));

	function invalidTarget(field) {
		return field.closest('.select-custom')?.querySelector('.select-custom__trigger') || field;
	}

	fields.forEach((field) => {
		const clear = () => invalidTarget(field).classList.remove('is-invalid');
		field.addEventListener('input', clear);
		field.addEventListener('change', clear);
	});

	form.addEventListener('submit', (e) => {
		let firstInvalid = null;

		fields.forEach((field) => {
			const target = invalidTarget(field);
			if (field.checkValidity()) {
				target.classList.remove('is-invalid');
			} else {
				target.classList.add('is-invalid');
				if (!firstInvalid) firstInvalid = target;
			}
		});

		if (firstInvalid) {
			e.preventDefault();
			firstInvalid.focus();
		}
	});
})();

(function () {
	const textarea = document.getElementById('message');
	if (!textarea) return;

	function resize() {
		textarea.style.height = 'auto';
		textarea.style.height = `${textarea.scrollHeight}px`;
	}

	textarea.addEventListener('input', resize);
	resize();
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
	});

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				scrollBtn.classList.toggle('is-hidden', entry.isIntersecting);
			});
		},
		{ threshold: 0 }
	);

	observer.observe(target);
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

whenFontsReady(() => {
	const qaCta = document.getElementById('qaCta');
	if (!qaCta) return;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				qaCta.classList.toggle('is-visible', entry.isIntersecting);
			});
		},
		{ threshold: 0.2 }
	);

	observer.observe(qaCta);
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
	const pauseBtn = document.getElementById('reviewsPauseBtn');
	if (!pauseBtn) return;

	pauseBtn.addEventListener('click', () => {
		const isPaused = pauseBtn.classList.toggle('is-paused');
		pauseBtn.setAttribute('aria-pressed', isPaused ? 'true' : 'false');
		pauseBtn.setAttribute('aria-label', isPaused ? 'Resume reviews auto-scroll' : 'Pause reviews auto-scroll');
	});
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
	const tiles = document.querySelectorAll('.social__tile');
	if (!tiles.length) return;

	const observer = new IntersectionObserver(
		(entries, obs) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				const img = entry.target;
				const fullSrc = img.dataset.src;
				if (fullSrc) {
					img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
					img.src = fullSrc;
				}
				obs.unobserve(img);
			});
		},
		{ rootMargin: '200px' }
	);

	tiles.forEach((tile) => observer.observe(tile));
})();

(function () {
	const groups = Array.from(document.querySelectorAll('.qa__group'));
	if (!groups.length) return;

	groups.forEach((group) => {
		const items = Array.from(group.querySelectorAll('.qa__item'));
		if (!items.length) return;

		items.forEach((item) => {
			const question = item.querySelector('.qa__question');
			question.addEventListener('click', () => {
				const wasOpen = item.classList.contains('is-open');
				items.forEach((other) => other.classList.remove('is-open'));
				item.classList.toggle('is-open', !wasOpen);
			});
		});
	});
})();

