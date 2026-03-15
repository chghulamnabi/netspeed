# Internet Speed Tester

A comprehensive web-based application that provides accurate internet connection speed measurements through a globally distributed server infrastructure. The system measures download speed, upload speed, latency, and jitter while providing real-time progress feedback and detailed analytics.

## Features

- **Accurate Speed Testing**: Measurements within 5% of actual throughput
- **Global Server Network**: Distributed infrastructure spanning 50+ countries
- **Real-time Progress**: Live updates during test execution
- **Cross-Platform Support**: Works on all modern browsers without plugins
- **User Analytics**: Test history tracking and performance trends
- **Network Diagnostics**: Troubleshooting tools and connection analysis
- **REST API**: Programmatic access for developers and businesses
- **Privacy-First**: GDPR/CCPA compliant data handling

## Architecture

The application follows a distributed microservices architecture:

- **Frontend**: React/Next.js web application
- **Test Orchestration Service**: Coordinates speed tests and server selection
- **User Management Service**: Handles authentication and user accounts
- **Analytics Service**: Processes test data for insights and comparisons
- **Geolocation Service**: Determines optimal server selection
- **Shared Packages**: Common types and utilities

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Databases**: PostgreSQL, InfluxDB, Redis
- **Infrastructure**: Docker, Nginx
- **Build Tools**: Turbo (monorepo), ESLint, Prettier

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd internet-speed-tester
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development environment**
   ```bash
   npm run setup
   ```

   This command will:
   - Install all dependencies
   - Start Docker services (PostgreSQL, InfluxDB, Redis, Nginx)
   - Initialize databases with sample data

5. **Start development servers**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost (via Nginx)
   - Database Admin: http://localhost:8086 (InfluxDB UI)

## Development

### Project Structure

```
internet-speed-tester/
├── apps/                          # Applications
│   ├── frontend/                  # Next.js web application
│   ├── test-orchestration/        # Test coordination service
│   ├── user-management/           # Authentication & user service
│   ├── analytics/                 # Analytics & reporting service
│   └── geolocation/               # Location & server selection service
├── packages/                      # Shared packages
│   ├── types/                     # TypeScript type definitions
│   └── utils/                     # Shared utility functions
├── docker/                        # Docker configuration
│   ├── docker-compose.dev.yml     # Development services
│   ├── nginx/                     # Nginx configuration
│   └── init-scripts/              # Database initialization
└── docs/                          # Documentation
```

### Available Scripts

- `npm run dev` - Start all services in development mode
- `npm run build` - Build all applications
- `npm run lint` - Run ESLint on all packages
- `npm run test` - Run tests across all packages
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean build artifacts
- `npm run docker:dev` - Start Docker services
- `npm run docker:down` - Stop Docker services

### Service Ports

- Frontend: 3000
- Test Orchestration: 3001
- User Management: 3002
- Analytics: 3003
- Geolocation: 3004
- Nginx (API Gateway): 80
- PostgreSQL: 5432
- Redis: 6379
- InfluxDB: 8086

### Adding New Services

1. Create a new directory in `apps/`
2. Add `package.json` with appropriate dependencies
3. Create `tsconfig.json` extending the root configuration
4. Add service configuration to `docker/nginx/nginx.dev.conf`
5. Update `turbo.json` if needed

### Database Management

**PostgreSQL** (Application Data):
- Connection: `postgresql://postgres:postgres@localhost:5432/speed_tester`
- Admin tool: Use any PostgreSQL client (pgAdmin, DBeaver, etc.)

**InfluxDB** (Time Series Analytics):
- Web UI: http://localhost:8086
- Username: admin
- Password: adminpassword
- Organization: speed-tester
- Bucket: analytics

**Redis** (Caching):
- Connection: `redis://localhost:6379`
- CLI: `docker exec -it speed-tester-redis redis-cli`

## API Documentation

### Authentication

All API endpoints (except public test endpoints) require authentication via JWT tokens.

```bash
# Register a new user
curl -X POST http://localhost/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","timezone":"UTC"}'

# Login
curl -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Speed Testing

```bash
# Start a speed test
curl -X POST http://localhost/api/v1/tests/start \
  -H "Content-Type: application/json" \
  -d '{"clientInfo":{"userAgent":"curl/7.68.0"}}'

# Get test results
curl http://localhost/api/v1/tests/{testId}/results
```

### Analytics

```bash
# Get country averages
curl http://localhost/api/v1/analytics/country/US

# Get global statistics
curl http://localhost/api/v1/analytics/global
```

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests for specific package
npm run test --workspace=@speed-tester/frontend

# Run tests in watch mode
npm run test -- --watch
```

### Test Structure

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test service interactions
- **E2E Tests**: Test complete user workflows

## Deployment

### Production Build

```bash
# Build all applications
npm run build

# Build specific application
npm run build --workspace=@speed-tester/frontend
```

### Docker Production

```bash
# Build production images
docker-compose -f docker/docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker/docker-compose.prod.yml up -d
```

### Environment Variables

Key production environment variables:

- `NODE_ENV=production`
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Strong JWT signing key
- `MAXMIND_LICENSE_KEY` - MaxMind GeoIP license

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write tests for new features
- Update documentation as needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:

- Create an issue on GitHub
- Check the documentation in the `docs/` directory
- Review the API documentation at `/api/docs` when running locally