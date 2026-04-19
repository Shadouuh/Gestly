const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Middleware personalizado para autenticación
server.use(jsonServer.bodyParser);

// Login endpoint
server.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = router.db;
  const user = db.get('users').find({ email, password }).value();
  
  if (user) {
    const business = db.get('businesses').find({ ownerId: user.id }).value();
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword,
      business: business || null,
      token: `token_${user.id}_${Date.now()}`
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  }
});

// Register endpoint
server.post('/auth/register', (req, res) => {
  const { email, password, name, businessName, templateId, address, phone } = req.body;
  const db = router.db;
  
  // Verificar si el email ya existe
  const existingUser = db.get('users').find({ email }).value();
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'El email ya está registrado'
    });
  }
  
  // Crear usuario
  const newUser = {
    id: Date.now(),
    email,
    password,
    name,
    role: 'owner',
    businessId: Date.now() + 1,
    createdAt: new Date().toISOString()
  };
  
  db.get('users').push(newUser).write();
  
  // Crear negocio
  const newBusiness = {
    id: newUser.businessId,
    name: businessName,
    templateId,
    ownerId: newUser.id,
    address,
    phone,
    createdAt: new Date().toISOString()
  };
  
  db.get('businesses').push(newBusiness).write();
  
  // Obtener productos de la plantilla y crear businessProducts
  const template = db.get('templates').find({ id: templateId }).value();
  if (template && template.defaultProducts) {
    template.defaultProducts.forEach((productId, index) => {
      const businessProduct = {
        id: Date.now() + index + 100,
        businessId: newBusiness.id,
        productId,
        stock: 0,
        customPrice: null,
        isActive: true
      };
      db.get('businessProducts').push(businessProduct).write();
    });
  }
  
  const { password: _, ...userWithoutPassword } = newUser;
  
  res.json({
    success: true,
    user: userWithoutPassword,
    business: newBusiness,
    token: `token_${newUser.id}_${Date.now()}`
  });
});

// Get business products with full product details
server.get('/businesses/:businessId/products', (req, res) => {
  const { businessId } = req.params;
  const db = router.db;
  
  const businessProducts = db.get('businessProducts')
    .filter({ businessId: parseInt(businessId) })
    .value();
  
  const productsWithDetails = businessProducts.map(bp => {
    const product = db.get('products').find({ id: bp.productId }).value();
    return {
      ...bp,
      product
    };
  });
  
  res.json(productsWithDetails);
});

// Update business product stock
server.patch('/businessProducts/:id', (req, res) => {
  const { id } = req.params;
  const { stock, customPrice, isActive } = req.body;
  const db = router.db;
  
  const businessProduct = db.get('businessProducts')
    .find({ id: parseInt(id) })
    .assign({ stock, customPrice, isActive })
    .write();
  
  res.json(businessProduct);
});

// Get templates with product count
server.get('/templates', (req, res) => {
  const db = router.db;
  const templates = db.get('templates').value();
  
  const templatesWithCount = templates.map(template => ({
    ...template,
    productCount: template.defaultProducts ? template.defaultProducts.length : 0
  }));
  
  res.json(templatesWithCount);
});

server.use(middlewares);
server.use(router);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 JSON Server corriendo en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: db.json`);
  console.log(`\n📍 Endpoints disponibles:`);
  console.log(`   POST   /auth/login`);
  console.log(`   POST   /auth/register`);
  console.log(`   GET    /templates`);
  console.log(`   GET    /businesses/:businessId/products`);
  console.log(`   PATCH  /businessProducts/:id`);
  console.log(`   GET    /users`);
  console.log(`   GET    /businesses`);
  console.log(`   GET    /products`);
});
