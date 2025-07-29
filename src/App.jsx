import { useState, useEffect } from "react";
import axios from "axios";

// NEW: Simple SVG Icon Components for a cleaner look
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const LoaderIcon = () => <svg className="loader" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>;
const BrowseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;

function App() {
  // ... (All your existing state variables and functions remain the same)
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

  // NEW: State for the "Browse by Satsang" feature
  const [satsangList, setSatsangList] = useState([]);
  const [selectedSatsang, setSelectedSatsang] = useState("");
  const [satsangChunks, setSatsangChunks] = useState([]);
  const [isLoadingChunks, setIsLoadingChunks] = useState(false);

  // NEW: Fetch the list of all satsangs when the component mounts
  useEffect(() => {
    const fetchSatsangList = async () => {
      try {
        // This endpoint should return a simple array of strings: ["Satsang A", "Satsang B"]
        const res = await axios.get("http://127.0.0.1:8000/satsangs");
        setSatsangList(res.data.satsangs || []);
      } catch (error) {
        console.error("Failed to fetch satsang list:", error);
        // Optionally set a status message here
      }
    };

    fetchSatsangList();
  }, []); // The empty dependency array ensures this runs only once on mount

  // NEW: Fetch the chunks for the selected satsang whenever it changes
  useEffect(() => {
    const fetchSatsangChunks = async () => {
      if (!selectedSatsang) {
        setSatsangChunks([]); // Clear chunks if no satsang is selected
        return;
      }

      setIsLoadingChunks(true);
      setSatsangChunks([]); // Clear previous chunks immediately

      try {
        // This endpoint should return a list of chunk objects for the given satsang name
        const res = await axios.get(`http://127.0.0.1:8000/satsangs/${selectedSatsang}/chunks`);
        setSatsangChunks(res.data.chunks || []);
      } catch (error) {
        console.error(`Failed to fetch chunks for ${selectedSatsang}:`, error);
        setStatus(`❌ Failed to load chunks for ${selectedSatsang}.`);
      } finally {
        setIsLoadingChunks(false);
      }
    };

    fetchSatsangChunks();
  }, [selectedSatsang]); // This effect re-runs whenever 'selectedSatsang' changes


  const handleUpload = async () => {
    // ... (Your handleUpload function remains unchanged) ...
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
    // ... (Your handleSearch function remains unchanged) ...
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
        <h1>Transcript AI Dashboard</h1>
        <p>Upload, browse, and search through your SRT transcripts with semantic AI</p>
      </div>

      <div className="dashboard-content">
        {/* Upload Section */}
        <div className="card upload-card">
          <div className="card-header">
            <h2><UploadIcon /> Upload Transcript</h2>
            <p>Select an SRT file and provide metadata to index it for searching.</p>
          </div>
          
          <form onSubmit={e => { e.preventDefault(); handleUpload(); }} className="upload-form">
            <div className="form-row">
              <div className="form-group file-upload">
                <label htmlFor="file-input">SRT File</label>
                <input id="file-input" type="file" accept=".srt" onChange={e => setFile(e.target.files[0])} required />
                {file && <span className="file-name">{file.name}</span>}
              </div>
            </div>
            {/* ... other form groups ... */}
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
                <label>Satsang Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Nature of Consciousness (optional)" 
                  value={satsangName} 
                  onChange={e => setSatsangName(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Satsang Code</label>
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
                <label>Tags</label>
                <input 
                  type="text" 
                  placeholder="e.g., consciousness,meditation,spirituality (comma separated)" 
                  value={miscTags} 
                  onChange={e => setMiscTags(e.target.value)} 
                />
              </div>
            </div>


            <button type="submit" disabled={!file || isUploading} className="action-btn">
              {isUploading ? <><LoaderIcon /> Uploading...</> : <><UploadIcon /> Upload Transcript</>}
            </button>
          </form>

          {status && (
            <div className={`status-message ${
              status.includes('✅') ? 'success' : 
              status.includes('⚠️') ? 'warning' : 'error'
            }`}>
              {status}
            </div>
          )}
        </div>

        {/* Browse by Satsang Section */}
        <div className="card browse-card">
            <div className="card-header">
                <h2><BrowseIcon /> Browse by Satsang</h2>
                <p>Select a satsang to view all its processed chunks.</p>
            </div>
            <div className="browse-form">
                <select value={selectedSatsang} onChange={e => setSelectedSatsang(e.target.value)} className="browse-select">
                    <option value="" disabled>-- Select a Satsang --</option>
                    {satsangList.map((name) => (<option key={name} value={name}>{name}</option>))}
                </select>
            </div>
        </div>
        
        {/* Display for Satsang Chunks */}
        {isLoadingChunks && (
          <div className="card"><div className="loading-chunks"><h3><LoaderIcon/> Loading Chunks...</h3></div></div>
        )}
        {!isLoadingChunks && satsangChunks.length > 0 && (
          <div className="card results-card">
            <div className="card-header">
                <h3><div className="header-main">Chunks for "{selectedSatsang}"</div> <span className="results-count">{satsangChunks.length} chunks</span></h3>
            </div>
            <ul className="results-list">
              {satsangChunks.map((chunk, index) => (
                <li key={chunk.id || index} className="result-item">
                  <div className="result-header">
                    <div className="time-badge">⏱️ {chunk.payload.start_time} - {chunk.payload.end_time}</div>
                  </div>
                  <div className="result-content"><p className="result-text">"{chunk.payload.text}"</p></div>
                  {chunk.payload.tags && chunk.payload.tags.length > 0 && (
                    <div className="result-tags">
                      {chunk.payload.tags.map((tag, tagIndex) => (<span key={tagIndex} className="tag">{tag}</span>))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Search Section */}
        <div className="card search-card">
          <div className="card-header">
            <h2><SearchIcon/> Semantic Search</h2>
            <p>Search through all uploaded transcripts using natural language.</p>
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
              <button onClick={handleSearch} disabled={!searchQuery.trim() || isSearching} className="action-btn search-btn">
                {isSearching ? <LoaderIcon /> : <SearchIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="card results-card">
            <div className="card-header">
              <h3><div className="header-main">Search Results</div> <span className="results-count">{searchResults.length} found</span></h3>
            </div>
            <ul className="results-list">
              {searchResults.map((result, index) => (
                <li key={result.id || index} className="result-item">
                  <div className="result-header">
                    <div className="score-badge">Relevance: {(result.score * 100).toFixed(1)}%</div>
                    <div className="time-badge">⏱️ {result.payload.start} - {result.payload.end}</div>
                  </div>
                  <div className="result-content"><p className="result-text">"{result.payload.text}"</p></div>
                  {result.payload.tags && result.payload.tags.length > 0 && (
                    <div className="result-tags">
                      {result.payload.tags.map((tag, tagIndex) => (<span key={tagIndex} className="tag">{tag}</span>))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {searchQuery && searchResults.length === 0 && !isSearching && (
          <div className="card"><div className="no-results"><h3>🤔 No results found</h3><p>Try adjusting your search query or upload more transcripts.</p></div></div>
        )}
      </div>
    </div>
  );
}

export default App;