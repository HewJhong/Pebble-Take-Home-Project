# CommissionFlow

A modern sales commission management system built with the MERN stack (MongoDB, Express, React, Node.js). Track campaigns, manage orders, and calculate commissions for your sales team.

![CommissionFlow](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

### For Administrators
- **Dashboard Overview**: Real-time insights with AI-powered analytics
- **User Management**: Create and manage admin and sales personnel accounts
- **Campaign Management**: Track social media campaigns across Facebook and Instagram
- **Order Tracking**: Monitor all orders with advanced filtering and search
- **Analytics**: Comprehensive reports on sales performance and commissions
- **Activity Logs**: Audit trail of all system activities

### For Sales Personnel
- **Personal Dashboard**: View your campaigns, orders, and commission earnings
- **Campaign Management**: Create and track your own campaigns
- **Order Entry**: Add orders manually with real-time commission calculation
- **Commission History**: Track monthly earnings with detailed breakdowns
- **Performance Analytics**: Visual charts showing your sales trends

### Key Capabilities
- ✅ Role-based access control (Admin & Sales Person)
- ✅ Commission rate management with historical tracking
- ✅ Real-time commission calculations
- ✅ Search and filter orders by product name
- ✅ Campaign status tracking (Active, Scheduled, Ended)
- ✅ Soft delete for data integrity
- ✅ Responsive design for mobile and desktop
- ✅ Secure authentication with JWT

## 📋 Prerequisites

- **Node.js** 20.19+ or 22.12+
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn** package manager

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Take Home Project"
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd src/server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in `src/server/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/commissionflow
JWT_SECRET=your_secure_random_secret_key_here
NODE_ENV=development

# Optional: For AI-powered insights
GEMINI_API_KEY=your_gemini_api_key
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Seed Test Data (Optional)

```bash
cd src/server
node seed.js
```

This creates default users:
- **Admin**: `admin` / `admin123`
- **Sales Person**: `sales1` / `sales123`

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd src/server
npm run dev
```
Backend runs at: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd src/client
npm run dev
```
Frontend runs at: http://localhost:5173

### Production Mode

```bash
# From project root
npm run install:all
npm run build
npm start
```

Application runs at: http://localhost:5000

## 📦 Project Structure

```
.
├── src/
│   ├── client/              # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── context/     # React Context (Auth)
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── pages/       # Page components
│   │   │   ├── services/    # API service layer
│   │   │   └── App.jsx      # Main app component
│   │   └── package.json
│   │
│   └── server/              # Express backend
│       ├── config/          # Database configuration
│       ├── middleware/      # Auth & error handling
│       ├── models/          # Mongoose models
│       ├── routes/          # API routes
│       ├── index.js         # Server entry point
│       └── package.json
│
├── docs/                    # Documentation
│   ├── USER_MANUAL.md      # User guide
│   └── quickstart.md       # Quick start guide
│
├── RAILWAY_DEPLOYMENT.md   # Railway deployment guide
├── package.json            # Root package.json
├── railway.json            # Railway config
└── nixpacks.toml          # Build configuration
```

## 🔑 User Roles & Permissions

### Administrator
- Full access to all features
- Manage users (create, edit, delete)
- Manage all campaigns and orders
- View system-wide analytics
- Access activity logs
- Cannot delete their own account

### Sales Person
- Create and manage own campaigns
- Add orders to campaigns
- View personal commission earnings
- Track personal sales analytics
- Cannot access admin features

## 🎨 Tech Stack

### Frontend
- **React 19.2** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Headless UI** - Accessible components
- **Recharts** - Data visualization
- **Heroicons** - Icon library

### Backend
- **Node.js** - Runtime
- **Express 4.18** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Campaigns
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign (Admin only)
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign (Admin only)
- `DELETE /api/campaigns/:id` - Delete campaign (Admin only)

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order (Admin only)
- `DELETE /api/orders/:id` - Delete order (Admin only)

### Analytics
- `GET /api/analytics/campaigns` - Campaign analytics
- `GET /api/analytics/sales-persons` - Sales person analytics
- `GET /api/analytics/my-campaigns` - Personal campaign analytics

## 🚢 Deployment

### Railway Deployment

See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) for detailed deployment instructions.

**Quick Steps:**
1. Connect GitHub repository to Railway
2. Add MongoDB database (Railway plugin or Atlas)
3. Set environment variables in Railway dashboard:
   - `MONGO_URI` or `MONGO_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
4. Deploy automatically on push

### Other Platforms

The application is compatible with:
- **Heroku** - Use Procfile with `npm start`
- **Vercel** - Deploy as Node.js application
- **DigitalOcean** - Use App Platform
- **AWS** - EC2 or Elastic Beanstalk

## 🧪 Testing

### Manual Testing
Login with test credentials:
- Admin: `admin` / `admin123`
- Sales: `sales1` / `sales123`

Test scenarios:
1. Create campaigns and orders
2. Track commission calculations
3. Test role-based permissions
4. Verify search and filtering
5. Check analytics dashboards

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **HTTP-Only Cookies**: Prevents XSS attacks
- **CORS Protection**: Configured allowed origins
- **Input Validation**: Server-side validation
- **Role-Based Access**: Middleware authorization
- **Soft Deletes**: Data preservation
- **Activity Logging**: Audit trail

## 📚 Documentation

- [User Manual](docs/USER_MANUAL.md) - Complete user guide
- [Quickstart Guide](docs/quickstart.md) - Get started quickly
- [Railway Deployment](RAILWAY_DEPLOYMENT.md) - Deployment guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **PebbleTech** - Initial work

## 🙏 Acknowledgments

- Built with modern best practices
- Designed for scalability and maintainability
- Optimized for performance

## 📞 Support

For issues and questions:
- Check the [User Manual](docs/USER_MANUAL.md)
- Review [Quickstart Guide](docs/quickstart.md)
- Create an issue in the repository

---

**Made with ❤️ using the MERN Stack**
