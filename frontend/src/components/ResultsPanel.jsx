// or similar component name

// Find where you're rendering the prediction results

// Replace code that shows results in a single block with:
<div className="results-container">
  <h3 className={`result-title ${result.prediction === 'malicious' ? 'negative' : 'positive'}`}>
    {result.prediction === 'malicious' ? 'Risk Detected' : 'URL Appears Safe'}
  </h3>
  
  {/* Display overall confidence */}
  <div className="confidence-meter">
    <span>Confidence: {Math.round(result.confidence * 100)}%</span>
    <progress value={result.confidence} max="1"></progress>
  </div>

  
  {/* Display individual factors with their specific impact indicators */}
  <div className="factors-list">
    {result.factors && result.factors.map((factor, index) => (
      <div key={index} className={`result-item ${factor.impact}`}>
        <div className="factor-header">
          <span className={`factor-indicator ${factor.impact}`}></span>
          <strong>{factor.name}:</strong> {factor.value}
        </div>
        <p className="factor-description">{factor.description}</p>
      </div>
    ))}
  </div>
</div>