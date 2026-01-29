
// Enhanced Lottie JSON structures for specific ingredients
// Colors are normalized [0-1]

// Helper to create a base Lottie JSON structure
const createBaseLottie = (layers: any[]) => ({
  v: "5.5.7",
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "Animation",
  ddd: 0,
  assets: [],
  layers: layers,
});

// Helper: Transform
const createTransform = (scale = 100, rotate = 0, x = 0, y = 0) => ({
  a: 0,
  k: [0, 0, 0], // Anchor Point
  p: { a: 0, k: [x, y, 0] }, // Position
  s: { a: 1, k: [{t: 0, s: [scale, scale, 100]}, {t: 30, s: [scale * 1.05, scale * 1.05, 100]}, {t: 60, s: [scale, scale, 100]}] }, // Scale (Pulsing)
  r: { a: 0, k: rotate }, // Rotation
  o: { a: 0, k: 100 }, // Opacity
});

// Helper: Fill
const createFill = (r: number, g: number, b: number) => ({
  ty: "fl", 
  c: { a: 0, k: [r, g, b, 1] }, 
  o: { a: 0, k: 100 }, 
  nm: "Fill"
});

// Helper: Stroke
const createStroke = (r: number, g: number, b: number, width: number) => ({
  ty: "st", 
  c: { a: 0, k: [r, g, b, 1] }, 
  o: { a: 0, k: 100 }, 
  w: { a: 0, k: width },
  nm: "Stroke"
});

// Helper: Rect
const createRect = (w: number, h: number, r: number, x = 0, y = 0) => ({
  d: 1, 
  ty: "rc", 
  s: { a: 0, k: [w, h] }, 
  p: { a: 0, k: [x, y] }, 
  r: { a: 0, k: r }, 
  nm: "Rect"
});

// Helper: Ellipse
const createEllipse = (w: number, h: number, x = 0, y = 0) => ({
  d: 1, 
  ty: "el", 
  s: { a: 0, k: [w, h] }, 
  p: { a: 0, k: [x, y] }, 
  nm: "Ellipse"
});

// --- Specific Layers ---

// 1. Flour (Harina) - Sack with label
const createFlourLayer = () => ({
  ddd: 0, ind: 1, ty: 4, nm: "Flour", sr: 1,
  ks: {
    o: { k: 100 }, r: { k: 0 }, p: { k: [50, 50, 0] }, a: { k: [0, 0, 0] },
    s: { a: 1, k: [{t: 0, s: [100, 100, 100]}, {t: 30, s: [105, 95, 100]}, {t: 60, s: [100, 100, 100]}] } // Squish
  },
  shapes: [{
    ty: "gr",
    it: [
      // Sack Body
      { ...createRect(50, 60, 8, 0, 5), ...{nm: "BodyPath"} },
      createFill(0.96, 0.96, 0.90), // Cream
      // Sack Top (Ruffle)
      { ...createRect(40, 15, 4, 0, -28), ...{nm: "TopPath"} },
      createFill(0.94, 0.94, 0.88), // Slightly darker cream
      // Label Background
      { ...createRect(30, 20, 2, 0, 5), ...{nm: "LabelPath"} },
      createFill(1, 1, 1), // White
      // Label Lines (Text)
      { ...createRect(20, 2, 0, 0, 2), ...{nm: "Line1"} },
      createFill(0.8, 0.8, 0.8),
      { ...createRect(20, 2, 0, 0, 8), ...{nm: "Line2"} },
      createFill(0.8, 0.8, 0.8),
      // Transform for Group
      { ty: "tr", p: { k: [0, 0] }, a: { k: [0, 0] }, s: { k: [100, 100] }, r: { k: 0 }, o: { k: 100 } }
    ]
  }]
});

// 2. Sugar (Azucar) - Packet with Circle
const createSugarLayer = () => ({
  ddd: 0, ind: 1, ty: 4, nm: "Sugar", sr: 1,
  ks: {
    o: { k: 100 }, r: { k: 0 }, p: { k: [50, 50, 0] }, a: { k: [0, 0, 0] },
    s: { a: 1, k: [{t: 0, s: [100, 100, 100]}, {t: 30, s: [102, 102, 100]}, {t: 60, s: [100, 100, 100]}] }
  },
  shapes: [{
    ty: "gr",
    it: [
      // Packet Body
      { ...createRect(45, 65, 4, 0, 0), ...{nm: "BodyPath"} },
      createFill(0.98, 0.98, 0.98), // White
      // Blue Circle Logo
      { ...createEllipse(20, 20, 0, -5), ...{nm: "LogoPath"} },
      createFill(0.2, 0.6, 1), // Blue
      // Sugar Text Lines
      { ...createRect(25, 3, 1, 0, 15), ...{nm: "TextPath"} },
      createFill(0.8, 0.8, 0.8),
      // Transform
      { ty: "tr", p: { k: [0, 0] }, a: { k: [0, 0] }, s: { k: [100, 100] }, r: { k: 0 }, o: { k: 100 } }
    ]
  }]
});

// 3. Bread (Pan) - Baguette style with cuts
const createBreadLayer = () => ({
  ddd: 0, ind: 1, ty: 4, nm: "Bread", sr: 1,
  ks: {
    o: { k: 100 }, r: { k: 1, k: [{t:0, s:[0]}, {t:15, s:[5]}, {t:45, s:[-5]}, {t:60, s:[0]}] }, // Rocking
    p: { k: [50, 50, 0] }, a: { k: [0, 0, 0] },
    s: { k: [100, 100, 100] }
  },
  shapes: [{
    ty: "gr",
    it: [
      // Main Loaf
      { ...createEllipse(80, 40, 0, 0), ...{nm: "LoafPath"} },
      createFill(0.85, 0.6, 0.2), // Golden Brown
      // Cuts (simulated with rotated rects or small ellipses)
      // We need separate groups for rotated items inside the main group to rotate them individually, 
      // but standard Lottie shape groups don't support individual transforms easily without nesting.
      // We'll use simple ellipses shifted.
      { ...createEllipse(10, 25, -20, -5), ...{nm: "Cut1"} },
      createFill(0.95, 0.8, 0.4), // Light inside
      { ...createEllipse(10, 25, 0, -5), ...{nm: "Cut2"} },
      createFill(0.95, 0.8, 0.4),
      { ...createEllipse(10, 25, 20, -5), ...{nm: "Cut3"} },
      createFill(0.95, 0.8, 0.4),
      
      // Transform
      { ty: "tr", p: { k: [0, 0] }, a: { k: [0, 0] }, s: { k: [100, 100] }, r: { k: -15 }, o: { k: 100 } } // Tilted bread
    ]
  }]
});

// 4. Chipa - Bun with spots
const createChipaLayer = () => ({
  ddd: 0, ind: 1, ty: 4, nm: "Chipa", sr: 1,
  ks: {
    o: { k: 100 }, r: { k: 0 }, p: { k: [50, 50, 0] }, a: { k: [0, 0, 0] },
    s: { a: 1, k: [{t: 0, s: [100, 100, 100]}, {t: 30, s: [110, 110, 100]}, {t: 60, s: [100, 100, 100]}] }
  },
  shapes: [{
    ty: "gr",
    it: [
      // Bun
      { ...createEllipse(55, 50, 0, 0), ...{nm: "BunPath"} },
      createFill(0.95, 0.8, 0.3), // Cheesy Gold
      // Spots (Cheese/Toast marks)
      { ...createEllipse(8, 6, -15, -10), ...{nm: "Spot1"} },
      createFill(0.8, 0.6, 0.1), // Darker
      { ...createEllipse(6, 6, 12, -12), ...{nm: "Spot2"} },
      createFill(0.8, 0.6, 0.1),
      { ...createEllipse(7, 7, 0, 10), ...{nm: "Spot3"} },
      createFill(0.8, 0.6, 0.1),
      { ...createEllipse(5, 5, 18, 8), ...{nm: "Spot4"} },
      createFill(0.8, 0.6, 0.1),
      // Transform
      { ty: "tr", p: { k: [0, 0] }, a: { k: [0, 0] }, s: { k: [100, 100] }, r: { k: 0 }, o: { k: 100 } }
    ]
  }]
});

// 5. Yerba - Green Package
const createYerbaLayer = () => ({
  ddd: 0, ind: 1, ty: 4, nm: "Yerba", sr: 1,
  ks: {
    o: { k: 100 }, r: { k: 1, k: [{t: 0, s: [-2]}, {t: 30, s: [2]}, {t: 60, s: [-2]}] },
    p: { k: [50, 50, 0] }, a: { k: [0, 0, 0] },
    s: { k: [100, 100, 100] }
  },
  shapes: [{
    ty: "gr",
    it: [
      // Package Body
      { ...createRect(40, 60, 2, 0, 0), ...{nm: "PackPath"} },
      createFill(0.3, 0.6, 0.2), // Green
      // Logo Area
      { ...createEllipse(25, 25, 0, -5), ...{nm: "LogoPath"} },
      createFill(0.9, 0.8, 0.2), // Yellow/Gold
      // Leaf hint (Green circle inside)
      { ...createEllipse(10, 10, 0, -5), ...{nm: "LeafPath"} },
      createFill(0.3, 0.6, 0.2),
      // Transform
      { ty: "tr", p: { k: [0, 0] }, a: { k: [0, 0] }, s: { k: [100, 100] }, r: { k: 0 }, o: { k: 100 } }
    ]
  }]
});

export const sugarAnimation = createBaseLottie([createSugarLayer()]);
export const flourAnimation = createBaseLottie([createFlourLayer()]);
export const breadAnimation = createBaseLottie([createBreadLayer()]);
export const chipaAnimation = createBaseLottie([createChipaLayer()]);
export const yerbaAnimation = createBaseLottie([createYerbaLayer()]);

export const animations = {
  sugar: sugarAnimation,
  flour: flourAnimation,
  bread: breadAnimation,
  chipa: chipaAnimation,
  yerba: yerbaAnimation,
};
