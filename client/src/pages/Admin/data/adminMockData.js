const BUSINESS_NAMES = [
  'Kiosco Centro', 'Ferretería Norte', 'Carnicería Sur', 'Distribuidora MG',
  'Supermercado Centro', 'Herramientas SA', 'Pollería del Sur', 'Farmacia San Martín',
  'Librería Cultural', 'Indumentaria Fashion', 'Electro Hogar', 'Kiosco 24hs',
  'Ferretería El Tornillo', 'Carnicería Premium', 'Supermercado Norte', 'Farmacia Belgrano',
  'Librería Técnica', 'Boutique Luxe', 'Tienda Deportiva', 'Kiosco Express',
  'Ferretería Industrial', 'Pescadería Marina', 'Supermercado Sur', 'Farmacia Central',
  'Librería Escolar', 'Indumentaria Sport', 'Electro Mundo', 'Kiosco del Barrio',
  'Ferretería Garden', 'Carnicería El Abasto', 'Bazar & Hogar', 'Farmacia Nueva',
  'Librería Jurídica', 'Calzados Paso', 'Regalería Dulce', 'Kiosco Arenales',
  'Ferretería Oeste', 'Granja Avícola', 'Supermercado Express', 'Farmacia del Pueblo',
  'Librería Online', 'Indumentaria Kids', 'Tecno Shop', 'Kiosco Rivadavia',
  'Ferretería Mayorista', 'Dietética Natural', 'Supermercado Smart', 'Farmacia 24hs',
  'Librería Universitaria', 'Mueblería El Hogar', 'Joyería Fina', 'Kiosco Alberdi',
  'Ferretería Construcción', 'Verdulería Fresca', 'Supermercado Maxi', 'Farmacia Mutual',
  'Librería Infantil', 'Indumentaria Work', 'Casa de Repuestos', 'Kiosco San Martín',
  'Ferretería Eléctrica', 'Panadería Delicias', 'Supermercado Total', 'Farmacia San José',
  'Librería Religiosa', 'Bazar Mayorista', 'Electro Fe', 'Kiosco Mitre',
  'Ferretería Pinturería', 'Heladería Polar', 'Supermercado King', 'Farmacia Modelo',
  'Librería Arte', 'Indumentaria Casual', 'Casa de Música', 'Kiosco Sarmiento',
  'Ferretería San Juan', 'Lavandería Burbuja', 'Supermercado SA', 'Farmacia Sur',
  'Librería Comercial', 'Regalería Sweet', 'Mascotas Shop', 'Kiosco 9 de Julio',
  'Ferretería Costa', 'Almacén Doña Rosa', 'Supermercado Norteño', 'Farmacia Litoral',
  'Librería Papelería', 'Indumentaria Urbana', 'Bicicletería Ruedas', 'Kiosco Lavalle',
  'Ferretería Ruta', 'Almacén Don Pedro', 'Supermercado Del Valle', 'Farmacia Almagro',
  'Librería Virtual', 'Golosinas Sweet', 'Tienda Hogar', 'Kiosco Colón',
  'Ferretería Sur', 'Almacén Don Juan', 'Supermercado Central', 'Farmacia Caballito',
];

const CITIES = ['Córdoba', 'Buenos Aires', 'Rosario', 'Mendoza', 'La Plata', 'Mar del Plata', 'Salta', 'Tucumán', 'Santa Fe', 'Neuquén'];

const STREETS = [
  'Av. Colón', 'San Martín', 'Dean Funes', 'Av. Cabildo', 'Av. Corrientes',
  'Rioja', 'San Juan', 'Av. Belgrano', 'Mitre', '9 de Julio', 'Sarmiento',
  'Lavalle', 'Alberdi', 'Rivadavia', 'Belgrano', 'Av. Siempre Viva',
];

const RUBROS = ['Kiosco', 'Ferretería', 'Carnicería', 'Supermercado', 'Farmacia', 'Librería', 'Indumentaria', 'Electrodomésticos'];

const RUBRO_ICONS_MAP = {
  Kiosco: 'Store',
  Ferretería: 'Hammer',
  Carnicería: 'Beef',
  Supermercado: 'ShoppingCart',
  Farmacia: 'ShieldCheck',
  Librería: 'BookOpen',
  Indumentaria: 'Shirt',
  Electrodomésticos: 'Zap',
};

const FIRST_NAMES = ['Carlos', 'María', 'Juan', 'Ana', 'Pedro', 'Lucía', 'Diego', 'Sofía', 'Luis', 'Valentina', 'Martín', 'Camila', 'Jorge', 'Florencia', 'Pablo', 'Rocío', 'Fernando', 'Victoria', 'Gustavo', 'Elena'];
const LAST_NAMES = ['Gómez', 'López', 'Pérez', 'Martínez', 'Rodríguez', 'Fernández', 'García', 'Silva', 'Torres', 'Díaz', 'Romero', 'Alvarez', 'Ruiz', 'Moreno', 'Sosa', 'Acosta', 'Medina', 'Castillo', 'Rojas', 'Correa'];

const seed = (n) => {
  let s = n;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
};

const rand = seed(42);

const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const randomInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

const formatMoney = (n) => `$${n.toLocaleString('es-AR')}`;

const generateBusinesses = (count = 100) => {
  const businesses = [];
  for (let i = 0; i < count; i++) {
    const city = pick(CITIES);
    const rubro = pick(RUBROS);
    const plan = rand() > 0.6 ? 'essential' : 'pro';
    const planPrice = plan === 'pro' ? 10000 : 5000;
    const frequency = rand() > 0.3 ? 'monthly' : 'annual';
    const statusRand = rand();
    const status = statusRand < 0.75 ? 'active' : statusRand < 0.88 ? 'trial' : statusRand < 0.95 ? 'expired' : 'cancelled';
    const startDate = new Date(2024, randomInt(0, 16), randomInt(1, 28));
    const monthlyAmount = frequency === 'annual' ? planPrice * 12 * 0.85 : planPrice;
    const users = randomInt(1, 8);
    const employees = randomInt(1, 15);
    const products = randomInt(20, 500);
    const monthlySales = randomInt(200000, 5000000);
    const lat = -34 - rand() * 5;
    const lng = -58 - rand() * 6;
    const affRand = rand();
    const affiliate = affRand < 0.35 ? 'JUAN10' : affRand < 0.60 ? 'SOLEDAD20' : null;
    
    businesses.push({
      id: i + 1,
      name: BUSINESS_NAMES[i % BUSINESS_NAMES.length] + (i >= BUSINESS_NAMES.length ? ` #${i + 1}` : ''),
      rubro,
      city,
      address: `${pick(STREETS)} ${randomInt(100, 5000)}`,
      phone: `${pick(['351', '11', '341', '261', '221', '223', '387', '381', '342', '299'])}-${randomInt(100000, 999999)}`,
      email: `contacto${i + 1}@mail.com`,
      status,
      users,
      employees,
      products,
      monthlySales,
      lat: parseFloat(lat.toFixed(4)),
      lng: parseFloat(lng.toFixed(4)),
      plan,
      planPrice,
      frequency,
      monthlyAmount: Math.round(monthlyAmount),
      startDate: startDate.toISOString().split('T')[0],
      nextBilling: new Date(startDate.getTime() + (frequency === 'annual' ? 365 : 30) * 86400000).toISOString().split('T')[0],
      affiliate,
    });
  }
  return businesses;
};

const BUSINESSES = generateBusinesses(100);

const AFFILIATES = [
  { id: 1, code: 'JUAN10', name: 'Juan Cottier', email: 'juan@cottier.com', phone: '351-1234567', commissionFirst3: 0.40, commissionAfter: 0.10 },
  { id: 2, code: 'SOLEDAD20', name: 'Soledad Ocampo', email: 'sole@ocampo.com', phone: '11-7654321', commissionFirst3: 0.40, commissionAfter: 0.10 },
];

const getAffiliateBusinesses = (code) => BUSINESSES.filter(b => b.affiliate === code);

const computeCommissions = () => {
  const now = new Date();
  return AFFILIATES.map(aff => {
    const refBusinesses = BUSINESSES.filter(b => b.affiliate === aff.code && (b.status === 'active' || b.status === 'trial'));
    let totalPending = 0;
    let totalEarned = 0;
    const details = refBusinesses.map(b => {
      const start = new Date(b.startDate);
      const monthsActive = Math.floor((now - start) / (30 * 86400000));
      const isFirst3 = monthsActive <= 2; // 0, 1, 2 = first 3 months
      const rate = isFirst3 ? aff.commissionFirst3 : aff.commissionAfter;
      const commission = Math.round(b.monthlyAmount * rate);
      if (b.status === 'active') totalPending += commission;
      totalEarned += commission;
      return { ...b, monthsActive, isFirst3, rate, commission };
    });
    const totalBusinesses = refBusinesses.length;
    return { ...aff, totalBusinesses, totalPending, totalEarned, details, avgCommission: totalBusinesses > 0 ? Math.round(totalEarned / totalBusinesses) : 0 };
  });
};

const AFFILIATE_COMMISSIONS = computeCommissions();

const getSubscriptionStats = () => {
  const total = BUSINESSES.length;
  const active = BUSINESSES.filter(b => b.status === 'active' || b.status === 'trial').length;
  const paying = BUSINESSES.filter(b => b.status === 'active').length;
  const essential = BUSINESSES.filter(b => b.plan === 'essential' && (b.status === 'active' || b.status === 'trial')).length;
  const pro = BUSINESSES.filter(b => b.plan === 'pro' && (b.status === 'active' || b.status === 'trial')).length;
  const monthly = BUSINESSES.filter(b => b.frequency === 'monthly' && (b.status === 'active' || b.status === 'trial')).length;
  const annual = BUSINESSES.filter(b => b.frequency === 'annual' && (b.status === 'active' || b.status === 'trial')).length;
  const mrr = BUSINESSES.filter(b => b.status === 'active').reduce((s, b) => s + b.monthlyAmount, 0);
  const essentialMrr = BUSINESSES.filter(b => b.plan === 'essential' && b.status === 'active').reduce((s, b) => s + b.monthlyAmount, 0);
  const proMrr = BUSINESSES.filter(b => b.plan === 'pro' && b.status === 'active').reduce((s, b) => s + b.monthlyAmount, 0);
  const totalBilled = BUSINESSES.filter(b => b.status === 'active').reduce((s, b) => s + b.monthlyAmount * 12, 0);
  return { total, active, paying, essential, pro, monthly, annual, mrr, essentialMrr, proMrr, totalBilled };
};

const generateInvoices = () => {
  const invoices = [];
  const paying = BUSINESSES.filter(b => b.status === 'active' || b.status === 'trial');
  for (let i = 0; i < 300; i++) {
    const b = paying[i % paying.length];
    const date = new Date(2025, randomInt(5, 12), randomInt(1, 28));
    invoices.push({
      id: `INV-${String(i + 1).padStart(6, '0')}`,
      businessId: b.id,
      businessName: b.name,
      plan: b.plan,
      amount: b.monthlyAmount,
      date: date.toISOString().split('T')[0],
      status: rand() > 0.05 ? 'paid' : 'pending',
      period: `${date.toLocaleString('es-AR', { month: 'long' })} ${date.getFullYear()}`,
      affiliate: b.affiliate,
    });
  }
  invoices.sort((a, b) => new Date(b.date) - new Date(a.date));
  return invoices;
};

const INVOICES = generateInvoices();

const formatDate = (d) => {
  const date = new Date(d);
  return date.toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' });
};

export {
  BUSINESSES,
  AFFILIATES,
  AFFILIATE_COMMISSIONS,
  INVOICES,
  CITIES,
  RUBROS,
  formatMoney,
  formatDate,
  getSubscriptionStats,
  getAffiliateBusinesses,
  RUBRO_ICONS_MAP,
};
