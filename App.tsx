
import React, { useState, useRef, useEffect } from 'react';
import { CertificateTemplate, CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT } from './components/CertificateTemplate';
import { CertificateData, CSVRow } from './types';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import { Upload, Download, FileType, Users, LayoutTemplate, Image as ImageIcon } from 'lucide-react';

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

export default function App() {
  const [data, setData] = useState<CertificateData>(INITIAL_DATA);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkData, setBulkData] = useState<CSVRow[]>([]);
  const [currentBulkIndex, setCurrentBulkIndex] = useState(0);
  
  // We use a dedicated ref for the export element that is always rendered at full scale off-screen
  const exportRef = useRef<HTMLDivElement>(null);
  
  const [fontCss, setFontCss] = useState<string>("");

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

  // Input Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof CertificateData) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setData(prev => ({ ...prev, [field]: ev.target!.result as string }));
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
            setIsBulkMode(true);
            setCurrentBulkIndex(0);
            loadBulkRow(rows[0]);
          }
        }
      });
    }
  };

  const loadBulkRow = (row: CSVRow) => {
    setData(prev => ({
      ...prev,
      candidateName: row.Name || prev.candidateName,
      courseName: row.Course || prev.courseName,
      registrationCode: row.Registration || prev.registrationCode,
      awardDate: row.Date || prev.awardDate
    }));
  };

  const navigateBulk = (direction: 'prev' | 'next') => {
    let newIndex = currentBulkIndex;
    if (direction === 'prev') newIndex = Math.max(0, currentBulkIndex - 1);
    if (direction === 'next') newIndex = Math.min(bulkData.length - 1, currentBulkIndex + 1);
    
    setCurrentBulkIndex(newIndex);
    loadBulkRow(bulkData[newIndex]);
  };

  // Common options for html-to-image to avoid scaling issues and CORS
  const getExportOptions = () => ({
    quality: 0.95,
    pixelRatio: 2, // High resolution
    fontEmbedCSS: fontCss, // Pass the fetched CSS directly
    style: { 
      transform: 'none', 
      boxShadow: 'none',
      margin: '0',
    },
    filter: (node: HTMLElement) => {
      // Exclude script tags to prevent CORS issues with CDN scripts during cloning
      return node.tagName !== 'SCRIPT'; 
    }
  });

  // Export Functions
  const downloadImage = async (format: 'png' | 'jpeg') => {
    if (!exportRef.current) return;
    try {
      const func = format === 'png' ? toPng : toJpeg;
      const dataUrl = await func(exportRef.current, getExportOptions());
      
      // Validation check
      if (dataUrl.length < 1000) throw new Error("Generated image data is invalid (too small)");

      const link = document.createElement('a');
      link.download = `certificate-${data.candidateName.replace(/\s+/g, '_')}.${format}`;
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
      
      // Validation check: ensure we have valid image data
      if (!imgData || imgData.length < 1000) {
        throw new Error("Failed to generate certificate image for PDF");
      }

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`certificate-${data.candidateName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF Export failed', err);
      alert("Failed to export PDF. Ensure all assets are loaded and try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      
      {/* Sidebar / Controls */}
      <div className="w-full lg:w-[400px] bg-white border-r border-gray-200 flex flex-col h-auto lg:h-screen overflow-y-auto shadow-xl z-10">
        <div className="p-6 border-b border-gray-100 bg-gray-50 sticky top-0 z-20">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-blue-600" />
            CertiGen
          </h1>
          <p className="text-sm text-gray-500 mt-1">Deep Eigen Certificate Generator</p>
        </div>

        <div className="p-6 space-y-6 flex-1">
          
          {/* Bulk Upload Toggle Area */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                <Users className="w-4 h-4" /> Bulk Processing
              </span>
              {isBulkMode && (
                <button 
                  onClick={() => setIsBulkMode(false)}
                  className="text-xs text-blue-600 underline hover:text-blue-800"
                >
                  Exit Bulk Mode
                </button>
              )}
            </div>
            {!isBulkMode ? (
              <label className="flex items-center justify-center w-full h-20 px-4 transition bg-white border-2 border-blue-200 border-dashed rounded-md appearance-none cursor-pointer hover:border-blue-400 focus:outline-none">
                <span className="flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-600 text-sm">Upload CSV (Name, Course, etc.)</span>
                </span>
                <input type="file" accept=".csv" className="hidden" onChange={handleBulkUpload} />
              </label>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-blue-900">
                  <span>Record {currentBulkIndex + 1} of {bulkData.length}</span>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => navigateBulk('prev')} 
                    disabled={currentBulkIndex === 0}
                    className="flex-1 py-1 px-2 bg-white border border-blue-200 rounded text-sm disabled:opacity-50 hover:bg-blue-50"
                   >
                     Previous
                   </button>
                   <button 
                    onClick={() => navigateBulk('next')} 
                    disabled={currentBulkIndex === bulkData.length - 1}
                    className="flex-1 py-1 px-2 bg-white border border-blue-200 rounded text-sm disabled:opacity-50 hover:bg-blue-50"
                   >
                     Next
                   </button>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <h2 className="text-sm uppercase tracking-wider text-gray-500 font-semibold">Certificate Details</h2>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Candidate Name</label>
              <input
                type="text"
                name="candidateName"
                value={data.candidateName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. John Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Course Name</label>
              <input
                type="text"
                name="courseName"
                value={data.courseName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. Intro to AI"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Award Date</label>
                  <input
                    type="text"
                    name="awardDate"
                    value={data.awardDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Registration Code</label>
                  <input
                    type="text"
                    name="registrationCode"
                    value={data.registrationCode}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
               </div>
            </div>

            <div className="border-t border-gray-100 pt-4"></div>
            
            <h2 className="text-sm uppercase tracking-wider text-gray-500 font-semibold">Instructor Details</h2>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Instructor Name</label>
              <input
                type="text"
                name="instructorName"
                value={data.instructorName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
             <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Designation</label>
              <input
                type="text"
                name="instructorDesignation"
                value={data.instructorDesignation}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4"></div>
          
          <h2 className="text-sm uppercase tracking-wider text-gray-500 font-semibold">Assets</h2>
          
          <div className="space-y-3">
             {/* Background Upload */}
             <div className="bg-purple-50 p-4 rounded border border-purple-200 text-center shadow-sm">
                <label className="cursor-pointer block">
                   <ImageIcon className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                   <span className="text-sm text-purple-800 font-bold block">Upload Certificate Background</span>
                   <span className="text-xs text-purple-600 block mt-1">Select the "Deep Eigen" image</span>
                   <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'backgroundImage')} />
                </label>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div className="bg-gray-50 p-3 rounded border border-gray-200 text-center">
                  <label className="cursor-pointer block">
                     <ImageIcon className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                     <span className="text-xs text-blue-600 font-medium">Upload Signature</span>
                     <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'signatureImage')} />
                  </label>
                  {data.signatureImage !== DEFAULT_SIGNATURE && (
                     <button 
                       onClick={() => setData(prev => ({ ...prev, signatureImage: DEFAULT_SIGNATURE }))}
                       className="text-[10px] text-red-500 mt-2 underline"
                     >
                       Reset
                     </button>
                  )}
               </div>
               <div className="bg-gray-50 p-3 rounded border border-gray-200 text-center">
                  <label className="cursor-pointer block">
                     <ImageIcon className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                     <span className="text-xs text-blue-600 font-medium">Upload QR</span>
                     <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'qrImage')} />
                  </label>
               </div>
             </div>
          </div>

        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0 z-20 space-y-2">
          <button 
            onClick={downloadPDF}
            className="w-full flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-md shadow-sm font-medium transition-all"
          >
            <FileType className="w-4 h-4" /> Export as PDF
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => downloadImage('png')}
              className="flex justify-center items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md shadow-sm text-sm font-medium transition-all"
            >
              <Download className="w-4 h-4" /> PNG
            </button>
            <button 
              onClick={() => downloadImage('jpeg')}
              className="flex justify-center items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md shadow-sm text-sm font-medium transition-all"
            >
              <Download className="w-4 h-4" /> JPEG
            </button>
          </div>
        </div>

      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-gray-100 relative overflow-auto flex items-center justify-center p-8 min-h-[600px]">
        <div className="relative shadow-2xl">
          {/* Scale wrapper to fit on smaller screens. Note: No refs here anymore. */}
          <div className="hidden xl:block">
             <CertificateTemplate data={data} scale={1} />
          </div>
          <div className="hidden lg:block xl:hidden">
             <CertificateTemplate data={data} scale={0.8} />
          </div>
          <div className="hidden md:block lg:hidden">
             <CertificateTemplate data={data} scale={0.7} />
          </div>
          <div className="block md:hidden">
             <CertificateTemplate data={data} scale={0.45} />
          </div>
        </div>
        
        <div className="absolute bottom-4 right-4 text-gray-400 text-xs bg-white/80 backdrop-blur px-2 py-1 rounded border border-gray-200">
           Preview Mode • {isBulkMode ? 'Bulk Entry' : 'Single Entry'}
        </div>
      </div>

      {/* 
         HIDDEN EXPORT CONTAINER 
         This element is positioned off-screen but remains in the DOM at full scale.
         This ensures html-to-image can always capture a valid, full-size element 
         regardless of the user's current view scale.
      */}
      <div style={{ position: "fixed", left: "-9999px", top: "-9999px", zIndex: -1 }}>
        <CertificateTemplate ref={exportRef} data={data} scale={1} />
      </div>

    </div>
  );
}
