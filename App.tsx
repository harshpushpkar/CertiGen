
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CertificateTemplate, CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT } from './components/CertificateTemplate';
import { CertificateData, CSVRow } from './types';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { Upload, Download, FileType, LayoutTemplate, Image as ImageIcon, FileText, CheckCircle, AlertCircle, Settings, HelpCircle, Loader2, Archive } from 'lucide-react';

// Default Assets (Base64 placeholders to ensure it works out of the box)
const DEFAULT_SIGNATURE = "data:image/svg+xml;base64,PHN2ZwogIHdpZHRoPSIxNDAiCiAgaGVpZ2h0PSIxNDAiCiAgdmlld0JveD0iMCAwIDYwMCA2MDAiCiAgZmlsbD0ibm9uZSIKICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgPgogIDxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjREZFM0U2IiAvPgogIDxwYXRoCiAgICBmaWxsLXJ1bGU9ImV2ZW5vZGQiCiAgICBjbGlwLXJ1bGU9ImV2ZW5vZGQiCiAgICBkPSJNNDUwIDE3MEgxNTBDMTQxLjcxNiAxNzAgMTM1IDE3Ni43MTYgMTM1IDE4NVY0MTVDMTM1IDQyMy4yODQgMTQxLjcxNiA0MzAgMTUwIDQzMEg0NTBDNDU4LjI4NCA0MzAgNDY1IDQyMy4yODQgNDY1IDQxNVYxODVDNDY1IDE3Ni43MTYgNDU4LjI4NCAxNzAgNDUwIDE3MFpNMTUwIDE0NUMxMjcuOTA5IDE0NSAxMTAgMTYyLjkwOSAxMTAgMTg1VjQxNUMxMTAgNDM3LjA5MSAxMjcuOTA5IDQ1NSAxNTAgNDU1SDQ1MEM0NzIuMDkxIDQ1NSA0OTAgNDM3LjA5MSA0OTAgNDE1VjE4NUM0OTAgMTYyLjkwOSA0NzIuMDkxIDE0NSA0NTAgMTQ1SDE1MFoiCiAgICBmaWxsPSIjQzFDOENEIgogIC8+CiAgPHBhdGgKICAgIGQ9Ik0yMzcuMTM1IDIzNS4wMTJDMjM3LjEzNSAyNTUuNzIzIDIyMC4zNDUgMjcyLjUxMiAxOTkuNjM1IDI3Mi41MTJDMTc4LjkyNCAyNzIuNTEyIDE2Mi4xMzUgMjU1LjcyMyAxNjIuMTM1IDIzNS4wMTJDMTYyLjEzNSAyMTQuMzAxIDE3OC45MjQgMTk3LjUxMiAxOTkuNjM1IDE5Ny41MTJDMjIwLjM0NSAxOTcuNTEyIDIzNy4xMzUgMjE0LjMwMSAyMzcuMTM1IDIzNS4wMTJaIgogICAgZmlsbD0iI0MxQzhDRCIKICAvPgogIDxwYXRoCiAgICBkPSJNMTYwIDQwNVYzNjcuMjA1TDIyMS42MDkgMzA2LjM2NEwyNTYuNTUyIDMzOC42MjhMMzU4LjE2MSAyMzRMNDQwIDMxNi4wNDNWNDA1SDE2MFoiCiAgICBmaWxsPSIjQzFDOENEIgogIC8+Cjwvc3ZnPg==";
const DEFAULT_QR = "data:image/svg+xml;base64,PHN2ZwogIHdpZHRoPSIxNDAiCiAgaGVpZ2h0PSIxNDAiCiAgdmlld0JveD0iMCAwIDYwMCA2MDAiCiAgZmlsbD0ibm9uZSIKICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgPgogIDxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjREZFM0U2IiAvPgogIDxwYXRoCiAgICBmaWxsLXJ1bGU9ImV2ZW5vZGQiCiAgICBjbGlwLXJ1bGU9ImV2ZW5vZGQiCiAgICBkPSJNNDUwIDE3MEgxNTBDMTQxLjcxNiAxNzAgMTM1IDE3Ni43MTYgMTM1IDE4NVY0MTVDMTM1IDQyMy4yODQgMTQxLjcxNiA0MzAgMTUwIDQzMEg0NTBDNDU4LjI4NCA0MzAgNDY1IDQyMy4yODQgNDY1IDQxNVYxODVDNDY1IDE3Ni43MTYgNDU4LjI4NCAxNzAgNDUwIDE3MFpNMTUwIDE0NUMxMjcuOTA5IDE0NSAxMTAgMTYyLjkwOSAxMTAgMTg1VjQxNUMxMTAgNDM3LjA5MSAxMjcuOTA5IDQ1NSAxNTAgNDU1SDQ1MEM0NzIuMDkxIDQ1NSA0OTAgNDM3LjA5MSA0OTAgNDE1VjE4NUM0OTAgMTYyLjkwOSA0NzIuMDkxIDE0NSA0NTAgMTQ1SDE1MFoiCiAgICBmaWxsPSIjQzFDOENEIgogIC8+CiAgPHBhdGgKICAgIGQ9Ik0yMzcuMTM1IDIzNS4wMTJDMjM3LjEzNSAyNTUuNzIzIDIyMC4zNDUgMjcyLjUxMiAxOTkuNjM1IDI3Mi41MTJDMTc4LjkyNCAyNzIuNTEyIDE2Mi4xMzUgMjU1LjcyMyAxNjIuMTM1IDIzNS4wMTJDMTYyLjEzNSAyMTQuMzAxIDE3OC45MjQgMTk3LjUxMiAxOTkuNjM1IDE5Ny41MTJDMjIwLjM0NSAxOTcuNTEyIDIzNy4xMzUgMjE0LjMwMSAyMzcuMTM1IDIzNS4wMTJaIgogICAgZmlsbD0iI0MxQzhDRCIKICAvPgogIDxwYXRoCiAgICBkPSJNMTYwIDQwNVYzNjcuMjA1TDIyMS42MDkgMzA2LjM2NEwyNTYuNTUyIDMzOC42MjhMMzU4LjE2MSAyMzRMNDQwIDMxNi4wNDNWNDA1SDE2MFoiCiAgICBmaWxsPSIjQzFDOENEIgogIC8+Cjwvc3ZnPg==";
const DEFAULT_LOGO = ""; 
const DEFAULT_BG = ""; 

const INITIAL_DATA: CertificateData = {
  candidateName: "Harsh Pushpkar",
  courseName: "Introduction to AI and Machine Learning",
  instructorName: "Sanjeev Sharma",
  instructorDesignation: "CEO, Deep Eigen",
  awardDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
  registrationCode: "0097303-123",
  signatureImage: DEFAULT_SIGNATURE,
  qrImage: DEFAULT_QR,
  logoImage: DEFAULT_LOGO,
  backgroundImage: DEFAULT_BG,
};

// Helper to convert Google Drive links to useable Thumbnail URLs
const processImageUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  
  // Check if it's a Google Drive Link
  if (url.includes('drive.google.com')) {
    try {
      // Extract ID
      const idMatch = url.match(/\/d\/(.*?)\/|id=(.*?)(&|$)/);
      const id = idMatch ? (idMatch[1] || idMatch[2]) : null;
      
      if (id) {
        // Return the thumbnail version which is more CORS friendly for embedding
        // sz=w1000 asks for a width of 1000px (high quality)
        return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
      }
    } catch (e) {
      console.warn("Failed to parse Google Drive URL", e);
    }
  }
  
  return url;
};

// Helper to Map CSV Row to Certificate Data
const getCertificateData = (row: CSVRow | null, manualData: CertificateData): CertificateData => {
  if (!row) return manualData;
  
  const rawSignature = row.signature || row.Signature;
  const rawQr = row.qr || row.QR || row.Qr;
  
  return {
     ...manualData,
     candidateName: row.candidate || row.Candidate || row.Name || manualData.candidateName,
     courseName: row.course || row.Course || manualData.courseName,
     instructorName: row.instructor || row.Instructor || manualData.instructorName,
     instructorDesignation: row.designation || row.Designation || manualData.instructorDesignation,
     awardDate: row.date || row.Date || manualData.awardDate,
     registrationCode: row.registration || row.Registration || manualData.registrationCode,
     signatureImage: processImageUrl(rawSignature) || manualData.signatureImage,
     qrImage: processImageUrl(rawQr) || manualData.qrImage,
     // For bulk, background is usually global from manualData, but we preserve it here
     backgroundImage: manualData.backgroundImage
  };
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [manualData, setManualData] = useState<CertificateData>(INITIAL_DATA);
  const [bulkData, setBulkData] = useState<CSVRow[]>([]);
  const [currentBulkIndex, setCurrentBulkIndex] = useState(0);
  const [overrideData, setOverrideData] = useState<CertificateData | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [fontCss, setFontCss] = useState<string>("");
  
  // Bulk Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, status: '' });

  // Inject Fonts manually to avoid CORS/cssRules errors during export
  useEffect(() => {
    const fontUrl = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Inter:wght@300;400;600&display=swap";
    fetch(fontUrl)
      .then(res => res.text())
      .then(css => {
        setFontCss(css);
        const style = document.createElement('style');
        style.id = "injected-google-fonts";
        style.textContent = css;
        document.head.appendChild(style);
      })
      .catch(e => console.warn("Failed to inject fonts for export compatibility", e));
      
    return () => {
      const style = document.getElementById('injected-google-fonts');
      if (style) style.remove();
    };
  }, []);

  // Determine what data to show in the certificate
  const displayData = useMemo(() => {
    // If we are actively generating bulk files, use the override data
    if (overrideData) return overrideData;

    if (activeTab === 'bulk' && bulkData.length > 0) {
      return getCertificateData(bulkData[currentBulkIndex], manualData);
    }
    return manualData;
  }, [activeTab, bulkData, currentBulkIndex, manualData, overrideData]);

  // Input Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setManualData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof CertificateData) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setManualData(prev => ({ ...prev, [field]: ev.target!.result as string }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      Papa.parse(e.target.files[0], {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data as CSVRow[];
          if (rows.length > 0) {
            setBulkData(rows);
            setCurrentBulkIndex(0);
            setActiveTab('bulk'); // Ensure we stay on bulk tab
          }
        }
      });
    }
  };

  const navigateBulk = (direction: 'prev' | 'next') => {
    if (direction === 'prev') setCurrentBulkIndex(prev => Math.max(0, prev - 1));
    if (direction === 'next') setCurrentBulkIndex(prev => Math.min(bulkData.length - 1, prev + 1));
  };

  // Common options for html-to-image
  const getExportOptions = () => ({
    quality: 0.95,
    pixelRatio: 2,
    fontEmbedCSS: fontCss,
    style: { 
      transform: 'none', 
      boxShadow: 'none',
      margin: '0',
    },
    filter: (node: HTMLElement) => node.tagName !== 'SCRIPT',
  });

  // Single File Export Functions
  const downloadImage = async (format: 'png' | 'jpeg') => {
    if (!exportRef.current) return;
    try {
      const func = format === 'png' ? toPng : toJpeg;
      const dataUrl = await func(exportRef.current, getExportOptions());
      if (dataUrl.length < 1000) throw new Error("Generated image data is invalid (too small)");

      const link = document.createElement('a');
      link.download = `certificate-${displayData.candidateName.replace(/\s+/g, '_')}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
      alert("Failed to export image. Please check console for details.");
    }
  };

  const downloadPDF = async () => {
    if (!exportRef.current) return;
    try {
      const imgData = await toPng(exportRef.current, getExportOptions());
      if (!imgData || imgData.length < 1000) throw new Error("Failed to generate certificate image for PDF");

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`certificate-${displayData.candidateName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF Export failed', err);
      alert("Failed to export PDF. Ensure all assets are loaded and try again.");
    }
  };

  // Bulk Export Function
  const handleBulkExport = async (format: 'pdf' | 'image') => {
    if (bulkData.length === 0) return;
    
    setIsGenerating(true);
    setProgress({ current: 0, total: bulkData.length, status: 'Initializing...' });
    const zip = new JSZip();
    const folderName = `certificates_${new Date().toISOString().split('T')[0]}`;
    const folder = zip.folder(folderName);

    try {
      // Loop through all rows
      for (let i = 0; i < bulkData.length; i++) {
        const row = bulkData[i];
        const rowData = getCertificateData(row, manualData);
        const filename = `${rowData.candidateName.replace(/[^a-z0-9]/gi, '_')}_${rowData.registrationCode || i}`;
        
        // Update state to force the hidden exportRef to render this row
        setOverrideData(rowData);
        setProgress({ current: i + 1, total: bulkData.length, status: `Generating ${rowData.candidateName}...` });

        // Allow React to render the hidden component
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!exportRef.current) continue;

        if (format === 'pdf') {
             const imgData = await toPng(exportRef.current, getExportOptions());
             const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
             const pdfWidth = pdf.internal.pageSize.getWidth();
             const pdfHeight = pdf.internal.pageSize.getHeight();
             pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
             const pdfBlob = pdf.output('blob');
             folder?.file(`${filename}.pdf`, pdfBlob);
        } else {
             // Image (PNG)
             const imgData = await toPng(exportRef.current, getExportOptions());
             const base64Data = imgData.split(',')[1];
             folder?.file(`${filename}.png`, base64Data, { base64: true });
        }
      }

      // Generate Zip
      setProgress(prev => ({ ...prev, status: 'Compressing files...' }));
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Robust saveAs handling for various build environments
      const saveFile = (FileSaver as any).saveAs || (FileSaver as any).default?.saveAs || FileSaver;
      saveFile(content, `${folderName}.zip`);
      
    } catch (error) {
      console.error("Bulk Export Error", error);
      alert("An error occurred during bulk export. Check console for details.");
    } finally {
      setIsGenerating(false);
      setOverrideData(null); // Reset to normal view
      setProgress({ current: 0, total: 0, status: '' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      
      {/* Progress Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white">
           <div className="bg-white text-gray-900 p-8 rounded-xl shadow-2xl max-w-sm w-full text-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Generating Certificates</h3>
              <p className="text-sm text-gray-500 mb-6">{progress.status}</p>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 text-right">{progress.current} / {progress.total}</p>
           </div>
        </div>
      )}

      {/* Sidebar / Controls */}
      <div className="w-full lg:w-[450px] bg-white border-r border-gray-200 flex flex-col h-auto lg:h-screen shadow-xl z-10">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100 bg-gray-50 sticky top-0 z-20">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-blue-600" />
            CertiGen
          </h1>
          <p className="text-sm text-gray-500 mt-1">Deep Eigen Certificate Generator</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
            
          {/* Tab Switcher */}
          <div className="flex p-1 bg-gray-100 rounded-lg mb-6 border border-gray-200">
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === 'single' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('single')}
            >
              Single Certificate
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === 'bulk' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('bulk')}
            >
              Bulk Export
            </button>
          </div>

          {/* Content based on Tab */}
          {activeTab === 'single' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-2">Certificate Details</h2>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Candidate Name</label>
                <input
                  type="text"
                  name="candidateName"
                  value={manualData.candidateName}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Course Name</label>
                <input
                  type="text"
                  name="courseName"
                  value={manualData.courseName}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                  placeholder="e.g. Intro to AI"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Award Date</label>
                    <input
                      type="text"
                      name="awardDate"
                      value={manualData.awardDate}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Registration Code</label>
                    <input
                      type="text"
                      name="registrationCode"
                      value={manualData.registrationCode}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    />
                 </div>
              </div>

              <div className="border-t border-gray-100 pt-2"></div>
              
              <h2 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-2">Instructor Details</h2>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Instructor Name</label>
                <input
                  type="text"
                  name="instructorName"
                  value={manualData.instructorName}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                />
              </div>
               <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Designation</label>
                <input
                  type="text"
                  name="instructorDesignation"
                  value={manualData.instructorDesignation}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                />
              </div>

              <div className="border-t border-gray-100 pt-2"></div>
          
              <h2 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-2">Assets</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded border border-gray-200 text-center hover:border-gray-300 transition-colors">
                   <label className="cursor-pointer block">
                      <ImageIcon className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                      <span className="text-xs text-blue-600 font-medium hover:underline">Upload Signature</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'signatureImage')} />
                   </label>
                   {manualData.signatureImage !== DEFAULT_SIGNATURE && (
                      <button 
                        onClick={() => setManualData(prev => ({ ...prev, signatureImage: DEFAULT_SIGNATURE }))}
                        className="text-[10px] text-red-500 mt-2 hover:underline"
                      >
                        Reset
                      </button>
                   )}
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-200 text-center hover:border-gray-300 transition-colors">
                   <label className="cursor-pointer block">
                      <ImageIcon className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                      <span className="text-xs text-blue-600 font-medium hover:underline">Upload QR</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'qrImage')} />
                   </label>
                </div>
                
                {/* Background Image Upload for Single Certificate */}
                <div className="col-span-2 bg-gray-50 p-3 rounded border border-gray-200 text-center hover:border-gray-300 transition-colors flex flex-col items-center justify-center border-dashed">
                   <label className="cursor-pointer block w-full">
                      <ImageIcon className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                      <span className="text-xs text-blue-600 font-medium hover:underline">Upload Background Image</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'backgroundImage')} />
                   </label>
                   {manualData.backgroundImage && (
                      <div className="mt-2 flex items-center gap-2">
                         <span className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded border border-green-100">Image Loaded</span>
                         <button 
                            onClick={() => setManualData(prev => ({ ...prev, backgroundImage: "" }))}
                            className="text-[10px] text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                      </div>
                   )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Global Settings for Bulk Mode */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                 <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Global Template Settings
                 </h3>
                 <p className="text-xs text-blue-700 mb-3">
                    Upload a background image to apply to all certificates in this batch.
                 </p>
                 <div className="flex items-center justify-between bg-white p-3 rounded border border-blue-200">
                     <span className="text-xs text-gray-600">Certificate Background</span>
                     <div className="flex items-center gap-2">
                        {manualData.backgroundImage && (
                            <span className="text-[10px] text-green-600 font-medium">Active</span>
                        )}
                        <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-50 shadow-sm">
                            {manualData.backgroundImage ? 'Change' : 'Upload Image'}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'backgroundImage')} />
                        </label>
                     </div>
                 </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">Bulk Certificate Export</h2>
                <p className="text-sm text-gray-500 mt-1">Upload a CSV or Excel file to generate multiple certificates.</p>
              </div>

              {/* File Upload or Loaded State */}
              {bulkData.length === 0 ? (
                 <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-400 transition-colors bg-white">
                    <div className="bg-gray-100 p-3 rounded-full mb-4">
                        <Upload className="w-6 h-6 text-gray-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Upload your file</h3>
                    <p className="text-xs text-gray-500 mb-4 max-w-[250px]">
                        CSV file with columns: candidate, course, signature, instructor, designation, date, qr, registration
                    </p>
                    <label className="cursor-pointer">
                        <span className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all">
                            Choose file
                        </span>
                        <input type="file" accept=".csv" className="hidden" onChange={handleBulkUpload} />
                    </label>
                </div>
              ) : (
                 <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-blue-900">File Loaded Successfully</h3>
                            <p className="text-xs text-blue-700">{bulkData.length} records found</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-gray-600">
                            <span>Previewing Record {currentBulkIndex + 1} of {bulkData.length}</span>
                        </div>
                        <div className="flex gap-2">
                           <button 
                            onClick={() => navigateBulk('prev')} 
                            disabled={currentBulkIndex === 0}
                            className="flex-1 py-2 px-3 bg-white border border-blue-200 rounded-lg text-sm font-medium text-blue-700 disabled:opacity-50 hover:bg-blue-50 transition-colors"
                           >
                             Previous
                           </button>
                           <button 
                            onClick={() => navigateBulk('next')} 
                            disabled={currentBulkIndex === bulkData.length - 1}
                            className="flex-1 py-2 px-3 bg-white border border-blue-200 rounded-lg text-sm font-medium text-blue-700 disabled:opacity-50 hover:bg-blue-50 transition-colors"
                           >
                             Next
                           </button>
                        </div>
                        <button 
                            onClick={() => { setBulkData([]); setCurrentBulkIndex(0); }}
                            className="w-full py-2 text-xs text-red-500 hover:text-red-700 hover:underline"
                        >
                            Remove File & Start Over
                        </button>
                    </div>
                 </div>
              )}

              {/* Instructions */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" /> Image & File Tips
                </h3>
                <div className="bg-yellow-50 p-3 rounded border border-yellow-100 mb-4">
                    <p className="text-xs text-yellow-800 font-medium mb-1">⚠️ Images Not Loading?</p>
                    <p className="text-[11px] text-yellow-700 leading-relaxed">
                        Google Drive links often block automated exports. <br/>
                        <strong>Recommended:</strong> Use Base64 strings in your CSV for 100% reliability, or use public direct links (like Imgur or S3).
                    </p>
                </div>
                <p className="text-xs text-gray-500 mb-3">Your file should have the following columns:</p>
                <ul className="space-y-2">
                    {[
                        { label: "candidate", desc: "Name of the candidate" },
                        { label: "course", desc: "Name of the course" },
                        { label: "signature", desc: "Base64 string or Direct Image URL" },
                        { label: "instructor", desc: "Name of the instructor" },
                        { label: "designation", desc: "Instructor designation" },
                        { label: "date", desc: "Award date" },
                        { label: "qr", desc: "Base64 string or Direct Image URL" },
                        { label: "registration", desc: "Registration code" },
                    ].map((item, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0"></span>
                            <span>
                                <span className="font-semibold text-gray-800">{item.label}</span> - {item.desc}
                            </span>
                        </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0 z-20 space-y-2">
          
          {activeTab === 'single' || bulkData.length === 0 ? (
             <>
                <button 
                    onClick={downloadPDF}
                    className="w-full flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-md shadow-sm font-medium transition-all active:scale-95"
                >
                    <FileType className="w-4 h-4" /> Export Current as PDF
                </button>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                    onClick={() => downloadImage('png')}
                    className="flex justify-center items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md shadow-sm text-sm font-medium transition-all active:scale-95"
                    >
                    <Download className="w-4 h-4" /> PNG
                    </button>
                    <button 
                    onClick={() => downloadImage('jpeg')}
                    className="flex justify-center items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md shadow-sm text-sm font-medium transition-all active:scale-95"
                    >
                    <Download className="w-4 h-4" /> JPEG
                    </button>
                </div>
             </>
          ) : (
              <>
                <button 
                    onClick={() => handleBulkExport('pdf')}
                    className="w-full flex justify-center items-center gap-2 bg-brand-dark hover:bg-gray-800 text-white py-3 px-4 rounded-md shadow-sm font-medium transition-all active:scale-95"
                >
                    <Archive className="w-4 h-4" /> Download All as ZIP (PDFs)
                </button>
                <button 
                    onClick={() => handleBulkExport('image')}
                    className="w-full flex justify-center items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md shadow-sm text-sm font-medium transition-all active:scale-95"
                >
                    <Archive className="w-4 h-4" /> Download All as ZIP (Images)
                </button>
              </>
          )}

        </div>

      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-gray-100 relative overflow-auto flex items-center justify-center p-8 min-h-[600px]">
        <div className="relative shadow-2xl">
          <div className="hidden xl:block">
             <CertificateTemplate data={displayData} scale={1} />
          </div>
          <div className="hidden lg:block xl:hidden">
             <CertificateTemplate data={displayData} scale={0.8} />
          </div>
          <div className="hidden md:block lg:hidden">
             <CertificateTemplate data={displayData} scale={0.7} />
          </div>
          <div className="block md:hidden">
             <CertificateTemplate data={displayData} scale={0.45} />
          </div>
        </div>
        
        <div className="absolute bottom-4 right-4 text-gray-400 text-xs bg-white/80 backdrop-blur px-2 py-1 rounded border border-gray-200 shadow-sm">
           Preview Mode • {activeTab === 'bulk' ? 'Bulk Viewer' : 'Single Entry'}
        </div>
      </div>

      {/* Hidden Export Render */}
      <div style={{ position: "fixed", left: "-9999px", top: "-9999px", zIndex: -1 }}>
        {/* We render either the displayData OR the overrideData (for bulk loop) */}
        <CertificateTemplate ref={exportRef} data={displayData} scale={1} />
      </div>

    </div>
  );
}
