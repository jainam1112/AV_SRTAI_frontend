# 📚 Transcript Management Dashboard

A beautiful, modern React dashboard for uploading and searching through SRT transcripts using semantic AI.

## ✨ Features

- **📤 Smart Upload**: Upload SRT files with optional metadata
- **🔍 Semantic Search**: Natural language search through transcripts
- **🎯 Intelligent Results**: Scored search results with timestamps
- **📊 Validation**: Real-time transcript validation and coverage reports
- **🎨 Modern UI**: Beautiful, responsive design with dark/light mode support
- **⚡ Real-time**: Live status updates and loading states

## 🚀 Local Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:10000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file (optional):
```
VITE_API_URL=http://localhost:10000
```

3. Start development server:
```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🔧 API Integration

The dashboard integrates with the transcript management API:

### Upload Endpoint
```
POST http://localhost:10000/upload-transcript
Content-Type: multipart/form-data
```

**Required:**
- `file`: SRT file

**Optional (with defaults):**
- `category`: "Miscellaneous"
- `location`: "Unknown"  
- `speaker`: "Gurudev"
- `satsang_name`: ""
- `satsang_code`: ""
- `misc_tags`: "" (comma-separated)
- `date`: Today's date (YYYY-MM-DD)

### Search Endpoint
```
POST http://localhost:10000/search
Content-Type: application/json

{
  "query": "your search query"
}
```

## 📝 Usage

### Uploading Transcripts

1. **Select File**: Choose an SRT file from your computer
2. **Add Metadata** (optional): Fill in category, location, speaker, etc.
3. **Upload**: Click upload and see real-time validation results

### Searching Transcripts

1. **Natural Language**: Ask questions like "What did Gurudev say about meditation?"
2. **View Results**: See scored results with timestamps and tags
3. **Navigate**: Click through results to find relevant content

## 🎨 UI Features

### Status Messages
- **✅ Green**: Successful uploads with full coverage
- **⚠️ Orange**: Uploads completed with validation warnings
- **❌ Red**: Failed uploads or errors

### Validation Reports
- Text coverage percentage
- Timeline coverage analysis
- Missing subtitle detection
- Gap analysis and warnings

### Responsive Design
- Works on desktop, tablet, and mobile
- Automatic dark/light mode based on system preference
- Smooth animations and transitions

## 🛠️ Technology Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Axios**: HTTP client for API calls
- **CSS3**: Modern styling with CSS Grid/Flexbox
- **Inter Font**: Beautiful typography

## 📁 Project Structure

```
frontend/
├── src/
│   ├── App.jsx          # Main dashboard component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
└── README.md           # This file
```

## 🌐 Vercel Deployment

1. Push frontend code to a GitHub repo.
2. Import the repo into [Vercel](https://vercel.com/).
3. Set environment variable in Vercel Dashboard:
   - `VITE_API_URL=https://your-backend-service.onrender.com`
4. Deploy!

## 🎯 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build

### Git Commands
```bash
# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to remote repository
git push origin main
```

---

**Happy transcript managing! 📚✨**