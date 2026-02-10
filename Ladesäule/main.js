// Leaflet-Karte mit Marker-Vergrößerung und sanfter Animation per CSS
let map;
let markers2025 = [];
let markers2030 = [];
let heatLayer2025;
let heatLayer2030;
let districtsLayer;
let selectedMarker = null;
let allDistrictLayers = []; // Hilfsspeicher

function syncNavHeight() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;

  const setHeight = () => {
    const height = Math.round(nav.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--nav-height', `${height}px`);
    if (map) map.invalidateSize();
  };

  setHeight();
  window.addEventListener('resize', setHeight);
}

function setupMobileMenu() {
  const mobileMenu = document.querySelector('.mobile-menu');
  const navLinks = document.querySelector('.nav-links');
  if (!mobileMenu || !navLinks) return;

  const resetIcon = () => {
    const spans = mobileMenu.querySelectorAll('span');
    spans.forEach(span => {
      span.style.transform = 'none';
      span.style.opacity = '1';
    });
  };

  mobileMenu.addEventListener('click', () => {
    navLinks.classList.toggle('active');

    const spans = mobileMenu.querySelectorAll('span');
    spans.forEach((span, index) => {
      span.style.transform = navLinks.classList.contains('active') ?
        (index === 0 ? 'rotate(45deg) translate(5px, 5px)' :
          index === 1 ? 'scaleX(0)' :
          'rotate(-45deg) translate(7px, -6px)') : 'none';
      if (index === 1) span.style.opacity = navLinks.classList.contains('active') ? '0' : '1';
    });
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      resetIcon();
    });
  });
}

function toggleIframeSize() {
  const iframe = document.getElementById('streetview-iframe');
  if (iframe) {
    if (iframe.style.width === '600px') {
      iframe.style.width = '300px';
      iframe.style.height = '200px';
    } else {
      iframe.style.width = '600px';
      iframe.style.height = '400px';
    }
  }
}

function loadDistricts() {
  fetch('karlsruhe_stadtteile.json')
    .then(res => res.json())
    .then(data => {
      allDistrictLayers = []; // reset (falls reload)
      districtsLayer = L.geoJSON(data, {
        pane: 'districtsPane',
        style: {
          color: '#0000ff',
          weight: 2,
          fillOpacity: 0.3,
          fillColor: '#ffffff'
        },
        onEachFeature: (feature, layer) => {
          allDistrictLayers.push(layer);
        }
      }).addTo(map);
    })
    .catch(error => console.error('Fehler beim Laden der Stadtteile:', error));
}

function applyDistrictFilter() {
  const selected = document.getElementById('districtFilter').value;
  if (!districtsLayer) return;

  // alle Layer erst entfernen + zurücksetzen
  allDistrictLayers.forEach(layer => {
    map.removeLayer(layer);
    layer.setStyle({
      fillOpacity: 0,
      color: '#0000ff',
      weight: 2,
      fillColor: '#ffffff'
    });
  });

  if (selected === "all") {
    allDistrictLayers.forEach(layer => {
      layer.setStyle({
        fillOpacity: 0.3,
        color: '#0000ff',
        weight: 2,
        fillColor: '#ffffff'
      });
      layer.addTo(map);
    });
    return;
  }

  const selectedLayer = allDistrictLayers.find(
    layer => layer.feature?.properties?.name === selected
  );

  if (selectedLayer) {
    selectedLayer.setStyle({
      fillOpacity: 0.2,
      color: '#007aff',
      weight: 3,
      fillColor: '#007aff'
    });
    selectedLayer.addTo(map);
    map.fitBounds(selectedLayer.getBounds());
  }
}

const greenIcon = L.divIcon({
  className: 'custom-marker green',
  html: '<div></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const blueIcon = L.divIcon({
  className: 'custom-marker blue',
  html: '<div></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const yellowIcon = L.divIcon({
  className: 'custom-marker yellow',
  html: '<div></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

function resetMarker(marker) {
  if (marker && marker._icon) {
    marker._icon.classList.remove('marker-enlarged');
  }
}

function createInteractiveMarker(lat, lng, popupText, icon) {
  const marker = L.marker([lat, lng], { icon }).bindPopup(popupText);

  marker.on('click', (e) => {
    L.DomEvent.stopPropagation(e);
    if (selectedMarker && selectedMarker !== marker) {
      resetMarker(selectedMarker);
    }
    selectedMarker = marker;

    if (marker._icon) {
      marker._icon.classList.add('marker-enlarged');
    } else {
      marker.once('add', () => {
        if (marker._icon) {
          marker._icon.classList.add('marker-enlarged');
        }
      });
    }
  });

  return marker;
}

function initMap() {
  map = L.map('map', {
    center: [49.0069, 8.4037],
    zoom: 13,
    maxBounds: L.latLngBounds([48.95, 8.30], [49.09, 8.55]),
    maxBoundsViscosity: 1.0,
    minZoom: 12,
    maxZoom: 18
  });

  // Custom Panes für Layer-Reihenfolge (höherer zIndex = weiter oben)
  map.createPane('districtsPane');
  map.getPane('districtsPane').style.zIndex = 350;

  map.createPane('heatPane');
  map.getPane('heatPane').style.zIndex = 400;

  const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  );

  satellite.addTo(map);

  loadDistricts();

  map.on('click', () => {
    if (selectedMarker) {
      resetMarker(selectedMarker);
      selectedMarker = null;
    }
  });

  document.addEventListener('click', (e) => {
    const isMarker = e.target.closest('.leaflet-marker-icon');
    if (!isMarker && selectedMarker) {
      resetMarker(selectedMarker);
      selectedMarker = null;
    }
  });
}

function updateMarkers() {
  const year = document.getElementById('yearFilter').value;
  const filterType = document.getElementById('typeFilter').value;
  const anzahlFilter = document.getElementById('anzahlFilter').value;
  const minPower = parseInt(document.getElementById('powerFilter').value);

  // Marker-Auswahl zurücksetzen
  if (selectedMarker) {
    resetMarker(selectedMarker);
    selectedMarker = null;
  }

  // Alte Marker und Heatmaps entfernen
  markers2025.concat(markers2030).forEach(obj => map.removeLayer(obj.marker));
  if (heatLayer2025) map.removeLayer(heatLayer2025);
  if (heatLayer2030) map.removeLayer(heatLayer2030);

  // Heatmap anzeigen?
  if (document.getElementById('viewMode').value === 'heat') {
    if (year === '2026' && heatLayer2025) heatLayer2025.addTo(map);
    if (year === '2030' && heatLayer2030) heatLayer2030.addTo(map);
    return;
  }

  // 2030 = Bestand + Planung (wie bei dir bisher)
  const activeMarkers = (year === '2026') ? markers2025 : markers2025.concat(markers2030);

  activeMarkers.forEach(obj => {
    const art = (obj.art || '').toLowerCase();
    const anzahl = obj.anzahl || 1;
    const leistung = obj.leistung || 0;

    const matchTyp =
      filterType === 'all' ||
      (filterType === 'schnell' && art.includes('schnell')) ||
      (filterType === 'normal' && art.includes('normal'));

    const matchAnzahl =
      anzahlFilter === 'all' ||
      (anzahlFilter === '1' && anzahl === 1) ||
      (anzahlFilter === '2-3' && anzahl >= 2 && anzahl <= 3) ||
      (anzahlFilter === '4plus' && anzahl >= 4);

    const matchPower = leistung >= minPower;

    if (matchTyp && matchAnzahl && matchPower) obj.marker.addTo(map);
  });
}

function populateTypeDropdown() {
  const year = document.getElementById('yearFilter').value;
  const typeSelect = document.getElementById('typeFilter');

  if (year === '2026') {
    typeSelect.innerHTML = `
      <option value="all">Alle Ladepunkte (527)</option>
      <option value="schnell">Nur Schnelllader (142)</option>
      <option value="normal">Nur Normallader (385)</option>
    `;
  } else {
    // 2030 Ziel: 1600 Gesamt, 432 DC (27%), 1168 AC (73%)
    typeSelect.innerHTML = `
      <option value="all">Alle Ladepunkte (1600)</option>
      <option value="schnell">Nur Schnelllader (432)</option>
      <option value="normal">Nur Normallader (1168)</option>
    `;
  }
}

function loadData() {
  // 2026 Ist-Stand
  Papa.parse("geocache_karlsruhe.csv", {
    download: true,
    header: true,
    complete: function(results) {
      const heatData = [];

      markers2025 = []; // reset (falls reload)
      results.data.forEach(station => {
        const lat = parseFloat(station.Latitude);
        const lng = parseFloat(station.Longitude);

        const leistung = parseFloat(station["Nennleistung [kW]"]) || 1;
        const anzahl = parseInt(station["Anzahl Ladepunkte"]) || 1;
        const art = (station["Art der Ladeeinrichtung"] || '').toLowerCase();

        if (!isNaN(lat) && !isNaN(lng)) {
          const icon = art.includes('schnell') ? greenIcon : blueIcon;

          const popup = `
            <strong style='display:block;margin-bottom:8px;'>${station["Volladresse"] || "Adresse unbekannt"}</strong>
            Leistung: ${leistung} kW<br>
            <span style='display:block;margin-bottom:8px;'>Anzahl Ladepunkte: ${anzahl}</span>
            <div style="position:relative;">
              <iframe id="streetview-iframe"
                src="https://maps.google.com/maps?q=${lat},${lng}&output=embed&maptype=satellite&layer=c&cbp=13,0,0,0,0"
                width="300" height="200" style="border:0;"></iframe>
            </div>`;

          const marker = createInteractiveMarker(lat, lng, popup, icon);
          markers2025.push({ marker, art, anzahl, leistung });
          heatData.push([lat, lng, Math.min(leistung / 150, 1)]);
        }
      });

      heatLayer2025 = L.heatLayer(heatData, {
        radius: 25,
        blur: 35,
        maxZoom: 17,
        minOpacity: 0.9,
        pane: 'heatPane'
      });

      // 2030 Planung (NEU, wissenschaftlich berechnet)
      Papa.parse("ladepunkte_neu_2030.csv", {
        download: true,
        header: true,
        complete: function(results2030) {
          const heatData2030 = [];
          markers2030 = []; // reset

          results2030.data.forEach(station => {
            const lat = parseFloat(station.Latitude);
            const lng = parseFloat(station.Longitude);

            const anzahl = parseInt(station["Anzahl Ladepunkte"]) || 1;
            const leistung = parseFloat(station["Nennleistung [kW]"]) || 1;

            const artRaw = station["Art der Ladeeinrichtung"] || "";
            const art = artRaw.toLowerCase();

            if (!isNaN(lat) && !isNaN(lng)) {
              const stadtteil = station["Stadtteil"] ? `<br>Stadtteil: ${station["Stadtteil"]}` : "";
              const begruendung = station["Begründung"] ? `<br>Begründung: ${station["Begründung"]}` : "";

              const popup = `
                <strong style='display:block;margin-bottom:8px;'>Geplant 2030</strong>
                Art: ${artRaw || "unbekannt"}<br>
                Leistung: ${leistung} kW<br>
                <span style='display:block;margin-bottom:8px;'>Anzahl Ladepunkte: ${anzahl}</span>
                ${stadtteil}
                ${begruendung}
                <div style="position:relative;">
                  <iframe id="streetview-iframe"
                    src="https://maps.google.com/maps?q=${lat},${lng}&output=embed&maptype=satellite&layer=c&cbp=13,0,0,0,0"
                    width="300" height="200" style="border:0;"></iframe>
                </div>`;

              const marker = createInteractiveMarker(lat, lng, popup, yellowIcon);
              markers2030.push({ marker, art, anzahl, leistung });
              heatData2030.push([lat, lng, Math.min(leistung / 300, 1)]);
            }
          });

          heatLayer2030 = L.heatLayer(heatData2030, {
            radius: 25,
            blur: 35,
            maxZoom: 17,
            minOpacity: 0.9,
            pane: 'heatPane'
          });

          populateTypeDropdown();
          updateMarkers();
        }
      });
    }
  });
}

// Slider fill update function
function updateSliderFill(slider) {
  const value = slider.value;
  const min = slider.min || 0;
  const max = slider.max || 300;
  const percentage = ((value - min) / (max - min)) * 100;
  slider.style.background = `linear-gradient(90deg, #10b981 0%, #10b981 ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`;
}

document.addEventListener('DOMContentLoaded', () => {
  syncNavHeight();
  setupMobileMenu();
  initMap();
  loadData();

  // District filter – nur EIN Listener
  document.getElementById('districtFilter').addEventListener('change', () => {
    applyDistrictFilter();
  });

  // Marker-Filter
  ['typeFilter', 'anzahlFilter', 'powerFilter'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateMarkers);
  });

  // Jahrwechsel
  document.getElementById('yearFilter').addEventListener('change', () => {
    populateTypeDropdown();
    updateMarkers();
  });

  // Power-Slider Label + Fill
  document.getElementById('powerFilter').addEventListener('input', e => {
    document.getElementById('powerValue').textContent = e.target.value;
    updateSliderFill(e.target);
  });
  updateSliderFill(document.getElementById('powerFilter'));

  // ViewMode nur EINMAL registrieren (Bugfix)
  document.getElementById('viewMode').addEventListener('change', () => {
    const viewMode = document.getElementById('viewMode').value;
    const powerFilter = document.getElementById('powerFilter');

    if (viewMode === 'heat') {
      powerFilter.disabled = true;
      powerFilter.style.opacity = "0.5";
    } else {
      powerFilter.disabled = false;
      powerFilter.style.opacity = "1";
    }

    updateMarkers();
  });

  // Mobile Controls Toggle
  const controlsToggle = document.getElementById('controlsToggle');
  const controlsPanel = document.getElementById('controlsPanel');

  if (controlsToggle && controlsPanel) {
    controlsToggle.addEventListener('click', () => {
      controlsPanel.classList.toggle('open');
      controlsToggle.classList.toggle('active');
    });

    document.getElementById('map').addEventListener('click', () => {
      if (controlsPanel.classList.contains('open')) {
        controlsPanel.classList.remove('open');
        controlsToggle.classList.remove('active');
      }
    });
  }

  // Accordion
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const body = header.nextElementSibling;
      const symbol = header.querySelector('.symbol');
      const isOpen = body.style.display === 'block';

      document.querySelectorAll('.accordion-body').forEach(b => b.style.display = 'none');
      document.querySelectorAll('.accordion-header .symbol').forEach(s => s.textContent = '+');

      if (!isOpen) {
        body.style.display = 'block';
        symbol.textContent = '−';
      }
    });
  });

  // FAQ Overlay
  const faqBtn = document.getElementById('faqBtn');
  const faqOverlay = document.getElementById('faqOverlay');
  const closeFaq = document.getElementById('closeFaq');

  if (faqBtn && faqOverlay) {
    faqBtn.addEventListener('click', () => faqOverlay.style.display = 'block');
  }

  if (closeFaq) {
    closeFaq.addEventListener('click', () => faqOverlay.style.display = 'none');
  }
});
