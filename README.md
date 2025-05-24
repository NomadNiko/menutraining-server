# Menu Training Platform - Backend API

A robust NestJS backend API for the Menu Training platform - a comprehensive restaurant staff training system that helps employees learn menu items, ingredients, recipes, and allergen information through interactive quizzes.

## 🚀 Features

### Core Functionality
- **Multi-tenant Architecture**: Support for multiple restaurants with isolated data
- **Comprehensive Menu Management**: Full CRUD operations for ingredients, menu items, recipes, and menus
- **Dynamic Quiz System**: Generates training questions based on restaurant data
- **Allergen Tracking**: Detailed allergen information for ingredients and menu items
- **Equipment Management**: Track kitchen equipment requirements for recipes

### Authentication & Security
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Social Authentication**: Login with Google, Facebook, and Apple
- **Role-based Access Control**: Admin and user roles with granular permissions
- **Email Verification**: Secure email confirmation for new accounts

### Technical Features
- **MongoDB Database**: Flexible document storage with Mongoose ODM
- **File Upload Support**: AWS S3 integration for images and documents
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Email Service**: Transactional emails for authentication flows
- **Data Validation**: Comprehensive request validation with class-validator
- **Error Handling**: Consistent error responses with detailed messages

## 📋 Prerequisites

- Node.js 18.x or higher
- Yarn package manager
- MongoDB 5.0+ (local or MongoDB Atlas)
- AWS S3 bucket (for file uploads)
- SMTP server (for emails)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd menutraining-server
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Configure environment**
   ```bash
   cp env-example-document .env
   ```

4. **Update .env file with your configuration**
   ```env
   # Application
   NODE_ENV=development
   APP_PORT=3001
   API_PREFIX=api
   APP_FALLBACK_LANGUAGE=en
   APP_HEADER_LANGUAGE=x-custom-lang
   FRONTEND_DOMAIN=http://localhost:3000
   BACKEND_DOMAIN=http://localhost:3001

   # Database
   DATABASE_TYPE=mongodb
   DATABASE_URL=mongodb://localhost:27017/menutraining

   # Authentication
   AUTH_JWT_SECRET=your-secret-key
   AUTH_JWT_TOKEN_EXPIRES_IN=15m
   AUTH_REFRESH_SECRET=your-refresh-secret
   AUTH_REFRESH_TOKEN_EXPIRES_IN=3650d
   AUTH_FORGOT_SECRET=your-forgot-secret
   AUTH_FORGOT_TOKEN_EXPIRES_IN=30m
   AUTH_CONFIRM_EMAIL_SECRET=your-confirm-secret
   AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN=1d

   # File Upload (AWS S3)
   FILE_DRIVER=s3
   ACCESS_KEY_ID=your-aws-access-key
   SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_S3_REGION=us-east-1
   AWS_DEFAULT_S3_BUCKET=your-bucket-name

   # Email
   MAIL_HOST=smtp.example.com
   MAIL_PORT=587
   MAIL_USER=your-email@example.com
   MAIL_PASSWORD=your-email-password
   MAIL_IGNORE_TLS=false
   MAIL_SECURE=false
   MAIL_REQUIRE_TLS=true
   MAIL_DEFAULT_EMAIL=noreply@example.com
   MAIL_DEFAULT_NAME=Menu Training

   # Social Auth (Optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   FACEBOOK_APP_ID=your-facebook-app-id
   FACEBOOK_APP_SECRET=your-facebook-app-secret
   APPLE_CLIENT_ID=your-apple-client-id
   ```

5. **Run database seeds (optional)**
   ```bash
   yarn seed:run:document
   ```

## 🚀 Running the Application

### Development Mode
```bash
yarn start:dev
```

### Production Mode
```bash
yarn build
yarn start:prod
```

### Debug Mode
```bash
yarn start:debug
```

## 📚 API Documentation

Once the server is running, you can access the Swagger documentation at:
```
http://localhost:3001/docs
```

### Main API Endpoints

#### Authentication
- `POST /api/v1/auth/email/register` - Register new user
- `POST /api/v1/auth/email/login` - Login with email/password
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/forgot/password` - Request password reset
- `POST /api/v1/auth/reset/password` - Reset password
- `POST /api/v1/auth/confirm/email` - Confirm email address

#### Users
- `GET /api/v1/users` - Get all users (admin only)
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

#### Restaurants
- `GET /api/v1/restaurants` - Get user's restaurants
- `GET /api/v1/restaurants/:id` - Get restaurant details
- `POST /api/v1/restaurants` - Create restaurant (admin only)
- `PATCH /api/v1/restaurants/:id` - Update restaurant
- `DELETE /api/v1/restaurants/:id` - Delete restaurant

#### Ingredients
- `GET /api/v1/ingredients` - Get all ingredients
- `GET /api/v1/ingredients/:id` - Get ingredient details
- `POST /api/v1/ingredients` - Create ingredient
- `PATCH /api/v1/ingredients/:id` - Update ingredient
- `DELETE /api/v1/ingredients/:id` - Delete ingredient

#### Menu Items
- `GET /api/v1/menu-items` - Get all menu items
- `GET /api/v1/menu-items/:id` - Get menu item details
- `POST /api/v1/menu-items` - Create menu item
- `PATCH /api/v1/menu-items/:id` - Update menu item
- `DELETE /api/v1/menu-items/:id` - Delete menu item

#### Recipes
- `GET /api/v1/recipes` - Get all recipes
- `GET /api/v1/recipes/:id` - Get recipe details
- `POST /api/v1/recipes` - Create recipe
- `PATCH /api/v1/recipes/:id` - Update recipe
- `DELETE /api/v1/recipes/:id` - Delete recipe

#### Allergies
- `GET /api/v1/allergies` - Get all allergies
- `POST /api/v1/allergies` - Create allergy
- `PATCH /api/v1/allergies/:id` - Update allergy
- `DELETE /api/v1/allergies/:id` - Delete allergy

#### Equipment
- `GET /api/v1/equipment` - Get all equipment
- `POST /api/v1/equipment` - Create equipment
- `PATCH /api/v1/equipment/:id` - Update equipment
- `DELETE /api/v1/equipment/:id` - Delete equipment

## 🧪 Testing

### Run all tests
```bash
yarn test
```

### Run unit tests
```bash
yarn test:unit
```

### Run e2e tests
```bash
yarn test:e2e
```

### Run tests with coverage
```bash
yarn test:cov
```

## 📂 Project Structure

```
src/
├── allergies/          # Allergy management module
├── auth/               # Authentication module
├── auth-apple/         # Apple authentication
├── auth-facebook/      # Facebook authentication
├── auth-google/        # Google authentication
├── config/             # Application configuration
├── database/           # Database configuration and migrations
├── equipment/          # Equipment management module
├── files/              # File upload module
├── home/               # Health check endpoint
├── i18n/               # Internationalization
├── ingredients/        # Ingredients module
├── mail/               # Email service
├── menu-items/         # Menu items module
├── menu-sections/      # Menu sections module
├── menus/              # Menus module
├── recipes/            # Recipes module
├── restaurants/        # Restaurants module
├── roles/              # Role-based access control
├── session/            # Session management
├── statuses/           # User status management
├── users/              # User management module
└── utils/              # Utility functions and decorators
```

## 🔧 Configuration

### Database Configuration
The application uses MongoDB with Mongoose ODM. Configure the database connection in your `.env` file:

```env
DATABASE_TYPE=mongodb
DATABASE_URL=mongodb://localhost:27017/menutraining
```

For MongoDB Atlas:
```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/menutraining?retryWrites=true&w=majority
```

### File Storage Configuration
Configure AWS S3 for file uploads:
```env
FILE_DRIVER=s3
ACCESS_KEY_ID=your-aws-access-key
SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_REGION=us-east-1
AWS_DEFAULT_S3_BUCKET=your-bucket-name
```

### Email Configuration
Configure SMTP for sending emails:
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

## 🐳 Docker Support

### Run with Docker Compose
```bash
# Development
docker-compose -f docker-compose.document.yaml up

# Production
docker-compose -f docker-compose.yaml up
```

### Build Docker Image
```bash
docker build -t menutraining-server .
```

## 📦 Database Management

### Seed database
```bash
yarn seed:run:document
```

### Database Schema

#### User
- `firstName`: string
- `lastName`: string
- `email`: string (unique)
- `password`: string (hashed)
- `role`: ObjectId (reference to Role)
- `status`: ObjectId (reference to Status)
- `restaurants`: ObjectId[] (references to Restaurant)

#### Restaurant
- `name`: string
- `address`: string
- `phone`: string
- `email`: string
- `users`: ObjectId[] (references to User)

#### Ingredient
- `name`: string
- `description`: string
- `category`: string
- `allergies`: ObjectId[] (references to Allergy)
- `subIngredients`: ObjectId[] (self-reference)
- `restaurant`: ObjectId (reference to Restaurant)

#### MenuItem
- `name`: string
- `description`: string
- `price`: number
- `ingredients`: ObjectId[] (references to Ingredient)
- `restaurant`: ObjectId (reference to Restaurant)

#### Recipe
- `name`: string
- `description`: string
- `steps`: RecipeStep[]
- `equipment`: ObjectId[] (references to Equipment)
- `restaurant`: ObjectId (reference to Restaurant)

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set in production:
- Use strong, unique secrets for JWT tokens
- Configure production database credentials
- Set up production AWS S3 bucket
- Configure production email service

### Production Build
```bash
yarn build
yarn start:prod
```

### Health Check
The application provides a health check endpoint at:
```
GET /api/v1
```

### Recommended Deployment Platforms
- **AWS EC2/ECS**: For full control over infrastructure
- **Heroku**: Quick deployment with minimal configuration
- **Google Cloud Run**: Serverless container deployment
- **Azure App Service**: Microsoft cloud deployment

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files to version control
2. **Secrets Management**: Use a secrets manager in production (AWS Secrets Manager, HashiCorp Vault)
3. **Database Security**: Use connection strings with SSL in production
4. **API Rate Limiting**: Configure rate limiting for public endpoints
5. **CORS**: Configure allowed origins appropriately
6. **File Upload**: Validate file types and sizes, scan for malware

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the [API Documentation](http://localhost:3001/docs)
- Review existing issues on GitHub
- Create a new issue for bug reports or feature requests

## 🛠️ Troubleshooting

### Common Issues

#### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify network connectivity to MongoDB Atlas if using cloud

#### Email Not Sending
- Verify SMTP credentials
- Check firewall settings for SMTP port
- Enable "Less secure app access" for Gmail

#### File Upload Failed
- Verify AWS credentials
- Check S3 bucket permissions
- Ensure bucket exists in specified region

#### JWT Token Errors
- Ensure all JWT secrets are set in `.env`
- Check token expiration times
- Clear browser cookies/storage

## 📈 Performance Optimization

1. **Database Indexing**: Add indexes for frequently queried fields
2. **Caching**: Implement Redis for session storage and caching
3. **Query Optimization**: Use MongoDB aggregation pipeline for complex queries
4. **File Compression**: Enable gzip compression for API responses
5. **Connection Pooling**: Configure appropriate database connection pool size

## 🔄 API Versioning

The API uses URL versioning:
- Current version: `/api/v1`
- Future versions: `/api/v2`, `/api/v3`, etc.

Deprecated endpoints will be marked in the documentation and removed after a deprecation period.