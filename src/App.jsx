import { useState } from "react";
import axios from "axios";


function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Metadata fields
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [satsangName, setSatsangName] = useState("");
  const [satsangCode, setSatsangCode] = useState("");
  const [date, setDate] = useState("");
  const [miscTags, setMiscTags] = useState("");

    const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setStatus("Preparing upload...");
    console.log("Preparing upload...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    formData.append("location", location);
    formData.append("speaker", speaker);
    formData.append("satsang_name", satsangName);
    formData.append("satsang_code", satsangCode);
    formData.append("date", date);
    formData.append("misc_tags", miscTags);

    try {
      setStatus("Uploading file...");
      console.log("Uploading file to backend...");

      const res = await axios.post(
        "http://127.0.0.1:8000/upload-transcript",
        formData,
        {
          onUploadProgress: progressEvent => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setStatus(`Uploading... ${percent}%`);
              console.log(`Uploading... ${percent}%`);
            } else {
              setStatus("Uploading...");
              console.log("Uploading...");
            }
          }
        }
      );

      setStatus("Processing response...");
      console.log("Processing response from backend...");

      // Handle successful response with validation
      const result = res.data;
      console.log("Upload result:", result);

      if (!result.validation) {
        setStatus(`✅ Perfect upload! ${result.chunks_uploaded} chunks uploaded successfully.`);
        console.log("Perfect upload! No validation issues.");
      } else if (result.validation.coverage_complete) {
        setStatus(`✅ Upload successful! ${result.chunks_uploaded} chunks uploaded with ${result.validation.text_coverage_percentage.toFixed(1)}% coverage.`);
        console.log("Upload successful with full coverage.");
      } else {
        const issues = [];
        if (result.validation.text_coverage_percentage < 100) {
          issues.push(`${result.validation.text_coverage_percentage.toFixed(1)}% text coverage`);
        }
        if (result.validation.missing_subtitles_count > 0) {
          issues.push(`${result.validation.missing_subtitles_count} missing subtitle(s)`);
        }
        if (result.validation.timeline_gaps_count > 0) {
          issues.push(`${result.validation.timeline_gaps_count} timeline gap(s)`);
        }

        setStatus(`⚠️ Upload completed with issues: ${issues.join(', ')}. ${result.chunks_uploaded} chunks uploaded.`);
        console.warn("Upload completed with issues:", issues);

        if (result.validation.errors.length > 0) {
          console.error('Validation errors:', result.validation.errors);
        }
        if (result.validation.warnings.length > 0) {
          console.warn('Validation warnings:', result.validation.warnings);
        }
      }

    } catch (error) {
      console.error("Upload error:", error);

      if (error.response && error.response.data && error.response.data.detail) {
        if (error.response.data.detail.includes('Only .srt files are supported')) {
          setStatus("❌ Upload failed: Only .srt files are supported.");
          console.error("Upload failed: Only .srt files are supported.");
        } else if (error.response.data.detail.includes('Transcript validation failed')) {
          setStatus("❌ Upload failed: Transcript validation errors detected. Please check your file format.");
          console.error("Upload failed: Transcript validation errors detected.");
        } else {
          setStatus(`❌ Upload failed: ${error.response.data.detail}`);
          console.error(`Upload failed: ${error.response.data.detail}`);
        }
      } else {
        setStatus("❌ Upload failed. Please check your inputs and try again.");
        console.error("Upload failed. Please check your inputs and try again.");
      }
    } finally {
      setIsUploading(false);
      console.log("Upload process finished.");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    setStatus(""); // Clear any upload status when searching
    
    try {
      const res = await axios.post("http://127.0.0.1:8000/search", {
        query: searchQuery
      });
      setSearchResults(res.data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      
      if (error.response && error.response.data && error.response.data.detail) {
        setStatus(`❌ Search failed: ${error.response.data.detail}`);
      } else {
        setStatus("❌ Search failed. Please try again.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📚 Transcript Management Dashboard</h1>
        <p>Upload and search through your SRT transcripts with semantic AI</p>
      </div>

      <div className="dashboard-content">
        {/* Upload Section */}
        <div className="card upload-card">
          <div className="card-header">
            <h2>📤 Upload Transcript</h2>
            <p>Upload your SRT file with optional metadata for semantic indexing</p>
          </div>
          
          <form
            onSubmit={e => {
              e.preventDefault();
              handleUpload();
            }}
            className="upload-form"
          >
            <div className="form-row">
              <div className="form-group file-upload">
                <label htmlFor="file-input">📄 Select SRT File</label>
                <input 
                  id="file-input"
                  type="file" 
                  accept=".srt" 
                  onChange={e => setFile(e.target.files[0])} 
                  required 
                />
                {file && <span className="file-name">{file.name}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>🏷️ Category</label>
                <input 
                  type="text" 
                  placeholder="e.g., Pravachan, Sadguru Udghosh, Ashirvachan" 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>📍 Location</label>
                <input 
                  type="text" 
                  placeholder="e.g.,Shrimad Rajchandra Ashram, Dharampur" 
                  value={location} 
                  onChange={e => setLocation(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>🎤 Speaker</label>
                <input 
                  type="text" 
                  placeholder="e.g., Pujya Gurudevshri Rakeshji, Atmarpit Nemiji" 
                  value={speaker} 
                  onChange={e => setSpeaker(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>📅 Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)}
                  placeholder="Leave empty for today's date"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>� Satsang Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Nature of Consciousness (optional)" 
                  value={satsangName} 
                  onChange={e => setSatsangName(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>🔢 Satsang Code</label>
                <input 
                  type="text" 
                  placeholder="e.g., SAT2025001 (optional)" 
                  value={satsangCode} 
                  onChange={e => setSatsangCode(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>🏷️ Tags</label>
                <input 
                  type="text" 
                  placeholder="e.g., consciousness,meditation,spirituality (comma separated)" 
                  value={miscTags} 
                  onChange={e => setMiscTags(e.target.value)} 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!file || isUploading}
              className={`upload-btn ${isUploading ? 'loading' : ''}`}
            >
              {isUploading ? '⏳ Uploading...' : '📤 Upload Transcript'}
            </button>
          </form>

          {status && (
            <div className={`status-message ${
              status.includes('✅') ? 'success' : 
              status.includes('⚠️') ? 'warning' : 
              'error'
            }`}>
              {status}
            </div>
          )}
        </div>

        {/* Search Section */}
        <div className="card search-card">
          <div className="card-header">
            <h2>🔍 Semantic Search</h2>
            <p>Search through your uploaded transcripts using natural language</p>
          </div>
          
          <div className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Ask anything... e.g., 'What did Gurudev say about meditation?'"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSearch()}
                className="search-input"
              />
              <button 
                onClick={handleSearch} 
                disabled={!searchQuery.trim() || isSearching}
                className={`search-btn ${isSearching ? 'loading' : ''}`}
              >
                {isSearching ? '⏳' : '🔍'}
              </button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="card results-card">
            <div className="card-header">
              <h3>🎯 Search Results</h3>
              <span className="results-count">{searchResults.length} results found</span>
            </div>
            
            <div className="results-list">
              {searchResults.map((result, index) => (
                <div key={index} className="result-item">
                  <div className="result-header">
                    <div className="score-badge">
                      Score: {(result.score * 100).toFixed(1)}%
                    </div>
                    <div className="time-badge">
                      ⏱️ {result.payload.start} - {result.payload.end}
                    </div>
                  </div>
                  
                  <div className="result-content">
                    <p className="result-text">"{result.payload.text}"</p>
                  </div>
                  
                  {result.payload.tags && result.payload.tags.length > 0 && (
                    <div className="result-tags">
                      {result.payload.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {searchQuery && searchResults.length === 0 && !isSearching && (
          <div className="card no-results-card">
            <div className="no-results">
              <h3>🤔 No results found</h3>
              <p>Try adjusting your search query or upload more transcripts</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
