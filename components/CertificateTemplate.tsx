
import React, { forwardRef } from 'react';
import { CertificateData } from '../types';

interface Props {
  data: CertificateData;
  scale?: number;
}

// The certificate dimensions from the HTML snippet provided (A4-ish landscape at 72DPI)
export const CERTIFICATE_WIDTH = 842;
export const CERTIFICATE_HEIGHT = 595;

export const CertificateTemplate = forwardRef<HTMLDivElement, Props>(({ data, scale = 1 }, ref) => {
  return (
    <div 
      className="relative overflow-hidden shadow-2xl origin-top-left select-none"
      style={{
        width: `${CERTIFICATE_WIDTH}px`,
        height: `${CERTIFICATE_HEIGHT}px`,
        transform: `scale(${scale})`,
      }}
      ref={ref}
    >
      {/* Background Image Layer */}
      {data.backgroundImage ? (
        <div className="absolute inset-0 z-0">
          <img 
            src={data.backgroundImage} 
            alt="Certificate Background" 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        // Default Vector Background (Deep Eigen Theme)
        <div className="absolute inset-0 z-0 bg-[#1a0b2e]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor:"#0f0c29", stopOpacity:1}} />
                        <stop offset="50%" style={{stopColor:"#302b63", stopOpacity:1}} />
                        <stop offset="100%" style={{stopColor:"#24243e", stopOpacity:1}} />
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grad1)" />
                {/* Gold Border */}
                <rect x="20" y="20" width="calc(100% - 40px)" height="calc(100% - 40px)" fill="none" stroke="#d4af37" strokeWidth="2" />
                <rect x="28" y="28" width="calc(100% - 56px)" height="calc(100% - 56px)" fill="none" stroke="#d4af37" strokeWidth="1" />
            </svg>
        </div>
      )}
      
      {/* Content Container */}
      <div className="relative z-20 w-full h-full flex flex-col px-24 py-20 text-white font-display">
        
        {/* Main Text Content */}
        {/* Reduced space-y-6 to space-y-4 for tighter vertical rhythm */}
        <div className="flex-1 flex flex-col items-start justify-center space-y-4 mt-2">
           <div className="space-y-1">
              <h1 className="text-4xl uppercase tracking-wider font-light text-gray-100">Certificate</h1>
              {/* Changed text color to white as requested previously */}
              <p className="text-lg text-white uppercase tracking-widest font-semibold">of Course Completion</p>
           </div>

           {/* Decorative Line - Reduced margin */}
           <div className="w-24 h-1 bg-[#d4af37] rounded-full opacity-80 my-1"></div>

           <div className="space-y-5 w-full">
             {/* Reduced gap between 'This is to certify' and Name */}
             <div className="space-y-0">
               <p className="text-lg font-light text-gray-200 mb-1">This is to certify that</p>
               <h2 className="text-5xl font-bold text-white tracking-tight leading-tight break-words drop-shadow-lg font-sans">
                 {data.candidateName || "Candidate Name"}
               </h2>
             </div>
             
             <div className="space-y-1">
               <p className="text-lg font-light text-gray-200">has successfully completed the course on</p>
               <h3 className="text-3xl text-[#d4af37] font-semibold break-words drop-shadow-md leading-snug max-w-[85%]">
                 “{data.courseName || "Course Name"}”
               </h3>
             </div>
           </div>
        </div>

        {/* Footer Section: Signatures & Details */}
        <div className="mt-auto pt-4 flex flex-row justify-between items-end w-full gap-4">
          
          {/* Instructor / Signatory - Centered Alignment */}
          <div className="flex flex-col min-w-[200px] items-center text-center">
             {data.signatureImage && (
               <img 
                  src={data.signatureImage} 
                  alt="Signature" 
                  className="h-12 object-contain mb-2"
               />
             )}
             {!data.signatureImage && <div className="h-12"></div>}
             <div className="h-px w-48 bg-gray-400 mb-2"></div>
             <p className="text-lg font-bold drop-shadow-md text-white whitespace-nowrap">{data.instructorName}</p>
             <p className="text-xs text-gray-300 uppercase tracking-wide whitespace-nowrap">{data.instructorDesignation}</p>
          </div>

          {/* Date - Centered Alignment & Line Moved Up */}
          <div className="flex flex-col min-w-[150px] items-center text-center pb-0.5 whitespace-nowrap">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Awarded on</p>
            {/* Line moved between label and date */}
            <div className="h-px w-32 bg-gray-400 mb-1"></div>
            <p className="text-lg font-bold drop-shadow-md text-white">{data.awardDate}</p>
          </div>

          {/* QR & Verification */}
          <div className="flex items-center gap-4 pl-2 shrink-0">
             <div className="flex flex-col items-end text-right space-y-1">
               <p className="text-[9px] text-gray-400 max-w-[160px] leading-tight opacity-80">
                 Certificates can be verified through the Deep Eigen AI Labs Website.
               </p>
               <div className="flex flex-col items-end mt-0.5 whitespace-nowrap">
                 <span className="text-[9px] text-[#d4af37] uppercase tracking-wider">Registration Code</span>
                 <span className="text-xs font-mono text-white tracking-wide">{data.registrationCode}</span>
               </div>
             </div>
             {data.qrImage && (
               <div className="bg-white p-1 rounded-sm shadow-lg shrink-0">
                 <img 
                  src={data.qrImage} 
                  alt="QR" 
                  className="w-16 h-16 object-contain"
                 />
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
});

CertificateTemplate.displayName = 'CertificateTemplate';
