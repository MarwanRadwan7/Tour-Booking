/* eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibWFyd2FuLXJhZHdhbiIsImEiOiJjbGo0YXU5M3QwMGpzM2x0ZXJ2YWszdHN4In0.kqpiuPpahJuvLyhpJdTiQw';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/marwan-radwan/clj4bso10010401qyh8ns7vlo',
    center: [30.0444, 31.2357],
    zoom: 5,
    interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
