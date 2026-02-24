(function () {
  const manifest = window.AI_CASES_MANIFEST;
  const content = document.getElementById('content');
  const caseNav = document.getElementById('case-nav');

  const deckPrev = document.getElementById('deck-prev');
  const deckNext = document.getElementById('deck-next');
  const deckProgress = document.getElementById('deck-progress');

  const viewer = document.getElementById('viewer');
  const viewerImage = document.getElementById('viewer-image');
  const viewerTitle = document.getElementById('viewer-title');
  const viewerMeta = document.getElementById('viewer-meta');
  const viewerPrompt = document.getElementById('viewer-prompt');
  const viewerOpenOriginal = document.getElementById('viewer-open-original');

  const viewerClose = document.getElementById('viewer-close');
  const viewerCloseSide = document.getElementById('viewer-close-side');
  const viewerPrev = document.getElementById('viewer-prev');
  const viewerNext = document.getElementById('viewer-next');

  if (!manifest || !Array.isArray(manifest.cases) || manifest.cases.length === 0) {
    content.innerHTML = '<div class="empty">Could not load manifest data.</div>';
    return;
  }

  const modelOrder = [
    'Reference',
    'GPT Image 1.5',
    'Imagen 4',
    'Seedream 4.5',
    'Flux.1-dev',
    'Gemini Nano Banana',
    'Qwen Image',
    'Grok',
    'Midjourney',
    'SDXL 1.0',
    'Stable Diffusion 3.5 Large',
    'HiDream.I1-full',
    'Z Image Turbo',
    'Other',
    'Unknown',
  ];

  const modelRank = new Map(modelOrder.map((name, index) => [name, index]));

  function normalizeName(value) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }

  const casePromptsByName = new Map([
    [
      normalizeName('logo in coffee shop'),
      'Product photography: a small unglazed ceramic espresso cup with the logo from reference image, debossed in minimal sans-serif on the side. The cup sits on a raw concrete shelf built into a dark plaster wall. To the left of the cup, a single dried olive branch in a slim black metal vase. Behind the cup, slightly out of focus, a small rectangular card leaning against the wall reading "Specialty Coffee & Ceramics" in two lines. Overhead recessed spotlight casting a tight circular highlight on the cup and a soft penumbra around it. Rest of the scene in deep shadow. The wall has subtle imperfections and hairline cracks. Shot at f/2.8, 85mm equivalent, slightly above eye level.\n+ logo reference',
    ],
    [
      normalizeName('Jazz Poster'),
      'Vintage-modern jazz festival poster. The person is photographed from chest up, eyes closed, head tilted slightly back as if listening to music. They are wearing an oversized linen blazer with nothing underneath, one shoulder exposed. The photo is treated with a duotone effect - deep navy and warm gold. Behind the figure: a stylized silhouette of Lisbon\'s Sao Jorge Castle on a hilltop, simplified to geometric flat shapes. Large bold text at the top: "LISBOA JAZZ FEST" in condensed grotesque typeface, tracking +200. Below the figure: "15-22 SETEMBRO 2026" in a lighter weight. At the bottom in small caps: "JARDIM DO TOREL - ENTRADA LIVRE". A single saxophone illustration in thin gold linework wraps around the right edge of the poster. Grain overlay, risograph printing texture.',
    ],
    [
      normalizeName('complex illustration'),
      'Hyper-detailed anime illustration, wide shot: a girl in a white oversized astronaut suit sits on the edge of a broken highway overpass, legs dangling over a flooded megacity below. She holds a glowing paper lantern in her left hand, the warm orange light reflecting on her visor. Behind her, three massive decommissioned mechs are half-submerged in the water, overgrown with bioluminescent coral and vines. The sky is a gradient from deep violet at the top to pale pink at the horizon, with two moons visible. Rain is falling but lit by the lantern, creating visible golden streaks in the foreground. Makoto Shinkai color palette meets Tsutomu Nihei architectural scale. Extreme detail on mech joints, coral textures, and water reflections.',
    ],
    [
      normalizeName('Jewelry ad'),
      'Close-up portrait of a woman with wet slicked-back hair, wearing an oversized sculptural gold ear cuff and a thin gold chain across the bridge of her nose. One hand with long nails gently touching the ear cuff. Skin has visible pores and subtle freckles. Studio lighting: single hard key light from upper left creating sharp jaw shadow, soft fill from right. Dark teal background with slight gradient. Shot on medium format, shallow depth of field, slight lens compression. Editorial for high-end jewelry brand.',
    ],
    [
      normalizeName('desert'),
      'Full-body dynamic shot, the person mid-leap in a vast white salt flat desert, arms extended upward, body arched backward. They are wearing a flowing translucent metallic cape that catches wind - iridescent silver and copper, shredded at the edges. Underneath: minimal black bodysuit with geometric cutouts. Heavy radial motion blur on the entire environment - cracked earth, dust particles, distant art installations are all streaked. Only the person is tack-sharp. The sun is directly behind their head creating a full-body halo and lens flare. Sky is deep amber fading to bruised purple at the edges. Dust clouds at the feet are frozen mid-explosion. Wide angle, 24mm, shot from slightly below, f/2.8, high-speed sync flash to freeze the subject against the blurred world.',
    ],
    [
      normalizeName('Metro flight'),
      'A gritty, high-energy shot based on the reference likeness. The subject is floating horizontally, sharp and focused, just above head-height in a jam-packed, grimy subway station during rush hour. They are wrapped in excessive, oversized, strange flowing garments that look like repurposed parachutes or tarps. The surrounding crowd of thousands is reduced to a chaotic, smeared river of motion blur and muted colors. Concrete pillars and subway lights are dragged into abstract blurs. The aesthetic is raw street photography with extreme motion.',
    ],
    [
      normalizeName('eco-brutalist fashion shot using the reference character.'),
      'An eco-brutalist fashion shot using the reference character. The subject wears an enormous, elaborate headdress sculpted from recognizable technological waste: old circuit boards, wires, broken phone screens, and plastic parts. The lighting is dramatic and dusty, emphasizing the trash textures.\n+ photo of me',
    ],
    [
      normalizeName('VibeStudio SN'),
      'A creative mobile UI design for "VibeStudio", a next-gen social network for creators. Two screens presented side-by-side. Left screen (Main Feed): A high-energy vertical feed showcasing high-resolution photography and video previews. Overlaid with translucent navigation bars, subtle glassmorphic "Like" and "Share" buttons, and an elegant circular stories bar at the top with glowing borders. Right screen (Creator Studio): An internal content creation interface featuring complex slider controls for "AR Filters", "Depth Perception", and "Color Grading". A timeline at the bottom with small video thumbnails and waveform visualizations. The style is vibrant, modern, using a mix of "Deep Purple" and "Neon Coral" accents. Cinematic lighting on the device frames, ultra-detailed UI elements, 8k, professional portfolio look.',
    ],
    [
      normalizeName('ParkFlow mockup'),
      'A professional UI/UX mobile application mockup for "ParkFlow", an advanced city parking and car management app. Two screens displayed side-by-side on modern smartphones. Left screen (Home/Map): An interactive 3D map of a city center with realistic isometric buildings. Floating search bar at the top, and blue/red 3D pins indicating parking availability. At the bottom, a swipeable carousel of cards showing nearby parking spots with prices and ratings. Right screen (Booking Details): A detailed internal screen showing a digital reservation ticket with a high-contrast QR code, a countdown timer for the parking session, and a detailed price breakdown with elegant iconography. Soft shadows, clean white and "Electric Blue" color palette, Apple-style minimalist design, high-fidelity render.',
    ],
    [
      normalizeName('Aura Smart Home application'),
      'A high-fidelity mobile UI/UX design showcase for a premium Smart Home application named "Aura". Two iPhone screens side-by-side against a minimalist architectural background. Left screen (Dashboard): Features a sleek bento-grid layout with frosted glass widgets showing indoor temperature (22C), humidity, and active security cameras. High-detail icons for "Living Room" and "Master Bedroom". Right screen (Lighting Control): A sophisticated internal screen featuring a 3D-rendered iridescent color wheel for smart bulb adjustment and a smooth slider for brightness. Below, a line graph showing energy consumption over 24 hours. The aesthetic is "Glassmorphism" with soft glows, deep charcoal backgrounds, and SF Pro typography. Hyper-realistic, 8k resolution, Dribbble-trending style.',
    ],
  ]);

  function getCasePrompt(caseName) {
    const normalized = normalizeName(caseName);
    if (casePromptsByName.has(normalized)) return casePromptsByName.get(normalized);
    return caseName || 'Prompt for this case is not provided yet.';
  }

  function sortedImages(images) {
    return [...images].sort((a, b) => {
      const ra = modelRank.has(a.model) ? modelRank.get(a.model) : Number.MAX_SAFE_INTEGER;
      const rb = modelRank.has(b.model) ? modelRank.get(b.model) : Number.MAX_SAFE_INTEGER;
      if (ra !== rb) return ra - rb;
      return a.fileName.localeCompare(b.fileName);
    });
  }

  const removedCaseIds = new Set([
    'try-to-edit',
    'desert',
    'eco-brutalist-fashion-shot-using-the-reference-character',
    'me-plus-feature',
    'urban-flight',
    'metro-flight',
    'aura-smart-home-application',
    'vibestudio-sn',
  ]);

  const lectureCaseOrder = [
    'jewelry-ad',
    'complex-illustration',
    'logo-in-coffee-shop',
    'a-wide-surrealist-shot-impossible-escher-style-building',
    'jazz-poster',
    'parkflow-mockup',
    'vibestudio-sn',
  ];
  const lectureCaseRank = new Map(lectureCaseOrder.map((id, index) => [id, index]));

  const removalByCaseId = new Map([
    [
      'a-wide-surrealist-shot-impossible-escher-style-building',
      new Set([
        'Imagen 4 dvwe.png',
        'Gemini Nano Banana dsfew.png',
        'Flux.1-dev werwfw.png',
        'Grok refgegh4w.jpeg',
        'Mv7 rhe.png',
        'SDXL 1.0 thrt.png',
        'Stable Diffusion 3.5 Large dwfe.png',
        'HiDream.I1-full fgeh.png',
        'HiDream.I1-fullfegw.png',
        'Z Image Turbo few.png',
        'Generated Image from Fusara AI (40).png',
        'Generated Image from Fusara AI (43).png',
        'Generated Image from Fusara AI (41).png',
      ]),
    ],
    [
      'complex-illustration',
      new Set(['SDXL 1.0 3.png']),
    ],
    [
      'jazz-poster',
      new Set(['Grok dwe.jpeg']),
    ],
    [
      'jewelry-ad',
      new Set([
        'GPT Image 1.5 1.png',
        'Qwen Image 1.png',
        'Qwen Image.png',
        'Grok2.jpeg',
        'Mv7 4.png',
        'Generated Image from Fusara AI (37).png',
      ]),
    ],
    [
      'logo-in-coffee-shop',
      new Set(['Mv7 5.png', 'Mv7 6.png', 'Mv7 7.png']),
    ],
    [
      'vibestudio-sn',
      new Set(['Grok ewf3f.jpeg', 'Stable Diffusion 3.5 Large ewr23r.png']),
    ],
    [
      'parkflow-mockup',
      new Set(['Imagen 4 wefw.png', 'Mv7wef.png', 'Z Image Turbo ewfe.png']),
    ],
  ]);

  function normalizeModelName(caseId, fileName, modelName) {
    if (modelName === 'Mv7') return 'Midjourney';
    if (
      caseId === 'a-wide-surrealist-shot-impossible-escher-style-building' &&
      (fileName === 'Generated Image from Fusara AI (40).png' || fileName === 'Generated Image from Fusara AI (43).png')
    ) {
      return 'GPT Image 1.5';
    }
    if (
      caseId === 'a-wide-surrealist-shot-impossible-escher-style-building' &&
      fileName === 'Generated Image from Fusara AI (41).png'
    ) {
      return 'Midjourney';
    }
    return modelName;
  }

  function shouldRemoveImage(caseId, fileName) {
    const removals = removalByCaseId.get(caseId);
    if (!removals) return false;
    return removals.has(fileName);
  }

  function buildCaseState(rawCases) {
    const output = [];

    for (let i = 0; i < rawCases.length; i += 1) {
      const item = rawCases[i];
      if (removedCaseIds.has(item.id)) continue;

      const images = [];
      let referenceImage = null;

      for (let j = 0; j < item.images.length; j += 1) {
        const rawImage = item.images[j];
        let src = rawImage.src;
        if (
          item.id === 'a-wide-surrealist-shot-impossible-escher-style-building' &&
          rawImage.fileName === 'Generated Image from Fusara AI (40).png'
        ) {
          // Manifest has legacy filename; real file in folder has mv7 prefix.
          src =
            '../A%20wide%20surrealist%20shot,%20impossible,%20Escher-style%20building/mv7%20Generated%20Image%20from%20Fusara%20AI%20(40).png';
        }

        const image = {
          ...rawImage,
          src,
          model: normalizeModelName(item.id, rawImage.fileName, rawImage.model),
        };

        if (shouldRemoveImage(item.id, image.fileName)) continue;

        if (item.id === 'logo-in-coffee-shop' && image.model === 'Reference') {
          referenceImage = image;
          continue;
        }

        images.push(image);
      }

      if (!images.length) continue;

      output.push({
        ...item,
        prompt: getCasePrompt(item.name),
        referenceImage,
        imagesSorted: sortedImages(images),
      });
    }

    return output;
  }

  const caseState = buildCaseState(manifest.cases).sort((a, b) => {
    const ra = lectureCaseRank.has(a.id) ? lectureCaseRank.get(a.id) : Number.MAX_SAFE_INTEGER;
    const rb = lectureCaseRank.has(b.id) ? lectureCaseRank.get(b.id) : Number.MAX_SAFE_INTEGER;
    if (ra !== rb) return ra - rb;
    return String(a.name || '').localeCompare(String(b.name || ''));
  });

  const state = {
    currentSlide: 0,
    slides: [],
    slideGrids: [],
    stage: null,
    track: null,
    navLinks: [],
  };

  const viewerState = {
    open: false,
    caseIndex: -1,
    imageIndex: -1,
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function findSlideIndexById(idValue) {
    const needle = String(idValue || '').trim().toLowerCase();
    if (!needle) return -1;
    return caseState.findIndex((item) => String(item.id || '').toLowerCase() === needle);
  }

  function findSlideIndexByName(nameValue) {
    const needle = normalizeName(nameValue);
    if (!needle) return -1;
    return caseState.findIndex((item) => normalizeName(item.name) === needle);
  }

  function resolveInitialSlide() {
    const hashValue = String(window.location.hash || '').replace(/^#/, '').trim();
    if (hashValue) {
      const byHashId = findSlideIndexById(hashValue);
      if (byHashId >= 0) return byHashId;
      const byHashName = findSlideIndexByName(hashValue);
      if (byHashName >= 0) return byHashName;
    }

    const params = new URLSearchParams(window.location.search || '');
    const byCase = params.get('case');
    if (byCase) {
      const byCaseId = findSlideIndexById(byCase);
      if (byCaseId >= 0) return byCaseId;
      const byCaseName = findSlideIndexByName(byCase);
      if (byCaseName >= 0) return byCaseName;
    }

    const indexRaw = params.get('slide');
    if (indexRaw && /^-?\d+$/.test(indexRaw)) {
      return clamp(Number(indexRaw) - 1, 0, caseState.length - 1);
    }

    return 0;
  }

  function getImageAspect(image) {
    const aspect = Number(image && image.aspect);
    if (!Number.isFinite(aspect) || aspect <= 0) return 1;
    return clamp(aspect, 0.33, 3.2);
  }

  function estimatePackedHeight(images, cols, cellWidth, gap) {
    let totalHeight = 0;
    let rowMax = 0;

    for (let i = 0; i < images.length; i += 1) {
      const imageHeight = cellWidth / getImageAspect(images[i]);
      rowMax = Math.max(rowMax, imageHeight);

      const isRowEnd = (i + 1) % cols === 0 || i === images.length - 1;
      if (isRowEnd) {
        if (totalHeight > 0) totalHeight += gap;
        totalHeight += rowMax;
        rowMax = 0;
      }
    }

    return totalHeight;
  }

  function chooseBestGrid(images, gridWidth, gridHeight, caseId) {
    const count = images.length;
    const viewportW = window.innerWidth;
    const gap = 6;

    const maxCols = viewportW >= 1680 ? 6 : viewportW >= 1280 ? 5 : 4;
    const minCols = 2;

    const priorityByCase = {
      'jewelry-ad': [3, 4, 2, 5, 6],
    };
    const preferredCols = priorityByCase[caseId] || [4, 3, 2, 5, 6];

    // Pass 1: prefer perfect rows (no tails) in visual priority order.
    let bestExactOverflow = null;
    for (let p = 0; p < preferredCols.length; p += 1) {
      const cols = preferredCols[p];
      if (cols < minCols || cols > maxCols) continue;
      if (count % cols !== 0) continue;

      const cellWidth = (gridWidth - gap * (cols - 1)) / cols;
      if (cellWidth < 80) continue;

      const rows = Math.ceil(count / cols);
      const packedHeight = estimatePackedHeight(images, cols, cellWidth, gap);
      const overflow = packedHeight - gridHeight;
      if (overflow <= 0) return { cols, rows };

      if (!bestExactOverflow || overflow < bestExactOverflow.overflow) {
        bestExactOverflow = { cols, rows, overflow };
      }
    }
    if (bestExactOverflow) return bestExactOverflow;

    const fitCandidates = [];
    let overflowBest = null;

    for (let cols = minCols; cols <= maxCols; cols += 1) {
      const cellWidth = (gridWidth - gap * (cols - 1)) / cols;
      if (cellWidth < 80) continue;

      const rows = Math.ceil(count / cols);
      const emptyCells = cols * rows - count;
      const packedHeight = estimatePackedHeight(images, cols, cellWidth, gap);
      const overflow = packedHeight - gridHeight;
      const freeSpace = gridHeight - packedHeight;

      if (overflow <= 0) {
        const fitScore = cellWidth * 6 - Math.max(0, freeSpace) * 0.55 - emptyCells * 28;
        fitCandidates.push({ cols, rows, fitScore });
        continue;
      }

      const overflowScore = -overflow * 4.2 + cellWidth * 2.2 - emptyCells * 28;
      if (!overflowBest || overflowScore > overflowBest.overflowScore) {
        overflowBest = { cols, rows, overflowScore };
      }
    }

    if (fitCandidates.length) {
      let bestFit = fitCandidates[0];
      for (let i = 1; i < fitCandidates.length; i += 1) {
        if (fitCandidates[i].fitScore > bestFit.fitScore) bestFit = fitCandidates[i];
      }
      return bestFit;
    }

    if (overflowBest) return overflowBest;
    const fallbackCols = Math.max(2, Math.min(maxCols, Math.ceil(Math.sqrt(count))));
    return { cols: fallbackCols, rows: Math.ceil(count / fallbackCols) };
  }

  function applyGridLayoutFor(index) {
    const slideGrid = state.slideGrids[index];
    const item = caseState[index];
    if (!slideGrid || !item) return;

    if (slideGrid.classList.contains('masonry-grid')) {
      const width = Math.max(320, slideGrid.clientWidth - 6);
      const cols = width >= 1680 ? 4 : width >= 1180 ? 3 : 2;
      slideGrid.style.setProperty('--masonry-columns', String(cols));
      return;
    }

    const padding = 6;
    const width = Math.max(320, slideGrid.clientWidth - padding);
    const height = Math.max(220, slideGrid.clientHeight - padding);

    const best = chooseBestGrid(item.imagesSorted, width, height, item.id);
    slideGrid.style.gridTemplateColumns = `repeat(${best.cols}, minmax(0, 1fr))`;
    slideGrid.style.gridTemplateRows = 'none';
  }

  function applyAllGridLayouts() {
    for (let i = 0; i < state.slideGrids.length; i += 1) applyGridLayoutFor(i);
  }

  let heightSyncRaf = 0;

  function syncActiveSlideHeight() {
    if (!state.stage || !state.slides.length) return;
    const activeSlide = state.slides[state.currentSlide];
    if (!activeSlide) return;

    state.stage.style.height = 'auto';
    const nextHeight = Math.ceil(activeSlide.scrollHeight);
    if (nextHeight > 0) state.stage.style.height = `${nextHeight}px`;
  }

  function queueHeightSync() {
    if (heightSyncRaf) cancelAnimationFrame(heightSyncRaf);
    heightSyncRaf = requestAnimationFrame(function () {
      heightSyncRaf = 0;
      syncActiveSlideHeight();
    });
  }

  function updateSlidePosition(animate) {
    if (!state.track) return;

    state.track.style.transition = animate
      ? 'transform 340ms cubic-bezier(0.2, 0.74, 0.2, 1)'
      : 'none';

    state.track.style.transform = `translateX(-${state.currentSlide * 100}%)`;

    if (animate) {
      window.setTimeout(function () {
        if (state.track) {
          state.track.style.transition = 'transform 340ms cubic-bezier(0.2, 0.74, 0.2, 1)';
        }
      }, 360);
    }
  }

  function updateDeckUI() {
    const total = caseState.length;
    const current = state.currentSlide + 1;

    deckProgress.textContent = `${String(current).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

    deckPrev.disabled = state.currentSlide <= 0;
    deckNext.disabled = state.currentSlide >= total - 1;

    deckPrev.style.opacity = deckPrev.disabled ? '0.45' : '1';
    deckNext.style.opacity = deckNext.disabled ? '0.45' : '1';

    for (let i = 0; i < state.navLinks.length; i += 1) {
      const link = state.navLinks[i];
      if (i === state.currentSlide) link.classList.add('active');
      else link.classList.remove('active');
    }
  }

  function goToSlide(index, animate) {
    const clamped = clamp(index, 0, caseState.length - 1);
    if (clamped === state.currentSlide && animate !== false) return;

    state.currentSlide = clamped;
    updateSlidePosition(animate !== false);
    updateDeckUI();

    const activeLink = state.navLinks[state.currentSlide];
    if (activeLink && typeof activeLink.scrollIntoView === 'function') {
      activeLink.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }

    const activeCase = caseState[state.currentSlide];
    if (activeCase && window.history && typeof window.history.replaceState === 'function') {
      const newUrl = `${window.location.pathname}${window.location.search}#${activeCase.id}`;
      window.history.replaceState(null, '', newUrl);
    }

    applyGridLayoutFor(state.currentSlide);
    queueHeightSync();
  }

  function moveSlide(step) {
    goToSlide(state.currentSlide + step, true);
  }

  function renderNavigation(cases) {
    caseNav.innerHTML = '';
    state.navLinks = [];

    for (let index = 0; index < cases.length; index += 1) {
      const item = cases[index];
      const link = document.createElement('a');
      link.className = 'case-link';
      link.href = '#';
      link.textContent = item.name;
      link.addEventListener('click', function (event) {
        event.preventDefault();
        goToSlide(index, true);
      });

      caseNav.appendChild(link);
      state.navLinks.push(link);
    }
  }

  function renderViewerImage() {
    if (viewerState.caseIndex < 0 || viewerState.imageIndex < 0) return;

    const currentCase = caseState[viewerState.caseIndex];
    const currentImage = currentCase.imagesSorted[viewerState.imageIndex];

    viewerImage.src = currentImage.src;
    viewerImage.alt = `${currentCase.name} - ${currentImage.model}`;
    viewerTitle.textContent = currentCase.name;
    viewerMeta.textContent = `${currentImage.model} | ${viewerState.imageIndex + 1}/${currentCase.imagesSorted.length}`;
    viewerPrompt.textContent = currentCase.prompt;
    viewerOpenOriginal.href = currentImage.src;

    const hasMany = currentCase.imagesSorted.length > 1;
    viewerPrev.disabled = !hasMany;
    viewerNext.disabled = !hasMany;
    viewerPrev.style.opacity = hasMany ? '1' : '0.35';
    viewerNext.style.opacity = hasMany ? '1' : '0.35';
  }

  function openViewer(caseIndex, imageIndex) {
    viewerState.open = true;
    viewerState.caseIndex = caseIndex;
    viewerState.imageIndex = imageIndex;

    renderViewerImage();
    viewer.classList.add('open');
  }

  function closeViewer() {
    viewerState.open = false;
    viewerState.caseIndex = -1;
    viewerState.imageIndex = -1;

    viewer.classList.remove('open');

    viewerImage.removeAttribute('src');
    viewerImage.alt = '';
    viewerTitle.textContent = '';
    viewerMeta.textContent = '';
    viewerPrompt.textContent = '';
    viewerOpenOriginal.removeAttribute('href');
  }

  function moveViewer(step) {
    if (!viewerState.open) return;
    const currentCase = caseState[viewerState.caseIndex];
    const total = currentCase.imagesSorted.length;
    if (total <= 1) return;

    viewerState.imageIndex = (viewerState.imageIndex + step + total) % total;
    renderViewerImage();
  }

  function renderSlides(cases) {
    const stage = document.createElement('div');
    stage.className = 'deck-stage';

    const track = document.createElement('div');
    track.className = 'slides-track';

    state.slides = [];
    state.slideGrids = [];

    for (let caseIndex = 0; caseIndex < cases.length; caseIndex += 1) {
      const item = cases[caseIndex];

      const slide = document.createElement('section');
      slide.className = 'slide';
      if (item.referenceImage) slide.classList.add('has-reference');
      slide.classList.add(`case-${item.id}`);

      const head = document.createElement('div');
      head.className = 'slide-head';

      const title = document.createElement('h2');
      title.className = 'slide-title';
      title.textContent = item.name;

      const meta = document.createElement('p');
      meta.className = 'slide-meta';
      meta.textContent = `case ${String(caseIndex + 1).padStart(2, '0')} | all model outputs on one screen`;

      head.appendChild(title);
      head.appendChild(meta);

      const slideGrid = document.createElement('div');
      slideGrid.className = 'slide-grid';
      if (item.id === 'jazz-poster') slideGrid.classList.add('masonry-grid');

      for (let imageIndex = 0; imageIndex < item.imagesSorted.length; imageIndex += 1) {
        const image = item.imagesSorted[imageIndex];

        const tile = document.createElement('article');
        tile.className = 'tile';

        const label = document.createElement('span');
        label.className = 'tile-model';
        label.textContent = image.model;

        const media = document.createElement('div');
        media.className = 'tile-media';

        const img = document.createElement('img');
        img.loading = caseIndex <= 1 ? 'eager' : 'lazy';
        img.decoding = 'async';
        img.src = image.src;
        img.alt = `${item.name} - ${image.model}`;
        img.addEventListener('load', function () {
          if (item.id === 'jazz-poster') applyGridLayoutFor(caseIndex);
          if (state.currentSlide === caseIndex) queueHeightSync();
        });
        img.addEventListener('error', function () {
          if (state.currentSlide === caseIndex) queueHeightSync();
        });

        media.appendChild(img);
        tile.appendChild(label);
        tile.appendChild(media);

        tile.addEventListener('click', function () {
          openViewer(caseIndex, imageIndex);
        });

        slideGrid.appendChild(tile);
      }

      slide.appendChild(head);
      if (item.referenceImage) {
        const reference = document.createElement('div');
        reference.className = 'slide-reference';

        const referenceLabel = document.createElement('div');
        referenceLabel.className = 'slide-reference-label';
        referenceLabel.textContent = 'reference';

        const referenceMedia = document.createElement('div');
        referenceMedia.className = 'slide-reference-media';

        const referenceImg = document.createElement('img');
        referenceImg.src = item.referenceImage.src;
        referenceImg.alt = `${item.name} - reference`;
        referenceImg.loading = 'eager';
        referenceImg.decoding = 'async';
        referenceImg.addEventListener('load', function () {
          if (state.currentSlide === caseIndex) queueHeightSync();
        });

        referenceMedia.appendChild(referenceImg);
        reference.appendChild(referenceLabel);
        reference.appendChild(referenceMedia);
        slide.appendChild(reference);
      }
      slide.appendChild(slideGrid);
      track.appendChild(slide);

      state.slides.push(slide);
      state.slideGrids.push(slideGrid);
    }

    stage.appendChild(track);
    content.innerHTML = '';
    content.appendChild(stage);

    state.stage = stage;
    state.track = track;
  }

  function rebuild() {
    renderNavigation(caseState);
    renderSlides(caseState);
    applyAllGridLayouts();
    updateSlidePosition(false);
    updateDeckUI();
    queueHeightSync();
  }

  function isTextInputTarget(target) {
    if (!target) return false;
    const tag = String(target.tagName || '').toLowerCase();
    return target.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select';
  }

  function isPrevKey(event) {
    return (
      event.key === 'ArrowLeft' ||
      event.code === 'ArrowLeft' ||
      event.key === 'Left' ||
      event.key === 'PageUp' ||
      event.code === 'PageUp' ||
      event.key === 'a' ||
      event.key === 'A' ||
      event.code === 'KeyA'
    );
  }

  function isNextKey(event) {
    return (
      event.key === 'ArrowRight' ||
      event.code === 'ArrowRight' ||
      event.key === 'Right' ||
      event.key === 'PageDown' ||
      event.code === 'PageDown' ||
      event.key === 'd' ||
      event.key === 'D' ||
      event.code === 'KeyD' ||
      event.key === ' '
    );
  }

  function onGlobalKeyDown(event) {
    if (isTextInputTarget(event.target)) return;

    if (viewerState.open) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeViewer();
        return;
      }

      if (isPrevKey(event)) {
        event.preventDefault();
        moveViewer(-1);
        return;
      }

      if (isNextKey(event)) {
        event.preventDefault();
        moveViewer(1);
      }

      return;
    }

    if (isPrevKey(event)) {
      event.preventDefault();
      moveSlide(-1);
      return;
    }

    if (isNextKey(event)) {
      event.preventDefault();
      moveSlide(1);
    }
  }

  deckPrev.addEventListener('click', function () {
    moveSlide(-1);
  });

  deckNext.addEventListener('click', function () {
    moveSlide(1);
  });

  viewerClose.addEventListener('click', closeViewer);
  viewerCloseSide.addEventListener('click', closeViewer);

  viewerPrev.addEventListener('click', function () {
    moveViewer(-1);
  });

  viewerNext.addEventListener('click', function () {
    moveViewer(1);
  });

  viewer.addEventListener('click', function (event) {
    if (event.target === viewer) closeViewer();
  });

  let resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      applyAllGridLayouts();
      updateSlidePosition(false);
      queueHeightSync();
    }, 120);
  });

  window.addEventListener('keydown', onGlobalKeyDown, { capture: true });

  state.currentSlide = resolveInitialSlide();
  rebuild();
})();
