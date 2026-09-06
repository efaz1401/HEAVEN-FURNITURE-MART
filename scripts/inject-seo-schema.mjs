import fs from 'fs';
import path from 'path';
import { PIECES, CATEGORIES } from '../data/pieces.js';

function prerenderCategories() {
  console.log('1. Pre-rendering category grids and injecting Collection schemas...');

  for (const cat of CATEGORIES) {
    const filePath = path.join('collections', cat.slug, 'index.html');
    if (!fs.existsSync(filePath)) continue;

    let html = fs.readFileSync(filePath, 'utf8');
    const piecesInCat = PIECES.filter(p => p.cat === cat.slug);

    // Build static cards HTML
    const cardsHtml = piecesInCat.map(p => {
      const arFlag = p.hasModel
        ? '<span class="ar-flag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/></svg>AR</span>'
        : '';
      const priceFormatted = '৳' + p.price.min.toLocaleString('en-US');

      return `        <a class="piece-card" href="../../piece/${p.id}/">
          <figure class="piece-figure">
            <img src="../../assets/img/${p.id}_cut_512.webp"
                 srcset="../../assets/img/${p.id}_cut_512.webp 512w, ../../assets/img/${p.id}_cut_1024.webp 1024w"
                 sizes="(max-width: 900px) 100vw, 33vw"
                 alt="${p.alt}"
                 width="512" height="512" loading="lazy" decoding="async">
            ${arFlag}
          </figure>
          <div class="piece-body">
            <span class="piece-cat">${cat.name}</span>
            <h3>${p.name}</h3>
            <p class="piece-tag">${p.tagline || ''}</p>
            <div class="piece-foot">
              <span class="piece-foot-k">Made to order</span>
              <span class="piece-price">From ${priceFormatted}</span>
            </div>
          </div>
        </a>`;
    }).join('\n');

    // Replace empty grid with prerendered cards
    html = html.replace(
      /<div class="grid grid--3" id="piece-grid"[^>]*>[\s\S]*?<\/div>/,
      `<div class="grid grid--3" id="piece-grid" style="margin-top:2.5rem">\n${cardsHtml}\n      </div>`
    );

    // Build JSON-LD Schema
    const schemaObj = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "name": `${cat.name} Furniture — Heaven Furniture Mart`,
          "description": cat.blurb,
          "url": `https://yourfirstsite.com/collections/${cat.slug}/`,
          "mainEntity": {
            "@type": "ItemList",
            "name": `${cat.name} Pieces`,
            "numberOfItems": piecesInCat.length,
            "itemListElement": piecesInCat.map((p, idx) => ({
              "@type": "ListItem",
              "position": idx + 1,
              "url": `https://yourfirstsite.com/piece/${p.id}/`,
              "name": p.name,
              "image": `https://yourfirstsite.com/assets/img/og/${p.id}.jpg`
            }))
          }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://yourfirstsite.com/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Collections",
              "item": "https://yourfirstsite.com/collections/"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": cat.name,
              "item": `https://yourfirstsite.com/collections/${cat.slug}/`
            }
          ]
        }
      ]
    };

    const schemaTag = `\n<script type="application/ld+json">\n${JSON.stringify(schemaObj, null, 2)}\n</script>\n`;

    // Remove any existing ld+json in this file first
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, '');

    // Insert schema before </body>
    html = html.replace('</body>', `${schemaTag}</body>`);

    fs.writeFileSync(filePath, html);
    console.log(`  ✓ ${filePath} (${piecesInCat.length} cards pre-rendered + Schema)`);
  }
}

function injectHubSchemas() {
  console.log('\n2. Injecting BreadcrumbList schemas into Hub pages...');

  const hubs = [
    { file: 'collections/index.html', name: 'Collections', path: 'collections/' },
    { file: 'bespoke/index.html', name: 'Bespoke', path: 'bespoke/' },
    { file: 'materials/index.html', name: 'Materials', path: 'materials/' },
    { file: 'about/index.html', name: 'About', path: 'about/' },
    { file: 'ar/index.html', name: 'See it in your room', path: 'ar/' }
  ];

  for (const h of hubs) {
    if (!fs.existsSync(h.file)) continue;
    let html = fs.readFileSync(h.file, 'utf8');

    const schemaObj = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://yourfirstsite.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": h.name,
          "item": `https://yourfirstsite.com/${h.path}`
        }
      ]
    };

    const schemaTag = `\n<script type="application/ld+json">\n${JSON.stringify(schemaObj, null, 2)}\n</script>\n`;

    // Remove any existing ld+json
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, '');

    html = html.replace('</body>', `${schemaTag}</body>`);
    fs.writeFileSync(h.file, html);
    console.log(`  ✓ ${h.file} (BreadcrumbList schema injected)`);
  }
}

function enhanceProductSchemas() {
  console.log('\n3. Enhancing Product schemas with Breadcrumbs & AggregateOffer on piece pages...');

  for (const p of PIECES) {
    const filePath = path.join('piece', p.id, 'index.html');
    if (!fs.existsSync(filePath)) continue;

    let html = fs.readFileSync(filePath, 'utf8');
    const cat = CATEGORIES.find(c => c.slug === p.cat) || { name: 'Furniture', slug: 'collections' };

    // Pre-render piece text and meta lead to prevent CLS
    const priceFormatted = '৳' + Math.round(p.price.min).toLocaleString('en-IN');
    const pMetaHtml = `<div id="p-meta-lead" class="piece-meta-lead"><span class="piece-meta-price">From ${priceFormatted}</span> <span class="piece-meta-dot">·</span> <span class="piece-meta-time">Lead time: ${p.lead}</span></div>`;

    if (html.includes('id="p-meta-lead"')) {
      html = html.replace(/<div id="p-meta-lead"[^>]*>[\s\S]*?<\/div>/, pMetaHtml);
    } else {
      html = html.replace(/(<h1 id="p-name"[^>]*>[\s\S]*?<\/h1>)/, `$1\n      ${pMetaHtml}`);
    }

    if (p.tagline) {
      html = html.replace(/<p class="lead" id="p-tagline"[^>]*>[\s\S]*?<\/p>/, `<p class="lead" id="p-tagline">${p.tagline}</p>`);
    }
    if (p.desc) {
      html = html.replace(/<p id="p-desc"[^>]*>[\s\S]*?<\/p>/, `<p id="p-desc">${p.desc}</p>`);
    }

    // Pre-render stage and model elements based on p.hasModel
    if (!p.hasModel) {
      html = html.replace(/<p class="stage-note" id="stage-note">[\s\S]*?<\/p>/,
        '<p class="stage-note" id="stage-note">Photographed in our showroom. A 3D model for this piece is still being built.</p>');
      html = html.replace(/<button class="stage-poster[^"]*" id="stage-poster"[^>]*>/,
        '<button class="stage-poster stage-poster--static" id="stage-poster" type="button" disabled>');
      html = html.replace(/\s*<span class="play-3d">[\s\S]*?<\/span>/, '');
      html = html.replace(/<button class="stage-exit" id="stage-exit"[^>]*>/,
        '<button class="stage-exit" id="stage-exit" type="button" aria-label="Exit 3D view" hidden>');
      html = html.replace(/<div class="ar-row" id="ar-row"[^>]*>/,
        '<div class="ar-row" id="ar-row" hidden>');
      html = html.replace(/<div class="notice" id="no-model"[^>]*>/,
        '<div class="notice" id="no-model">');
      html = html.replace(/<div class="ar-caveat" id="ar-caveat"[^>]*>/,
        '<div class="ar-caveat" id="ar-caveat" hidden>');
    } else {
      html = html.replace(/<p class="stage-note" id="stage-note">[\s\S]*?<\/p>/,
        '<p class="stage-note" id="stage-note">Tap to load the interactive 3D model.</p>');
      html = html.replace(/<div class="ar-row" id="ar-row"[^>]*>/,
        '<div class="ar-row" id="ar-row">');
      html = html.replace(/<div class="notice" id="no-model"[^>]*>/,
        '<div class="notice" id="no-model" hidden>');
      html = html.replace(/<div class="ar-caveat" id="ar-caveat"[^>]*>/,
        '<div class="ar-caveat" id="ar-caveat">');
    }

    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": p.name,
      "description": p.blurb || `${p.name} handcrafted in Chattogram by Heaven Furniture Mart.`,
      "image": `https://yourfirstsite.com/assets/img/og/${p.id}.jpg`,
      "brand": {
        "@type": "Brand",
        "name": "Heaven Furniture Mart"
      },
      "category": cat.name,
      "material": p.material || "Hardwood, premium upholstery",
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/MadeToOrder",
        "priceCurrency": "BDT",
        "url": `https://yourfirstsite.com/piece/${p.id}/`,
        "priceSpecification": {
          "@type": "PriceSpecification",
          "priceCurrency": "BDT",
          "minPrice": p.price.min,
          "maxPrice": p.price.max,
          "valueAddedTaxIncluded": true
        }
      }
    };

    const breadcrumbsSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://yourfirstsite.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": cat.name,
          "item": `https://yourfirstsite.com/collections/${cat.slug}/`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": p.name,
          "item": `https://yourfirstsite.com/piece/${p.id}/`
        }
      ]
    };

    const schemaTags = `\n<script type="application/ld+json" id="ld-product">\n${JSON.stringify(productSchema, null, 2)}\n</script>\n<script type="application/ld+json" id="ld-crumbs">\n${JSON.stringify(breadcrumbsSchema, null, 2)}\n</script>\n`;

    html = html.replace(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\n?/g, '');
    html = html.replace('</body>', `${schemaTags}</body>`);

    fs.writeFileSync(filePath, html);
  }
  console.log(`  ✓ All ${PIECES.length} piece pages upgraded with Product + BreadcrumbList schema.`);
}

prerenderCategories();
injectHubSchemas();
enhanceProductSchemas();
console.log('\nSEO schema injection and pre-rendering complete!');