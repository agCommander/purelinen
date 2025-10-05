# 🔍 MeiliSearch Setup Guide

## ✅ Installation Complete!

The MeiliSearch plugin has been successfully installed and configured for your Pure Linen store.

## 🚀 Getting Started

### Option 1: Docker (Recommended)

1. **Start Docker Desktop** (if not already running)

2. **Start MeiliSearch:**
   ```bash
   cd medusa-backend/purelinen
   ./start-meilisearch.sh
   ```

3. **Restart your backend:**
   ```bash
   ./start-backend.sh
   ```

### Option 2: Local Installation

1. **Install MeiliSearch locally:**
   ```bash
   curl -L https://install.meilisearch.com | sh
   ```

2. **Start MeiliSearch:**
   ```bash
   ./meilisearch --master-key ms
   ```

### Option 3: MeiliSearch Cloud (Production)

1. **Sign up** at https://www.meilisearch.com/cloud
2. **Get your credentials** (Host URL and API Key)
3. **Update your .env file:**
   ```bash
   MEILISEARCH_HOST=https://your-project.ms.meilisearch.com
   MEILISEARCH_API_KEY=your-api-key-here
   ```

## 🔧 Configuration

The plugin is configured with these features:

- **Full-text search** for products
- **Typo tolerance** - finds results even with spelling mistakes
- **Faceted search** - filter by categories, tags, etc.
- **Real-time indexing** - products are indexed automatically
- **Searchable fields:** title, description, handle, tags, variant SKUs
- **Filterable fields:** status, collection, type, inventory, categories

## 🌐 API Endpoints

Once running, you'll have these search endpoints:

- `GET /store/meilisearch/products` - Search products with full MedusaJS fields
- `GET /store/meilisearch/products-hits` - Get search hits only
- `GET /store/meilisearch/categories` - Search categories
- `GET /store/meilisearch/categories-hits` - Get category search hits

## 🔑 API Key Information

**For local development:**
- **Host:** http://127.0.0.1:7700
- **Master Key:** ms (for Docker)
- **Admin API Key:** Auto-generated and updated in .env
- **Dashboard:** http://localhost:7700

**For production:** Use your MeiliSearch Cloud credentials.

## 🛠️ Troubleshooting

### Search not working?
1. Check if MeiliSearch is running: `curl http://localhost:7700/health`
2. Restart your Medusa backend after starting MeiliSearch
3. Check the backend logs for any MeiliSearch errors

### Docker issues?
1. Make sure Docker Desktop is running
2. Try: `docker ps` to see running containers
3. Check: `docker logs meilisearch` for errors

## 📚 Next Steps

1. **Test the search** in your frontend
2. **Customize search settings** in `medusa-config.ts`
3. **Add search UI** to your storefront
4. **Configure faceted search** for better filtering

## 🎉 You're Ready!

Your Pure Linen store now has powerful search capabilities! The search will work across all your products, variants, and categories with typo tolerance and real-time updates.
