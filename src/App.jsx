import { useState, useEffect } from "react";
import axios from "axios";

// --- SVG Icon Components --- (no changes)
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const LoaderIcon = () => <svg className="loader" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>;
const BrowseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const ResultsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const BioExtractIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9Z"></path><path d="M10.89 21.11a2 2 0 0 1-1.78-1.11"></path><path d="m14 2 1.25 2.5L18 6l-2.5 1.25L14 10l-1.25-2.5L10 6l2.5-1.25Z"></path><path d="m5 5 1 2 2.5 1-2.5 1-1 2-1-2-2.5-1 2.5-1 1-2Z"></path></svg>;
// NEW: Icon for the new section
const DatabaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>;


function App() {
    // ... (all your existing state variables)
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [speaker, setSpeaker] = useState("");
    const [satsangName, setSatsangName] = useState("");
    const [satsangCode, setSatsangCode] = useState("");
    const [date, setDate] = useState("");
    const [miscTags, setMiscTags] = useState("");
    const [allTranscripts, setAllTranscripts] = useState([]);
    const [selectedBrowseSatsang, setSelectedBrowseSatsang] = useState("");
    const [satsangChunks, setSatsangChunks] = useState([]);
    const [isLoadingChunks, setIsLoadingChunks] = useState(false);
    const [selectedAnalysisSatsang, setSelectedAnalysisSatsang] = useState("");
    const [isExtractingBio, setIsExtractingBio] = useState(false);

    // NEW: State for the "get all chunks" feature
    const [allChunks, setAllChunks] = useState([]);
    const [isLoadingAllChunks, setIsLoadingAllChunks] = useState(false);

    // ... (your existing useEffect and handle functions)
    const fetchAllTranscriptStatuses = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/transcripts/status");
            setAllTranscripts(res.data.transcripts || []);
        } catch (error) {
            console.error("Failed to fetch transcript statuses:", error);
            setStatus("❌ Could not load transcript list.");
        }
    };

    useEffect(() => {
        fetchAllTranscriptStatuses();
    }, []);

    useEffect(() => {
        const fetchSatsangChunks = async () => {
            if (!selectedBrowseSatsang) {
                setSatsangChunks([]);
                return;
            }
            setIsLoadingChunks(true);
            setSatsangChunks([]);
            try {
                const res = await axios.get(`http://127.0.0.1:8000/transcripts/${selectedBrowseSatsang}/chunks`);
                setSatsangChunks(res.data.chunks || []);
                 console.log("API Response for Specific Transcript:", res.data);
                 const chunksFromApi = res.data.chunks || [];
                console.log("Data being set to satsangChunks state:", chunksFromApi);
            } catch (error) {
                console.error(`Failed to fetch chunks for ${selectedBrowseSatsang}:`, error);
            } finally {
                setIsLoadingChunks(false);
            }
        };
        fetchSatsangChunks();
    }, [selectedBrowseSatsang]);


    const handleRunBioExtraction = async () => {
        if (!selectedAnalysisSatsang) {
            setStatus("⚠️ Please select a transcript to analyze.");
            return;
        }

        setIsExtractingBio(true);
        setStatus(`⚙️ Running bio-extraction for "${selectedAnalysisSatsang}"...`);

        try {
            const res = await axios.post(`http://127.0.0.1:8000/transcripts/${selectedAnalysisSatsang}/extract-bio`);
            setStatus(`✅ Bio-extraction complete! ${res.data.chunks_updated} chunks were updated.`);
            await fetchAllTranscriptStatuses();
            setSelectedAnalysisSatsang("");

        } catch (error) {
            console.error("Bio extraction failed:", error);
            const errorMsg = error.response?.data?.detail || "An unknown error occurred.";
            setStatus(`❌ Bio-extraction failed: ${errorMsg}`);
        } finally {
            setIsExtractingBio(false);
        }
    };


    const handleUpload = async () => {
      if (!file) return;
  
      setIsUploading(true);
      setStatus("Preparing upload...");
    
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
        const res = await axios.post("http://127.0.0.1:8000/upload-transcript", formData);
        setStatus("Processing response...");
        const result = res.data;
    
        if (!result.validation) {
          setStatus(`✅ Perfect upload! ${result.chunks_uploaded} chunks uploaded successfully.`);
        } else {
          setStatus(`⚠️ Upload completed. ${result.chunks_uploaded} chunks uploaded.`);
        }
        await fetchAllTranscriptStatuses();
    
      } catch (error) {
        console.error("Upload error:", error);
        const errorMsg = error.response?.data?.detail || "An unknown error occurred.";
        setStatus(`❌ Upload failed: ${errorMsg}`);
      } finally {
        setIsUploading(false);
      }
    };
    

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setSearchResults([]);
        setStatus(""); 
        try {
          const res = await axios.post("http://127.0.0.1:8000/search", { query: searchQuery });
          setSearchResults(res.data.results || []);
        } catch (error) {
          console.error("Search error:", error);
          const errorMsg = error.response?.data?.detail || "An unknown error occurred.";
          setStatus(`❌ Search failed: ${errorMsg}`);
        } finally {
          setIsSearching(false);
        }
    };


    // NEW: Function to call the /chunks/all endpoint
    const handleFetchAllChunks = async () => {
        setIsLoadingAllChunks(true);
        setAllChunks([]);
        setStatus("Fetching all chunks from the database...");

        try {
            const res = await axios.get("http://127.0.0.1:8000/chunks/all");
            setAllChunks(res.data.chunks || []);
            setStatus(`✅ Successfully fetched ${res.data.chunks.length} chunks.`);
        } catch (error) {
            console.error("Failed to fetch all chunks:", error);
            const errorMsg = error.response?.data?.detail || "An unknown error occurred.";
            setStatus(`❌ Failed to fetch chunks: ${errorMsg}`);
        } finally {
            setIsLoadingAllChunks(false);
        }
    };

    const transcriptsNeedingAnalysis = allTranscripts.filter(t => !t.is_bio_extracted);

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>AI Transcript Dashboard</h1>
                <p>Upload, browse, and search through your transcripts.</p>
            </div>

            <div className="dashboard-content">
                {/* ... (Upload Section is unchanged) ... */}
                <div className="card">
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
                        <div className="form-row">
                          <div className="form-group">
                            <label>Category</label>
                            <input type="text" placeholder="e.g., Pravachan, Sadguru Udghosh" value={category} onChange={e => setCategory(e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label>Location</label>
                            <input type="text" placeholder="e.g., Dharampur, Mumbai" value={location} onChange={e => setLocation(e.target.value)} />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Speaker</label>
                            <input type="text" placeholder="e.g., Pujya Gurudevshri Rakeshji" value={speaker} onChange={e => setSpeaker(e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label>Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Satsang Name</label>
                            <input type="text" placeholder="e.g., Nature of Consciousness" value={satsangName} onChange={e => setSatsangName(e.target.value)} />
                          </div>
                           <div className="form-group">
                            <label>Satsang Code</label>
                            <input type="text" placeholder="e.g., SAT2025001" value={satsangCode} onChange={e => setSatsangCode(e.target.value)} />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group full-width">
                            <label>Tags</label>
                            <input type="text" placeholder="e.g., meditation, consciousness (comma-separated)" value={miscTags} onChange={e => setMiscTags(e.target.value)} />
                          </div>
                        </div>
                        <button type="submit" disabled={!file || isUploading} className="action-btn">
                            {isUploading ? <><LoaderIcon /> Uploading...</> : <><UploadIcon /> Upload & Index</>}
                        </button>
                    </form>
                    {status && (<div className={`status-message ${status.includes('✅') ? 'success' : status.includes('⚠️') ? 'warning' : 'error'}`}>{status}</div>)}
                </div>


                {/* ... (Bio Extraction Card is unchanged) ... */}
                <div className="card">
                    <div className="card-header">
                        <h2><BioExtractIcon /> Run Bio-Extraction</h2>
                        <p>Select a transcript to run automated biographical entity extraction.</p>
                    </div>
                    <div className="analysis-form">
                        <select 
                            value={selectedAnalysisSatsang} 
                            onChange={e => setSelectedAnalysisSatsang(e.target.value)} 
                            className="browse-select"
                            disabled={transcriptsNeedingAnalysis.length === 0}
                        >
                            <option value="" disabled>
                                {transcriptsNeedingAnalysis.length > 0 
                                    ? '-- Select a Transcript to Analyze --'
                                    : 'All transcripts are fully analyzed'
                                }
                            </option>
                            {transcriptsNeedingAnalysis.map((t) => (
                                <option key={t.transcript_name} value={t.transcript_name}>{t.transcript_name}</option>
                            ))}
                        </select>
                        <button onClick={handleRunBioExtraction} disabled={!selectedAnalysisSatsang || isExtractingBio} className="action-btn run-extraction-btn">
                            {isExtractingBio ? <><LoaderIcon /> Processing...</> : <><BioExtractIcon /> Run Extraction</>}
                        </button>
                    </div>
                </div>

                {/* ... (Browse Section is unchanged) ... */}
                 <div className="card">
                    <div className="card-header">
                        <h2><BrowseIcon /> Browse Transcripts</h2>
                        <p>Select a transcript to view all its processed chunks. (✅ = Bio-Extraction Complete)</p>
                    </div>
                    <div className="browse-form">
                        <select value={selectedBrowseSatsang} onChange={e => setSelectedBrowseSatsang(e.target.value)} className="browse-select">
                            <option value="" disabled>-- Select a Transcript --</option>
                            {allTranscripts.map((t) => (
                                <option key={t.transcript_name} value={t.transcript_name}>
                                    {t.is_bio_extracted ? '✅ ' : ''}{t.transcript_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
               
          
{isLoadingChunks && (<div className="card"><div className="loading-chunks"><h3><LoaderIcon /> Loading Chunks...</h3></div></div>)}

{!isLoadingChunks && satsangChunks.length > 0 && (
     <div className="card">
        <div className="card-header">
            <h3><div className="header-main">Showing Chunks for "{selectedBrowseSatsang}"</div><span className="results-count">{satsangChunks.length} chunks</span></h3>
        </div>
        <ul className="results-list">
            {satsangChunks.map((chunk, index) => {
                // Safely access all parts of the payload
                const payload = chunk.payload || {};
                const text = payload.original_text ?? payload.text ?? "No text content.";
                const timestamp = payload.timestamp ?? "?";
                const bioExtractions = payload.biographical_extractions || {};
                const entities = payload.entities || {};
                const tags = Array.isArray(payload.tags) ? payload.tags : [];

                return (
                  <li key={chunk.id || index} className="result-item">
                    <div className="result-header">
                      <div className="time-badge">⏱️ {timestamp}</div>
                    </div>
                    <div className="result-content">
                      <p className="result-text">{text}</p>
                      
                      {/* --- NEW: Render Bio Extractions --- */}
                      {Object.values(bioExtractions).some(arr => arr.length > 0) && (
                        <div className="bio-extractions">
                          <h4>Biographical Extractions</h4>
                          <ul>
                            {Object.entries(bioExtractions).map(([category, items]) =>
                              Array.isArray(items) && items.length > 0 ? (
                                <li key={category}>
                                  <strong>{category.replace(/_/g, " ")}:</strong>
                                  <span>{items.join(", ")}</span>
                                </li>
                              ) : null
                            )}
                          </ul>
                        </div>
                      )}

                      {/* --- NEW: Render Entities --- */}
                      {Object.values(entities).some(arr => arr.length > 0) && (
                        <div className="entities">
                          <h4>Extracted Entities</h4>
                          <ul>
                            {Object.entries(entities).map(([category, items]) =>
                              Array.isArray(items) && items.length > 0 ? (
                                <li key={category}>
                                  <strong>{category.replace(/_/g, " ")}:</strong>
                                  <span>{items.join(", ")}</span>
                                </li>
                              ) : null
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    {tags.length > 0 && (
                      <div className="result-tags">
                        {tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </li>
                );
            })}
        </ul>
    </div>
)}
                
                {/* NEW: Display for ALL Chunks (More Robust Version) */}
                {isLoadingAllChunks && (
    <div className="card">
        <div className="loading-chunks">
            <h3><LoaderIcon /> Loading All Chunks...</h3>
        </div>
    </div>
)}

{!isLoadingAllChunks && allChunks.length > 0 && (
     <div className="card">
        <div className="card-header">
            <h3>
                <div className="header-main">All Chunks in Collection</div>
                <span className="results-count">{allChunks.length} total chunks</span>
            </h3>
        </div>
        <ul className="results-list">
            {allChunks.map((chunk, index) => {
                // Defensive coding: ensure payload exists before trying to access its properties
                const payload = chunk.payload || {};
                const text = payload.text || payload.original_text || "No text content available.";
                const transcriptName = payload.satsang_name || payload.transcript_name || "Unknown Transcript";

                return (
                    <li key={chunk.id || index} className="result-item">
                        <div className="result-header">
                            {/* Display the transcript name to give context to each chunk */}
                            <div className="time-badge">{transcriptName}</div>
                        </div>
                        <div className="result-content">
                            <p className="result-text">{text}</p>
                        </div>
                    </li>
                );
            })}
        </ul>
    </div>
)}

                {/* ... (Search Section and its Results are unchanged) ... */}
                 <div className="card">
                    <div className="card-header">
                        <h2><SearchIcon /> Semantic Search</h2>
                        <p>Search all transcripts using natural language.</p>
                    </div>
                    <div className="search-form">
                        <div className="search-input-group">
                            <input type="text" placeholder="What did the speaker say about..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} className="search-input" />
                            <button onClick={handleSearch} disabled={!searchQuery.trim() || isSearching} className="action-btn search-btn">{isSearching ? <LoaderIcon /> : <SearchIcon />}</button>
                        </div>
                    </div>
                </div>
                
                {searchResults.length > 0 && (
                    <div className="card">
                        <div className="card-header">
                           <h3><div className="header-main"><ResultsIcon /> Search Results</div> <span className="results-count">{searchResults.length} found</span></h3>
                        </div>
                        <ul className="results-list">
                            {searchResults.map((result, index) => (
                                <li key={result.id || index} className="result-item">
                                    <div className="result-header">
                                        <div className="score-badge">Relevance: {(result.score * 100).toFixed(1)}%</div>
                                        <div className="time-badge">⏱️ {result.payload.start} - {result.payload.end}</div>
                                    </div>
                                    <div className="result-content"><p className="result-text">{result.payload.text}</p></div>
                                    {result.payload.tags && result.payload.tags.length > 0 && (<div className="result-tags">{result.payload.tags.map((tag, tagIndex) => (<span key={tagIndex} className="tag">{tag}</span>))}</div>)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {searchQuery && searchResults.length === 0 && !isSearching && (<div className="card"><div className="no-results"><h3>No results found</h3><p>Try adjusting your search query.</p></div></div>)}
            </div>
        </div>
    );
}

export default App;