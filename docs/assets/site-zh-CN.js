(() => {

      /* This bundle belongs to the static page in this locale. */
      const currentLocale = document.documentElement.lang || 'en';

const REPO = 'Moon-yungg/CDKit-Releases';
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

      /* nav */
      const nav = document.getElementById('nav');
      const onScroll = () => nav.classList.toggle('scrolled', scrollY > 10);
      addEventListener('scroll', onScroll, { passive: true }); onScroll();
      const menuBtn = document.getElementById('menuBtn');
      const closeMenu = (returnFocus = false) => {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        if (returnFocus) menuBtn.focus();
      };
      menuBtn.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', String(open));
      });
      document.querySelectorAll('#navLinks a').forEach(a => a.addEventListener('click', () => closeMenu()));
      addEventListener('resize', () => { if (innerWidth > 760) closeMenu(); }, { passive: true });
      addEventListener('keydown', e => {
        if (e.key === 'Escape' && nav.classList.contains('open')) closeMenu(true);
      });

      /* reveal on scroll */
      const io = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
      document.querySelectorAll('.reveal').forEach(el => io.observe(el));
      requestAnimationFrame(() => setTimeout(() => document.getElementById('heroShot').classList.add('in'), 120));

      /* card spotlight — mouse, pen and touch */
      document.querySelectorAll('.card').forEach(card => {
        const moveSpotlight = e => {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
          card.style.setProperty('--my', (e.clientY - r.top) + 'px');
          card.classList.add('spotlight-active');
        };
        const clearSpotlight = () => card.classList.remove('spotlight-active');
        card.addEventListener('pointermove', moveSpotlight, { passive: true });
        card.addEventListener('pointerleave', clearSpotlight);
        card.addEventListener('pointercancel', clearSpotlight);
        card.addEventListener('pointerup', e => {
          if (e.pointerType !== 'mouse') clearSpotlight();
        });
      });

      /* showcase */
      const scenes = [{"id":"world","label":"世界编辑器","title":"CDKit — 世界编辑器","img":"world-view","head":"直接在世界中编辑世界","text":"开放世界会围绕相机流式加载地形、植被、天空和所有对象，与游戏中的呈现一致。","list":["使用 WASD 飞行、环绕观察，按 F 聚焦","移动、旋转、缩放并支持吸附","拖放即可放置预制体","焦点、阶段、路线与道路"]},{"id":"quests","label":"任务设计器","title":"CDKit — 任务设计器","img":"quest-designer","head":"以流程编辑任务，而不是面对电子表格","text":"像读故事一样阅读任务，从第一个目标到最后一个。点击任何带下划线的词即可修改：目标、奖励、后续内容。","list":["从 1,000+ 个游戏模板创建目标","奖励、条件与任务链","对白文本与自定义语音文件","所有语言中的所有文本"]},{"id":"characters","label":"新角色","title":"CDKit — 新角色","img":"new-character","head":"让你的模型在 Pywel 中鲜活起来","text":"只需四步，就能把模型文件变成拥有独立动画、站在世界中的角色。","list":["FBX, glTF, Collada, MetaHuman & Fab","自动绑定到游戏骨骼","将你的动画片段映射到待机、行走、攻击等动作","放置到游戏角色所在的位置"]},{"id":"items","label":"物品","title":"CDKit — 物品","img":"items","head":"所有物品尽在掌握","text":"搜索 6,800+ 个带图片的物品，并在可视化编辑器中修改名称、属性、价格和能力。","list":["基于现有物品创建新物品","可替换封面和 3D 模型","包含商店与掉落表","通过 CSV 批量修改"]},{"id":"files","label":"游戏文件","title":"CDKit — 游戏文件","img":"model-view","head":"两百万个文件，一个搜索框","text":"浏览游戏中的每个文件，预览模型、纹理和声音，导出它们或替换成你自己的文件。","list":["3D、纹理、音频、表格和文本查看器","导出单个文件或整个文件夹","替换为你编辑后的版本","将游戏挂载为 Windows 驱动器"]},{"id":"map","label":"世界地图","title":"CDKit — 世界地图","img":"world-map","head":"一屏查看完整地图","text":"查看包含区域和生成区的游戏 2D 地图，并可一键让 3D 视图跳转到任意位置。","list":["区域与生成图层","创建岛屿和新地形","编辑可游玩世界边界","把角色放入生成区域"]}];
            const tabs = document.getElementById('tabs');
      const img = document.getElementById('stageImg');
      const showcasePanel = document.getElementById('showcasePanel');
      let auto = null, current = 0;
      const stopAuto = () => { clearInterval(auto); auto = null; tabs.classList.remove('auto'); };
      const show = (s, focus) => {
        current = scenes.findIndex(scene => scene.id === s.id);
        tabs.querySelectorAll('.tab').forEach(t => {
          const selected = t.dataset.id === s.id;
          t.setAttribute('aria-selected', String(selected));
          t.tabIndex = selected ? 0 : -1;
        });
        const selectedTab = tabs.querySelector(`[data-id="${s.id}"]`);
        showcasePanel.setAttribute('aria-labelledby', selectedTab.id);
        img.style.opacity = 0;
        const next = new Image();
        next.src = `../assets/shots/${s.img}.webp`;
        const swap = () => { img.src = next.src; img.alt = s.head; img.style.opacity = 1; };
        next.decode ? next.decode().then(swap, swap) : (next.onload = swap);
        document.getElementById('stageHead').textContent = s.head;
        document.getElementById('stageText').textContent = s.text;
        const stageList = document.getElementById('stageList');
        stageList.replaceChildren(...s.list.map(line => {
          const li = document.createElement('li');
          li.textContent = line;
          return li;
        }));
        if (focus) selectedTab.focus();
      };
      scenes.forEach((s, i) => {
        const b = tabs.querySelector(`[data-id="${s.id}"]`) || document.createElement('button');
        b.className = 'tab'; b.type = 'button'; b.role = 'tab'; b.dataset.id = s.id; b.id = `tab-${s.id}`;
        b.setAttribute('aria-controls', 'showcasePanel');
        b.textContent = s.label;
        b.addEventListener('click', () => { show(s); stopAuto(); });
        b.addEventListener('keydown', e => {
          let nextIndex = null;
          if (e.key === 'ArrowRight') nextIndex = (i + 1) % scenes.length;
          if (e.key === 'ArrowLeft') nextIndex = (i + scenes.length - 1) % scenes.length;
          if (e.key === 'Home') nextIndex = 0;
          if (e.key === 'End') nextIndex = scenes.length - 1;
          if (nextIndex === null) return;
          e.preventDefault();
          show(scenes[nextIndex], true);
          stopAuto();
        });
        if (!b.isConnected) tabs.appendChild(b);
      });
      show(scenes[0]);
show(scenes[current]);
      });
      const startAuto = () => {
        if (reduced || auto) return;
        tabs.classList.add('auto');
        show(scenes[current]);
        auto = setInterval(() => show(scenes[(current + 1) % scenes.length]), 6000);
      };
      new IntersectionObserver(([e]) => e.isIntersecting ? startAuto() : stopAuto(), { threshold: .4 })
        .observe(document.getElementById('showcase'));

      /* lightbox */
      const lb = document.getElementById('lightbox');
      const lbImg = lb.querySelector('img');
      const lbClose = lb.querySelector('.lightbox-close');
      let lightboxReturnFocus = null;
      const openLb = t => {
        lightboxReturnFocus = t;
        lbImg.src = t.currentSrc || t.src;
        lbImg.alt = t.alt || "截图";
        lb.classList.add('open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        lbClose.focus();
      };
      const closeLb = () => {
        if (!lb.classList.contains('open')) return;
        lb.classList.remove('open');
        lb.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        if (lightboxReturnFocus) lightboxReturnFocus.focus();
      };
      const zoomable = document.querySelectorAll('.window img, .card.wide img');
      zoomable.forEach(t => {
        t.tabIndex = 0;
        t.setAttribute('role', 'button');
        t.setAttribute('aria-label', `${"打开截图："} ${t.alt || "图片"}`);
        t.addEventListener('keydown', e => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          openLb(t);
        });
      });
document.addEventListener('click', e => {
        const t = e.target.closest('.window img, .card.wide img');
        if (t) openLb(t);
      });
      lb.addEventListener('click', e => {
        if (e.target === lb || e.target === lbImg || e.target === lbClose) closeLb();
      });
      addEventListener('keydown', e => {
        if (e.key === 'Escape') closeLb();
        if (e.key === 'Tab' && lb.classList.contains('open')) {
          e.preventDefault();
          lbClose.focus();
        }
      });

      /* copy */
      document.querySelectorAll('.copy').forEach(b => b.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = "已复制！"; }
        catch { b.textContent = "选择并复制"; }
        setTimeout(() => b.textContent = "复制", 1600);
      }));

      /* counters */
      const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : Math.round(n).toLocaleString(currentLocale);
      const cio = new IntersectionObserver(entries => entries.forEach(e => {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        const el = e.target, to = +el.dataset.count, suffix = el.dataset.suffix || '';
        if (reduced) return;
        const t0 = performance.now(), dur = 1400;
        const tick = t => {
          const p = Math.min(1, (t - t0) / dur), v = to * (1 - Math.pow(1 - p, 3));
          el.textContent = fmt(v) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }), { threshold: .6 });
      document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

      /* latest release */
      let latestRelease = null;
      const renderLatestRelease = () => {
        if (!latestRelease) return;
        const { rel, zip } = latestRelease;
        const date = new Date(rel.published_at).toLocaleDateString(currentLocale, { year: 'numeric', month: 'short', day: 'numeric' });
        const size = zip ? (zip.size / 1048576).toFixed(0) + ' MB' : '';
        const parts = [`${"最新版本"} ${date}`, size, "Windows 10 / 11", "自动更新"].filter(Boolean);
        document.getElementById('releaseLine').innerHTML = parts.map(part => `<span>${part}</span>`).join('');
        document.getElementById('heroBadge').textContent = `${"新版本："} ${date}`;
      };
      fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } })
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(rel => {
          const zip = (rel.assets || []).find(a => /\.zip$/i.test(a.name));
          if (zip) document.getElementById('downloadBtn').href = zip.browser_download_url;
          latestRelease = { rel, zip };
          renderLatestRelease();
        })
        .catch(() => { });

      /* embers */
      const cv = document.getElementById('embers');
      if (!reduced && cv.getContext) {
        const ctx = cv.getContext('2d');
        const canvasHost = cv.parentElement;
        let w, h, dpr, parts = [];
        const resize = () => {
          dpr = Math.min(2, devicePixelRatio || 1);
          w = Math.max(1, canvasHost.clientWidth);
          h = Math.max(1, canvasHost.clientHeight);
          cv.width = Math.round(w * dpr);
          cv.height = Math.round(h * dpr);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          const count = Math.round(Math.min(90, w / 14));
          parts = Array.from({ length: count }, () => spawn(true));
        };
        const spawn = initial => ({
          x: Math.random() * w, y: initial ? Math.random() * h : h + 10,
          r: Math.random() * 1.8 + .4, vy: Math.random() * .45 + .15, vx: (Math.random() - .5) * .25,
          a: Math.random() * .6 + .25, ph: Math.random() * Math.PI * 2,
          hue: 0
        });
        let visible = true;
        new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(cv);
        const loop = t => {
          if (visible) {
            ctx.clearRect(0, 0, w, h);
            for (const p of parts) {
              p.y -= p.vy; p.x += p.vx + Math.sin(t / 1600 + p.ph) * .2;
              if (p.y < -10) Object.assign(p, spawn(false));
              const fade = Math.min(1, p.y / (h * .35));
              ctx.beginPath();
              ctx.fillStyle = `rgba(255,255,255, ${p.a * fade})`;
              ctx.shadowColor = 'rgba(255,255,255,0.9)'; ctx.shadowBlur = 12;
              ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
            }
          }
          requestAnimationFrame(loop);
        };
        if ('ResizeObserver' in window) {
          new ResizeObserver(resize).observe(canvasHost);
        } else {
          addEventListener('resize', resize, { passive: true });
        }
        resize();
        requestAnimationFrame(loop);
      }
    })();
