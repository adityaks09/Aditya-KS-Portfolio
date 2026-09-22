const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    // Reset outside the view so the animation plays again on every return scroll.
    entry.target.classList.toggle('visible', entry.isIntersecting);
  });
}, { threshold: 0.18 });

document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));

// All portfolio metrics scramble together, then resolve to their real values in under one second.
const metricSection = document.querySelector('.metrics');
const metricNumbers = [...document.querySelectorAll('.scramble-number')];
let metricTimer;
const playMetricScramble = () => {
  clearInterval(metricTimer);
  let frame = 0;
  metricTimer = setInterval(() => {
    frame += 1;
    metricNumbers.forEach((number) => {
      const value = number.dataset.value;
      number.textContent = frame >= 12
        ? value
        : Array.from({ length: value.length }, () => Math.floor(Math.random() * 10)).join('');
    });
    if (frame >= 12) clearInterval(metricTimer);
  }, 70);
};
new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) playMetricScramble();
    else clearInterval(metricTimer);
  });
}, { threshold: 0.5 }).observe(metricSection);

// Reveal each heading word on scroll while preserving emphasis and line breaks.
document.querySelectorAll('.heading-animate').forEach((heading) => {
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) fragment.append(part);
      else {
        const word = document.createElement('span');
        word.className = 'word';
        word.textContent = part;
        fragment.append(word);
      }
    });
    node.parentNode.replaceChild(fragment, node);
  });
});

// The magnifier contains a scaled copy of main, positioned to match the point below the cursor.
const magnifier = document.querySelector('.magnifier');
const magnifierContent = document.querySelector('.magnifier-content');
const sourceMain = document.querySelector('main');
if (window.matchMedia('(pointer:fine)').matches) {
  const magnifiedMain = sourceMain.cloneNode(true);
  magnifiedMain.removeAttribute('id');
  magnifiedMain.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
  magnifierContent.append(magnifiedMain);

  const scale = 1.32;
  const lensRadius = 56;
  let x = -100, y = -100, targetX = -100, targetY = -100;
  const renderMagnifier = () => {
    x += (targetX - x) * 0.2;
    y += (targetY - y) * 0.2;
    magnifier.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    const pageX = x + window.scrollX;
    const pageY = y + window.scrollY - document.querySelector('.site-header').offsetHeight;
    magnifiedMain.style.transform = `translate(${lensRadius - pageX * scale}px, ${lensRadius - pageY * scale}px) scale(${scale})`;
    requestAnimationFrame(renderMagnifier);
  };
  window.addEventListener('pointermove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    magnifier.classList.add('is-active');
  });
  window.addEventListener('pointerleave', () => magnifier.classList.remove('is-active'));
  renderMagnifier();
}
