(function () {
	const nav = document.querySelector('.nav');
	if (!nav) return;

	const targets = [
		document.querySelector('.header__mobile-nav'),
		document.getElementById('footerNav'),
	].filter(Boolean);
	if (!targets.length) return;

	const links = nav.querySelectorAll('.nav__link');
	targets.forEach((target) => {
		links.forEach((link) => {
			const clone = document.createElement('a');
			clone.href = link.getAttribute('href');
			clone.textContent = link.textContent;
			target.appendChild(clone);
		});
	});
})();

(function () {
	const burger = document.getElementById('headerBurger');
	const menu = document.getElementById('headerMobileMenu');
	if (!burger || !menu) return;

	let savedScrollY = 0;

	function openMenu() {
		savedScrollY = window.scrollY;
		menu.classList.add('is-open');
		burger.classList.add('is-open');
		burger.setAttribute('aria-expanded', 'true');
		document.documentElement.classList.add('no-scroll');
		document.body.style.top = `-${savedScrollY}px`;
		document.body.classList.add('no-scroll');
	}

	function closeMenu() {
		menu.classList.remove('is-open');
		burger.classList.remove('is-open');
		burger.setAttribute('aria-expanded', 'false');
		document.documentElement.classList.remove('no-scroll');
		document.body.classList.remove('no-scroll');
		document.body.style.top = '';
		window.scrollTo(0, savedScrollY);
	}

	burger.addEventListener('click', () => {
		if (menu.classList.contains('is-open')) {
			closeMenu();
		} else {
			openMenu();
		}
	});

	menu.querySelectorAll('a').forEach((link) => {
		link.addEventListener('click', closeMenu);
	});

	menu.addEventListener('click', (e) => {
		if (e.target === menu) closeMenu();
	});
})();

(function () {
	function setStableVh() {
		document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
	}

	let lastWidth = window.innerWidth;
	setStableVh();

	window.addEventListener('resize', () => {
		if (window.innerWidth === lastWidth) return;
		lastWidth = window.innerWidth;
		setStableVh();
	});

	window.addEventListener('orientationchange', () => {
		lastWidth = window.innerWidth;
		setStableVh();
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
		const containerWidth = track.parentElement.getBoundingClientRect().width;
		const cardWidth = allItems[0].getBoundingClientRect().width;
		const centerOffset = (containerWidth - cardWidth) / 2;
		track.style.transform = `translateX(${centerOffset - index * getStep()}px)`;
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
		const containerWidth = track.parentElement.getBoundingClientRect().width;
		const cardWidth = allItems[0].getBoundingClientRect().width;
		const centerOffset = (containerWidth - cardWidth) / 2;
		return centerOffset - index * getStep();
	}

	track.addEventListener('dragstart', (e) => e.preventDefault());

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
		track.style.transform = `translateX(${dragStartOffset + delta}px)`;
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
				return;
			}

			const hit = document.elementFromPoint(e.clientX, e.clientY);
			const link = hit && hit.closest('a');
			if (link && track.contains(link)) {
				e.preventDefault();
				window.location.href = link.href;
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

whenFontsReady(() => {
	const servicesMore = document.getElementById('servicesMore');
	if (!servicesMore) return;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				servicesMore.classList.toggle('is-visible', entry.isIntersecting);
			});
		},
		{ threshold: 0.2 }
	);

	observer.observe(servicesMore);
});

(function () {
	const numbers = document.querySelectorAll('.growth-stats__number[data-count-to]');
	if (!numbers.length) return;

	function animateCount(el) {
		const target = parseInt(el.dataset.countTo, 10);
		const suffix = el.dataset.suffix || '';
		const duration = 1400;
		const start = performance.now();

		function tick(now) {
			const progress = Math.min((now - start) / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			const value = Math.round(target * eased);
			el.textContent = `${value.toLocaleString('en-US')}${suffix}`;
			if (progress < 1) requestAnimationFrame(tick);
		}

		requestAnimationFrame(tick);
	}

	const observer = new IntersectionObserver(
		(entries, obs) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				animateCount(entry.target);
				obs.unobserve(entry.target);
			});
		},
		{ threshold: 0.5 }
	);

	numbers.forEach((el) => observer.observe(el));
})();

function setMarqueeSpeed(track, desktopPxPerSecond, mobilePxPerSecond) {
	function update() {
		const pxPerSecond = window.matchMedia('(max-width: 640px)').matches
			? mobilePxPerSecond
			: desktopPxPerSecond;
		track.style.animationDuration = `${(track.scrollWidth / 2) / pxPerSecond}s`;
	}
	update();
	window.addEventListener('resize', update);
}

(function () {
	const track = document.getElementById('reviewsTrack');
	if (!track) return;

	const cards = Array.from(track.children).map((card) => {
		const clone = card.cloneNode(true);
		clone.setAttribute('aria-hidden', 'true');
		return clone;
	});
	cards.forEach((clone) => track.appendChild(clone));

	setMarqueeSpeed(track, 80, 30);
})();

(function () {
	const band = document.getElementById('reviewsBand');
	const track = document.getElementById('reviewsTrack');
	if (!band || !track) return;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				track.classList.toggle('is-offscreen', !entry.isIntersecting);
			});
		},
		{ threshold: 0 }
	);

	observer.observe(band);
})();

(function () {
	const slider = document.querySelector('.reviews__slider');
	const track = document.getElementById('reviewsTrack');
	if (!slider || !track) return;

	const HOVER_DELAY = 300;
	const COAST_DURATION = 450;
	const TAP_MOVE_THRESHOLD = 6;
	const TAP_PAUSE_DURATION = 2000;

	let hoverTimer = null;
	let tapResumeTimer = null;
	let isStopped = false;
	let isDragging = false;
	let isManuallyPaused = false;
	let dragMoved = false;
	let pointerType = 'mouse';
	let rafId = null;
	let savedDuration = parseFloat(getComputedStyle(track).animationDuration) || 45;
	let dragStartX = 0;
	let dragStartOffset = 0;

	function getTranslateX(el) {
		const matrix = new DOMMatrixReadOnly(getComputedStyle(el).transform);
		return matrix.m41;
	}

	function freezeAt(x) {
		savedDuration = parseFloat(getComputedStyle(track).animationDuration) || savedDuration;
		track.style.transition = 'none';
		track.style.animation = 'none';
		track.style.transform = `translateX(${x}px)`;
		void track.offsetWidth;
		isStopped = true;
	}

	function decelerateToStop() {
		if (isDragging || isManuallyPaused) return;
		savedDuration = parseFloat(getComputedStyle(track).animationDuration) || savedDuration;
		const totalDistance = track.scrollWidth / 2;
		const startX = getTranslateX(track);
		const v0 = totalDistance / (savedDuration * 1000);

		track.style.transition = 'none';
		track.style.animation = 'none';
		track.style.transform = `translateX(${startX}px)`;
		void track.offsetWidth;
		isStopped = true;

		const startTime = performance.now();

		function step(now) {
			const t = Math.min(now - startTime, COAST_DURATION);
			const distance = v0 * t - 0.5 * (v0 / COAST_DURATION) * t * t;
			track.style.transform = `translateX(${startX - distance}px)`;
			rafId = t < COAST_DURATION ? requestAnimationFrame(step) : null;
		}
		rafId = requestAnimationFrame(step);
	}

	function resumeFromStop() {
		if (!isStopped || isManuallyPaused) return;
		isStopped = false;
		if (rafId) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}

		const currentX = getTranslateX(track);
		const totalDistance = track.scrollWidth / 2;
		const elapsedRatio = (((-currentX) % totalDistance) + totalDistance) % totalDistance / totalDistance;
		const elapsedSeconds = elapsedRatio * savedDuration;

		track.style.transition = 'none';
		track.style.transform = '';
		track.style.animation = `reviews-marquee ${savedDuration}s linear infinite`;
		track.style.animationDelay = `-${elapsedSeconds}s`;
	}

	slider.addEventListener('mouseenter', () => {
		clearTimeout(hoverTimer);
		hoverTimer = setTimeout(decelerateToStop, HOVER_DELAY);
	});

	slider.addEventListener('mouseleave', () => {
		clearTimeout(hoverTimer);
		if (!isDragging) resumeFromStop();
	});

	track.addEventListener('pointerdown', (e) => {
		clearTimeout(hoverTimer);
		clearTimeout(tapResumeTimer);
		if (rafId) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
		isDragging = true;
		dragMoved = false;
		pointerType = e.pointerType;
		dragStartX = e.clientX;
		dragStartOffset = getTranslateX(track);
		freezeAt(dragStartOffset);
		try {
			track.setPointerCapture(e.pointerId);
		} catch (err) {
			/* ignore: pointer already released */
		}
	});

	track.addEventListener('pointermove', (e) => {
		if (!isDragging) return;
		const totalDistance = track.scrollWidth / 2;
		const delta = e.clientX - dragStartX;
		if (Math.abs(delta) > TAP_MOVE_THRESHOLD) dragMoved = true;
		let x = (dragStartOffset + delta) % totalDistance;
		if (x > 0) x -= totalDistance;
		track.style.transform = `translateX(${x}px)`;
	});

	function endDrag() {
		if (!isDragging) return;
		isDragging = false;

		if (!dragMoved && pointerType === 'touch') {
			tapResumeTimer = setTimeout(resumeFromStop, TAP_PAUSE_DURATION);
		} else {
			resumeFromStop();
		}
	}

	track.addEventListener('pointerup', endDrag);
	track.addEventListener('pointercancel', endDrag);

	const pauseBtn = document.getElementById('reviewsPauseBtn');
	if (pauseBtn) {
		pauseBtn.addEventListener('click', () => {
			isManuallyPaused = !isManuallyPaused;
			pauseBtn.classList.toggle('is-paused', isManuallyPaused);
			pauseBtn.setAttribute('aria-pressed', isManuallyPaused ? 'true' : 'false');
			pauseBtn.setAttribute('aria-label', isManuallyPaused ? 'Resume reviews auto-scroll' : 'Pause reviews auto-scroll');

			if (isManuallyPaused) {
				clearTimeout(hoverTimer);
				clearTimeout(tapResumeTimer);
				if (rafId) {
					cancelAnimationFrame(rafId);
					rafId = null;
				}
				freezeAt(getTranslateX(track));
			} else {
				resumeFromStop();
			}
		});
	}
})();

(function () {
	const tracks = ['socialTrackTop', 'socialTrackBottom'];

	tracks.forEach((id) => {
		const track = document.getElementById(id);
		if (!track) return;

		Array.from(track.children).forEach((tile) => {
			const clone = tile.cloneNode(true);
			clone.setAttribute('aria-hidden', 'true');
			track.appendChild(clone);
		});

		setMarqueeSpeed(track, 65, 25);
	});
})();

(function () {
	const gallery = document.querySelector('.social__gallery');
	const tracks = ['socialTrackTop', 'socialTrackBottom']
		.map((id) => document.getElementById(id))
		.filter(Boolean);
	if (!gallery || !tracks.length) return;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				tracks.forEach((track) => track.classList.toggle('is-offscreen', !entry.isIntersecting));
			});
		},
		{ threshold: 0 }
	);

	observer.observe(gallery);
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
		const toggle = group.querySelector('.qa__group-toggle');

		group.addEventListener('click', (e) => {
			const question = e.target.closest('.qa__question');
			if (question) {
				const item = question.closest('.qa__item');
				const wasOpen = item.classList.contains('is-open');
				items.forEach((other) => other.classList.remove('is-open'));
				item.classList.toggle('is-open', !wasOpen);
				return;
			}

			if (toggle && e.target.closest('.qa__group-toggle') === toggle) {
				const isExpanded = group.classList.toggle('is-expanded');
				toggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
			}
		});
	});
})();

