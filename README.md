# Repole Sales Shortlist Application

A modern sales shortlist application with persistent file storage, built with HTML, JavaScript, and deployed on Vercel with Upstash Redis and Vercel Blob Storage.

## Features

- **Persistent File Storage**: Upload Excel/CSV files that persist across all users and sessions
- **Multiple File Format Support**: .xlsx, .xls, and .csv files up to 10MB each
- **Drag & Drop Interface**: Modern, responsive file upload with drag-and-drop functionality
- **Real-time File Management**: Upload, download, and delete files with instant updates
- **Cross-User Sharing**: All uploaded files are accessible to anyone who visits the site
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices
- **Scalable Backend**: Uses Vercel serverless functions with Redis for metadata and Blob storage for files

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript with Bootstrap 5
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: Upstash Redis for file metadata
- **File Storage**: Vercel Blob Storage for actual files
- **Deployment**: Vercel with GitHub integration

## Quick Start

### Prerequisites

1. A Vercel account ([sign up here](https://vercel.com))
2. An Upstash Redis database ([create one here](https://console.upstash.com/redis))
3. A GitHub account for deployment

### Local Development

1. **Clone and setup**:
   ```bash
   git clone <your-repo-url>
   cd repole-sales-shortlist
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   ```env
   KV_REST_API_URL=https://your-redis-endpoint.upstash.io
   KV_REST_API_TOKEN=your-redis-token-here
   BLOB_READ_WRITE_TOKEN=your-blob-token-here
   ```

3. **Run locally**:
   ```bash
   npm run dev
   ```
   
   Visit http://localhost:3000

### Production Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

3. **Configure Environment Variables**:
   In your Vercel project dashboard, go to Settings → Environment Variables and add:
   - `KV_REST_API_URL`: Your Upstash Redis URL
   - `KV_REST_API_TOKEN`: Your Upstash Redis token
   - `BLOB_READ_WRITE_TOKEN`: Auto-generated when you enable Blob Storage

4. **Enable Vercel Blob Storage**:
   - In your Vercel project, go to Storage tab
   - Create a new Blob store
   - The `BLOB_READ_WRITE_TOKEN` will be automatically set

## Setup Instructions

### 1. Upstash Redis Setup

1. Go to [Upstash Console](https://console.upstash.com/redis)
2. Create a new Redis database
3. Copy the `REST URL` and `REST TOKEN` from the database details
4. Add these to your environment variables

### 2. Vercel Blob Storage Setup

1. In your Vercel project dashboard, go to the Storage tab
2. Click "Create Database" and select "Blob"
3. Name your blob store (e.g., "sales-files")
4. The `BLOB_READ_WRITE_TOKEN` will be automatically added to your environment

### 3. Integration with Existing HTML

Add this HTML snippet to your existing `index.html` where you want the file upload section:

```html
<!-- Add to head section -->
<link rel="stylesheet" href="/public/styles.css">

<!-- Add this section where you want file uploads to appear -->
<div class="row" id="persistentFileSection">
    <div class="col-12">
        <div class="card persistent-file-section">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5><i class="fas fa-cloud-upload-alt me-2"></i>Persistent File Storage</h5>
                <div>
                    <button class="btn persistent-upload-btn" id="persistentUploadBtn">
                        <i class="fas fa-upload"></i> Upload Files
                    </button>
                    <button class="btn btn-outline-secondary ms-2" id="persistentRefreshBtn">
                        <i class="fas fa-sync"></i>
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class="persistent-drop-zone" id="persistentDropZone">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <h5>Drag & Drop Excel Files Here</h5>
                    <p>Or click to browse • Supports .xlsx, .xls, .csv • Max 10MB per file</p>
                </div>
                <input type="file" id="persistentFileInput" class="persistent-file-input" 
                       multiple accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv">
                <div class="persistent-files-list" id="persistentFilesList">
                    <!-- Files will be dynamically loaded here -->
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Add before closing body tag -->
<script src="/public/scripts.js"></script>
```

## API Endpoints

- `POST /api/upload` - Upload files to storage
- `GET /api/files` - List all uploaded files
- `GET /api/download?fileId=<id>` - Download a specific file
- `DELETE /api/delete?fileId=<id>` - Delete a specific file

## File Structure

```
/
├── index.html              # Your existing HTML file
├── api/
│   ├── upload.js          # File upload handler
│   ├── files.js           # List files handler
│   ├── delete.js          # Delete file handler
│   └── download.js        # Download file handler
├── public/
│   ├── styles.css         # File upload styles
│   └── scripts.js         # File management JavaScript
├── package.json           # Dependencies and scripts
├── vercel.json           # Vercel configuration
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## Security Considerations

- File size is limited to 10MB per file
- Only Excel and CSV file types are allowed
- Files are stored with random suffixes to prevent conflicts
- All API endpoints include proper error handling
- CORS headers are configured for cross-origin requests

## Customization

### File Size Limits
Edit the `MAX_FILE_SIZE` in your environment variables or modify the validation in `api/upload.js`.

### Allowed File Types
Modify the `allowedTypes` array in `api/upload.js` to support additional file formats.

### Styling
Customize the appearance by editing `public/styles.css`. The styles are designed to integrate seamlessly with Bootstrap 5.

## Troubleshooting

### Common Issues

1. **Files not uploading**: Check your Blob Storage token and Redis connection
2. **Environment variables not working**: Ensure they're set in both `.env` (local) and Vercel dashboard (production)
3. **CORS errors**: Verify the headers configuration in `vercel.json`

### Logs and Debugging

- View Vercel function logs in your Vercel dashboard under the Functions tab
- Check browser console for frontend JavaScript errors
- Use `vercel logs` command for real-time log monitoring

## Support

For issues and questions:
1. Check the browser console for errors
2. Review Vercel function logs
3. Verify environment variables are correctly set
4. Ensure Upstash Redis and Vercel Blob Storage are properly configured

## License

MIT License - feel free to modify and use for your projects.