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
      const scenes = [{"id":"world","label":"Dünya editörü","title":"CDKit — Dünya editörü","img":"world-view","head":"Dünyayı olduğu yerde düzenleyin","text":"Açık dünya, arazi, bitki örtüsü, gökyüzü ve tüm nesnelerle birlikte kameranın çevresinde oyundaki gibi akış halinde yüklenir.","list":["WASD ile uç, yörüngede dön, F ile odakla","Snapping ile taşı, döndür, ölçekle","Prefabları sürükle-bırak ile yerleştir","Odak, aşamalar, rotalar ve yollar"]},{"id":"quests","label":"Görev tasarımcısı","title":"CDKit — Görev tasarımcısı","img":"quest-designer","head":"Görevleri tablo değil akış olarak görün","text":"Bir görevi ilk hedeften sonuncusuna kadar bir hikâye gibi okuyun. Değiştirmek için altı çizili herhangi bir kelimeye tıklayın: hedef, ödül, sonrası.","list":["1.000’den fazla oyun şablonundan hedefler","Ödüller, koşullar ve görev zincirleri","Diyalog satırları ve kendi ses dosyalarınız","Her dilde her metin"]},{"id":"characters","label":"Yeni karakterler","title":"CDKit — Yeni karakterler","img":"new-character","head":"Modeliniz Pywel’de hayat bulsun","text":"Model dosyasından kendi animasyonlarına sahip, dünyada duran bir karaktere dört adımda ulaşın.","list":["FBX, glTF, Collada, MetaHuman & Fab","Oyun iskeletine otomatik bağlanır","Klipleriniz bekleme, yürüme, saldırı vb. hareketlere eşlenir","Bir oyun karakterinin durduğu yere yerleştirilir"]},{"id":"items","label":"Eşyalar","title":"CDKit — Eşyalar","img":"items","head":"Tüm eşyalar elinizin altında","text":"Görselleriyle 6.800’den fazla eşyayı arayın. Görsel editörde adları, özellikleri, fiyatları ve yetenekleri değiştirin.","list":["Mevcut eşyalardan yenilerini oluşturun","Kapaklar ve 3D modeller değiştirilebilir","Mağazalar ve ganimet tabloları dahil","CSV ile toplu değişiklik"]},{"id":"files","label":"Oyun dosyaları","title":"CDKit — Oyun dosyaları","img":"model-view","head":"İki milyon dosya, tek arama kutusu","text":"Oyunun tüm dosyalarına göz atın, modelleri, dokuları ve sesleri önizleyin, dışa aktarın veya kendi dosyalarınızla değiştirin.","list":["3D, doku, ses, tablo ve metin görüntüleyicileri","Tek dosyaları veya tüm klasörleri dışa aktar","Düzenlenmiş sürümünüzle değiştir","Oyunu Windows sürücüsü olarak bağla"]},{"id":"map","label":"Dünya haritası","title":"CDKit — Dünya haritası","img":"world-map","head":"Tüm harita tek görünümde","text":"Bölgeler ve doğma alanlarıyla oyunun 2D haritası; tek tıkla 3D görünümü istediğiniz yere taşıyın.","list":["Bölgeler ve doğma katmanları","Adalar ve yeni araziler oluştur","Oynanabilir dünya sınırlarını düzenle","Karakterleri doğma alanlarına yerleştir"]}];
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
        lbImg.alt = t.alt || "Ekran görüntüsü";
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
        t.setAttribute('aria-label', `${"Ekran görüntüsünü aç:"} ${t.alt || "görsel"}`);
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
        try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = "Kopyalandı!"; }
        catch { b.textContent = "Seç ve kopyala"; }
        setTimeout(() => b.textContent = "Kopyala", 1600);
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
        const parts = [`${"En son sürüm"} ${date}`, size, "Windows 10 / 11", "Kendini günceller"].filter(Boolean);
        document.getElementById('releaseLine').innerHTML = parts.map(part => `<span>${part}</span>`).join('');
        document.getElementById('heroBadge').textContent = `${"Yeni sürüm:"} ${date}`;
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
