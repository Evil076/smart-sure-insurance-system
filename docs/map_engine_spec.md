# SmartSure Map Engine Specification

## 1. Technical Stack

*   **Engine**: Leaflet.js (v1.9.4).
*   **Tile Provider**: OpenStreetMap (Standard Raster).
*   **Integration**: React with Ref-based DOM management.

## 2. Implementation Strategy: "The Hybrid Approach"

Since Leaflet manipulates the DOM directly (imperative), while React manages it via a Virtual DOM (declarative), we use a Ref-based bridge:

1.  **Container Ref (`mapContainerRef`)**: A persistent reference to a `<div>` where Leaflet injects the map.
2.  **Instance Ref (`mapRef`)**: Stores the Leaflet map object instance. This prevents the map from being re-initialized and "flickering" during React re-renders.
3.  **Marker Tracker (`markersRef`)**: An array ref that tracks all currently active markers on the map. This is critical for the "Filter" functionality (clearing old markers before drawing new ones).

## 3. Lifecycle & Data Flow

The map logic is encapsulated in a single `useEffect` hook with `[hospitals, selectedInsurance]` as dependencies:

1.  **Initialization Phase**: Checks if `mapRef.current` is null. If so, it creates the map instance, sets the view to Kisii coordinates, and adds the OpenStreetMap tile layer.
2.  **Cleanup Phase**: Before adding new markers, it iterates through `markersRef.current` and calls `.remove()` on each marker to ensure the map doesn't get cluttered with stale data.
3.  **Filtering Phase**: It performs a client-side filter of the hospitals array based on the `selectedInsurance` prop.
4.  **Rendering Phase**: It iterates through the filtered hospitals, creating an `L.marker` for each.

## 4. Interactive Popups (The React-Leaflet Bridge)

Leaflet popups take raw HTML strings, which makes triggering React functions (`onSelectHospital`) tricky. The solution used:

1.  **HTML Injection**: The popup content includes a button with a unique ID: `id="btn-${h.id}"`.
2.  **Event Delegation**: Leaflet provides a `popupopen` event. When the popup opens, we use a standard `document.getElementById` to find that button and attach a click listener that calls the React callback.

## 5. Essential CSS/HTML Requirements

For the map to render, the following must be true:

1.  The `window.L` global must be available (via CDN in `index.html`).
2.  The map container div must have a defined height (e.g., `h-[500px]`).
3.  The Leaflet CSS must be imported to handle marker positioning and zoom controls.

---

**Summary Instruction for AI Agents:**
"To manage the map, do not use React state for the Leaflet instance; use `useRef`. Synchronize React props to the map inside a `useEffect`. To clear the map, keep an array of active markers in a ref and remove them manually before re-drawing. Use the `popupopen` event to bridge raw HTML popup buttons to React component logic."
