# 🖼️ Collection Images Setup Guide

## ✅ **Collection Images Feature Added!**

I've successfully added collection image upload functionality to your Pure Linen admin panel.

### 🚀 **What's Been Added:**

1. **Admin Widget** - Collection details widget with image upload
2. **API Endpoint** - Handles image uploads and metadata storage
3. **Form Components** - ImageField, Form, TextareaField components
4. **Frontend Support** - Already configured to display collection images

### 🎯 **How to Use:**

1. **Restart your backend** to load the new admin widgets:
   ```bash
   ./start-backend.sh
   ```

2. **Go to Collections** in your admin panel:
   - Navigate to http://localhost:9000/app
   - Go to Products → Collections
   - Click on any collection

3. **Add Collection Images:**
   - You'll see a "Collection Details" section
   - Click "Edit Details" button
   - Upload an image (drag & drop or click to browse)
   - Add a description
   - Click "Save"

### 🖼️ **Image Requirements:**

- **Format:** JPG, JPEG, PNG
- **Size:** Up to 10MB
- **Recommended:** 1200 x 1600 (3:4 aspect ratio)
- **Usage:** Collection cards on homepage and collection pages

### 📱 **Where Images Appear:**

- **Homepage** - Collection cards in the Collections section
- **Collection Pages** - Hero images and descriptions
- **Store Pages** - Collection listings

### 🔧 **Technical Details:**

- Images are stored in Medusa's file system
- Metadata is stored in the collection's `metadata` field
- Frontend automatically displays images when available
- Fallback to default images when no collection image is set

### 🎉 **You're Ready!**

Your Pure Linen store now has full collection image support! Upload beautiful images for each collection to showcase your linen products.

### 📝 **Next Steps:**

1. Upload images for your main collections (Table Linen, Bed Linen, etc.)
2. Add descriptions to enhance the shopping experience
3. Consider adding category images using the same approach
