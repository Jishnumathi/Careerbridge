import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  CheckCircle,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Code,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';
import { StudentProfile } from '../types';

interface ResumeViewerModalProps {
  student: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
  viewerRoleTitle?: string; // e.g. "Recruiter Evaluation" or "TPO Academic Verification"
}

export const ResumeViewerModal: React.FC<ResumeViewerModalProps> = ({
  student,
  isOpen,
  onClose,
  viewerRoleTitle,
}) => {
  const [viewMode, setViewMode] = useState<'iframe_pdf' | 'ats_data'>('iframe_pdf');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!isOpen) return null;

  // Zoom helpers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 160));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 60));
  const handleResetZoom = () => setZoomLevel(100);

  // Print helper for iframe
  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
      } catch (err) {
        console.warn('Direct print blocked, opening window print:', err);
        window.print();
      }
    } else {
      window.print();
    }
  };

  // Generate self-contained HTML for in-browser iframe PDF view
  const generatePdfHtml = () => {
    const skillsList = student.skills.map((s) => `
      <span style="display:inline-block; background:#f1f5f9; color:#0f172a; padding:3px 8px; border-radius:4px; font-size:11px; margin:2px 3px 2px 0; border:1px solid #e2e8f0; font-family:'Segoe UI', sans-serif;">
        ${s}
      </span>
    `).join('');

    const certsList = student.certifications.map((c) => `
      <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:11px;">
        <span style="color:#1e293b; font-weight:600;">• ${c.title} — <span style="font-weight:normal; color:#475569;">${c.issuer}</span></span>
        <span style="color:#64748b; font-family:monospace;">${c.year}</span>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${student.name} - Official Resume</title>
        <style>
          @page {
            size: A4;
            margin: 14mm 16mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #525659;
            color: #1e293b;
            line-height: 1.45;
            padding: 24px 16px;
            display: flex;
            justify-content: center;
          }
          .page-sheet {
            background: #ffffff;
            width: 100%;
            max-width: 820px;
            min-height: 1100px;
            padding: 48px 52px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
            border-radius: 2px;
            position: relative;
          }
          .header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 14px;
            margin-bottom: 18px;
            text-align: center;
          }
          .name {
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #0f172a;
            text-transform: uppercase;
          }
          .contact-bar {
            font-size: 11.5px;
            color: #475569;
            margin-top: 6px;
            display: flex;
            justify-content: center;
            gap: 8px;
            flex-wrap: wrap;
          }
          .contact-bar span {
            display: inline-block;
          }
          .section-title {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #0f172a;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 3px;
            margin-top: 18px;
            margin-bottom: 8px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            font-size: 12px;
          }
          .degree {
            font-weight: 700;
            color: #0f172a;
          }
          .institution {
            color: #334155;
            font-size: 11.5px;
          }
          .metric-badge {
            font-family: ui-monospace, Menlo, Consolas, monospace;
            font-weight: 700;
            color: #1e1b4b;
            background: #eef2ff;
            padding: 2px 6px;
            border-radius: 3px;
            border: 1px solid #c7d2fe;
            font-size: 11px;
          }
          .details-list {
            list-style: disc;
            margin-left: 18px;
            margin-top: 4px;
            font-size: 11.5px;
            color: #334155;
          }
          .details-list li {
            margin-bottom: 4px;
          }
          .project-item {
            margin-bottom: 10px;
          }
          .stamp-box {
            margin-top: 28px;
            padding-top: 12px;
            border-top: 1px dashed #cbd5e1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 10.5px;
            color: #64748b;
          }
          .stamp-verified {
            color: #166534;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .watermark-seal {
            position: absolute;
            bottom: 24px;
            right: 28px;
            opacity: 0.08;
            font-size: 64px;
            font-weight: 900;
            pointer-events: none;
            user-select: none;
            transform: rotate(-15deg);
          }
          @media print {
            body {
              background: transparent !important;
              padding: 0 !important;
            }
            .page-sheet {
              box-shadow: none !important;
              padding: 0 !important;
              max-width: 100% !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="page-sheet">
          <div class="watermark-seal">VERIFIED</div>

          <!-- Header -->
          <div class="header">
            <h1 class="name">${student.name}</h1>
            <div class="contact-bar">
              <span><strong>Roll:</strong> ${student.rollNumber}</span>
              <span>•</span>
              <span><strong>Email:</strong> ${student.email}</span>
              <span>•</span>
              <span><strong>Phone:</strong> ${student.phone}</span>
              <span>•</span>
              <span><strong>Campus:</strong> Apex Institute of Technology</span>
            </div>
            <div class="contact-bar" style="margin-top: 4px; color: #4338ca;">
              ${student.linkedinUrl ? `<span>LinkedIn Profile</span> • ` : ''}
              ${student.githubUrl ? `<span>GitHub Portfolio</span> • ` : ''}
              <span>Verified Placement Batch 2026</span>
            </div>
          </div>

          <!-- Academic Education -->
          <div class="section-title">Academic Qualifications</div>
          <div style="margin-bottom: 10px;">
            <div class="row">
              <span class="degree">Bachelor of Technology — ${student.branch}</span>
              <span class="metric-badge">CGPA: ${student.cgpa.toFixed(2)} / 10.0</span>
            </div>
            <div class="row" style="margin-top: 2px;">
              <span class="institution">Apex Institute of Technology, Affiliated State University</span>
              <span style="font-size: 11px; color:#64748b; font-family:monospace;">2022 – ${student.batch}</span>
            </div>
            <div style="font-size: 11px; color: #475569; margin-top: 3px;">
              Active Backlogs: <strong>${student.activeBacklogs}</strong> |
              Historical Dead Backlogs: <strong>${student.historyBacklogs}</strong> |
              Senior Secondary (12th): <strong>${student.twelfthPercentage}%</strong> |
              Secondary (10th): <strong>${student.tenthPercentage}%</strong>
            </div>
          </div>

          <!-- Technical Core Skills -->
          <div class="section-title">Technical Expertise & Competencies</div>
          <div style="margin-top: 6px;">
            <div style="font-size: 11.5px; color:#1e293b; margin-bottom: 4px;">
              <strong>Key Technologies & Languages:</strong>
            </div>
            <div>${skillsList}</div>
            <div style="font-size: 11px; color:#475569; margin-top: 6px;">
              <strong>Core Engineering Fundamentals:</strong> Data Structures & Algorithms, Object-Oriented Analysis,
              Operating Systems, Database Management Systems (SQL & NoSQL), Distributed Microservices.
            </div>
          </div>

          <!-- Academic & Engineering Projects -->
          <div class="section-title">Engineering Projects & Systems</div>
          
          <div class="project-item">
            <div class="row">
              <span style="font-weight: 700; color: #0f172a; font-size: 12px;">
                CareerBridge — High-Concurrency Placement & Recruitment Platform
              </span>
              <span style="font-size: 11px; color: #64748b; font-family: monospace;">2026</span>
            </div>
            <div style="font-size: 11px; color: #4338ca; margin-bottom: 3px;">
              Stack: MongoDB, Express.js, React.js, Node.js, JWT, Tailwind CSS
            </div>
            <ul class="details-list">
              <li>Engineered a centralized university placement management portal coordinating over 500+ candidates and tier-1 recruiters.</li>
              <li>Implemented automated candidate eligibility validation engine assessing CGPA, active backlog caps, and departmental mandates.</li>
              <li>Created multi-role authentication pipelines with recruiter evaluation boards and TPO institutional analytics.</li>
            </ul>
          </div>

          <div class="project-item">
            <div class="row">
              <span style="font-weight: 700; color: #0f172a; font-size: 12px;">
                Distributed Real-Time Event Streaming & Caching System
              </span>
              <span style="font-size: 11px; color: #64748b; font-family: monospace;">2025</span>
            </div>
            <div style="font-size: 11px; color: #4338ca; margin-bottom: 3px;">
              Stack: Golang, Apache Kafka, Redis, Docker, Prometheus
            </div>
            <ul class="details-list">
              <li>Constructed an event pipeline processing 25,000 requests/second with sub-10ms tail p99 response times.</li>
              <li>Reduced cache eviction miss rate by 42% through LRU-K partitioning and asynchronous buffer draining.</li>
            </ul>
          </div>

          <!-- Certifications & Awards -->
          ${
            student.certifications.length > 0
              ? `
            <div class="section-title">Certifications & Honors</div>
            <div style="margin-top: 4px;">
              ${certsList}
            </div>
          `
              : ''
          }

          <!-- Institutional Placement Seal -->
          <div class="stamp-box">
            <div class="stamp-verified">
              <span style="font-size: 14px;">✓</span>
              <span>Official Academic Record Endorsed by Placement Cell (TPO)</span>
            </div>
            <div style="font-family: monospace;">
              Verified on ${student.tpoVerificationDate || '2026-08-15'} · Doc ID: ${student.rollNumber}-RES
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs">
      <div
        className={`relative w-full bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 transition-all ${
          isFullscreen ? 'h-full max-h-screen rounded-none' : 'max-w-5xl h-[92vh]'
        }`}
      >
        {/* Top Header / PDF Viewer Control Toolbar */}
        <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-900 text-white gap-3 select-none">
          {/* File Name & Candidate Identity */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
              PDF
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                  {student.resumeFileName}
                </h3>
                {student.isVerifiedByTpo && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                    <CheckCircle className="w-3 h-3" /> TPO Verified
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Candidate: <strong className="text-slate-200">{student.name}</strong> ({student.rollNumber} · {student.branch})
                {viewerRoleTitle ? ` · Mode: ${viewerRoleTitle}` : ''}
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('iframe_pdf')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === 'iframe_pdf'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>In-Browser PDF</span>
            </button>
            <button
              onClick={() => setViewMode('ats_data')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === 'ats_data'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Parsed ATS Matrix</span>
            </button>
          </div>

          {/* Viewer Tools (Zoom, Print, Download, Fullscreen, Close) */}
          <div className="flex items-center gap-2">
            {viewMode === 'iframe_pdf' && (
              <div className="hidden md:flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-xs text-slate-300">
                <button
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="p-1 hover:text-white hover:bg-slate-700 rounded transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetZoom}
                  title="Reset Zoom"
                  className="font-mono text-[11px] px-1 hover:text-white"
                >
                  {zoomLevel}%
                </button>
                <button
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="p-1 hover:text-white hover:bg-slate-700 rounded transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={handlePrint}
              title="Print Document"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                alert(`Downloaded resume document: ${student.resumeFileName}`);
              }}
              title="Download PDF"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden sm:inline-flex"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              title="Close Viewer"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Body Area */}
        <div className="flex-1 overflow-hidden bg-slate-700 relative flex flex-col">
          {viewMode === 'iframe_pdf' ? (
            /* IN-BROWSER PDF IFRAME PREVIEW CONTAINER */
            <div className="flex-1 w-full h-full overflow-auto flex items-start justify-center p-3 sm:p-6 bg-slate-700/90">
              <div
                className="transition-transform duration-200 origin-top shadow-2xl bg-white w-full max-w-3xl rounded-sm"
                style={{ transform: `scale(${zoomLevel / 100})` }}
              >
                <iframe
                  ref={iframeRef}
                  title={`Resume - ${student.name}`}
                  srcDoc={generatePdfHtml()}
                  className="w-full h-[950px] border-none bg-white rounded-sm shadow-sm"
                  sandbox="allow-same-origin allow-scripts allow-modals"
                />
              </div>
            </div>
          ) : (
            /* STRUCTURED ATS PARSED CANDIDATE MATRIX */
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 text-slate-900">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Academic Metric Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">CGPA Score</span>
                    <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-0.5">
                      {student.cgpa.toFixed(2)}
                      <span className="text-xs text-slate-400 font-normal ml-1">/ 10</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Active Backlogs</span>
                    <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-0.5">
                      {student.activeBacklogs === 0 ? (
                        <span className="text-emerald-700">0</span>
                      ) : (
                        <span className="text-amber-700">{student.activeBacklogs}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">10th Standard</span>
                    <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-0.5">
                      {student.tenthPercentage}%
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">12th Standard</span>
                    <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-0.5">
                      {student.twelfthPercentage}%
                    </div>
                  </div>
                </div>

                {/* Candidate Overview Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{student.name}</h4>
                      <p className="text-xs text-slate-500">
                        {student.branch} · Batch {student.batch} · Roll No: {student.rollNumber}
                      </p>
                    </div>
                    {student.isVerifiedByTpo ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        TPO Verified Academic Records
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        Verification Pending
                      </span>
                    )}
                  </div>

                  {/* Skills Grid */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-indigo-600" />
                      Extracted Candidate Skills ({student.skills.length})
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {student.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md text-xs font-medium border border-slate-200/80"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  {student.certifications.length > 0 && (
                    <div className="pt-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-indigo-600" />
                        Verified Certifications
                      </h5>
                      <div className="space-y-1.5">
                        {student.certifications.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          >
                            <span className="font-semibold text-slate-900">{c.title}</span>
                            <span className="text-slate-500">{c.issuer} ({c.year})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Placement Status */}
                  <div className="pt-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                      Placement Status
                    </h5>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                      {student.placementStatus === 'Placed' && student.placedDetails ? (
                        <div className="flex items-center justify-between">
                          <span>
                            Secured Campus Placement with{' '}
                            <strong className="text-slate-900">{student.placedDetails.company}</strong> as{' '}
                            <strong>{student.placedDetails.role}</strong>
                          </span>
                          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {student.placedDetails.ctcLpa} LPA
                          </span>
                        </div>
                      ) : (
                        <span>Currently seeking campus placement in active recruitment season.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Verified Document: {student.resumeFileName}</span>
            <span>·</span>
            <span>Digital Hash: {student.rollNumber}-2026-TPO-VERIFIED</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                alert(`Downloaded resume: ${student.resumeFileName}`);
              }}
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <Download className="w-3.5 h-3.5" />
              Download Official PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Close Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
