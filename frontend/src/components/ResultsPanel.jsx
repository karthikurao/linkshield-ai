import React from 'react';
import PropTypes from 'prop-types';
import EmptyState from './EmptyState';

const statusStyles = {
  benign: 'text-emerald-600 dark:text-emerald-400',
  suspicious: 'text-amber-500 dark:text-amber-300',
  malicious: 'text-rose-600 dark:text-rose-400',
  error: 'text-rose-600 dark:text-rose-400',
};

const statusHeadlines = {
  benign: 'URL Appears Safe',
  suspicious: 'Suspicious Activity Detected',
  malicious: 'Risk Detected',
  error: 'Scan Failed',
};

const ResultsPanel = ({ result }) => {
  if (!result || result.status === 'idle') {
    return (
      <EmptyState
        title="Run a scan to view insights"
        message="Submit a URL to see LinkShield AI's analysis and risk factors."
      />
    );
  }

  if (result.status === 'loading') {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/70 p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
        <p className="text-base font-medium text-slate-600 dark:text-slate-300">{result.message ?? 'Analyzing URL...'}</p>
      </div>
    );
  }

  const { status, confidence, details, message, url } = result;
  const headline = statusHeadlines[status] ?? 'Scan Result';
  const toneClasses = statusStyles[status] ?? 'text-slate-700 dark:text-slate-200';

  const detailItems = Array.isArray(details) && details.length > 0 ? details : result.factors ?? [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-lg transition dark:border-slate-700 dark:bg-slate-800/70">
      <div className="flex flex-col gap-2 pb-4">
        {url && (
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {url}
          </span>
        )}
        <h3 className={`text-2xl font-semibold ${toneClasses}`}>{headline}</h3>
        {message && <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>}
      </div>

      {typeof confidence === 'number' && !Number.isNaN(confidence) && (
        <div className="mb-5">
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>Confidence</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{Math.round(confidence * 100)}%</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={`h-2 rounded-full ${status === 'malicious' ? 'bg-rose-500' : status === 'suspicious' ? 'bg-amber-400' : 'bg-emerald-500'}`}
              style={{ width: `${Math.max(0, Math.min(100, confidence * 100))}%` }}
            />
          </div>
        </div>
      )}

      {detailItems.length > 0 && (
        <div className="space-y-3">
          {detailItems.map((detail, index) => {
            if (typeof detail === 'string') {
              return (
                <div
                  key={`detail-${index}`}
                  className="rounded-lg border border-slate-200 bg-white/60 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-300"
                >
                  {detail}
                </div>
              );
            }

            const { name, impact, description, value } = detail;
            return (
              <div
                key={`factor-${index}`}
                className="rounded-lg border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-900/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{name}</span>
                  {value && <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{value}</span>}
                </div>
                {impact && (
                  <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${impact === 'high' || impact === 'critical' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300' : impact === 'medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300'}`}>
                    {impact}
                  </span>
                )}
                {description && (
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

ResultsPanel.propTypes = {
  result: PropTypes.shape({
    status: PropTypes.string,
    confidence: PropTypes.number,
    details: PropTypes.array,
    factors: PropTypes.array,
    message: PropTypes.string,
    url: PropTypes.string,
  }),
};

export default ResultsPanel;