import React from 'react';

export default function SampleIllustration({ sampleId, size = 120, className = '' }) {
  const id = (sampleId || '').toLowerCase();

  const renderIllustration = () => {
    switch (id) {
      case 'turmeric':
      case 'haridra':
        // Golden Curcuma Rhizome
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className={className} fill="none">
            <circle cx="50" cy="50" r="46" fill="#F59E0B" fillOpacity="0.08" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
            <path
              d="M30 42 C24 50 26 62 34 68 C42 74 58 72 66 64 C74 56 76 44 68 36 C60 28 44 28 36 34 Z"
              fill="url(#turmericGrad)"
              stroke="#D97706"
              strokeWidth="2"
            />
            {/* Rhizome segment rings */}
            <path d="M38 38 C42 46 44 54 40 62" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M50 34 C54 44 56 56 52 66" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M60 38 C64 46 65 54 62 60" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
            {/* Small shoot */}
            <path d="M68 36 Q75 30 78 24 Q72 26 66 32" fill="#10B981" />
            <defs>
              <linearGradient id="turmericGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'ashwagandha':
        // Withania Somnifera Root Bundle
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className={className} fill="none">
            <circle cx="50" cy="50" r="46" fill="#10B981" fillOpacity="0.08" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Main taproot */}
            <path
              d="M48 24 C46 36 44 52 46 72 C47 78 51 82 52 76 C54 62 56 46 54 24 Z"
              fill="url(#ashwaGrad)"
              stroke="#92400E"
              strokeWidth="2"
            />
            {/* Secondary branching rootlets */}
            <path d="M46 48 Q36 56 30 68" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
            <path d="M52 54 Q62 62 68 74" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
            <path d="M47 64 Q38 72 34 82" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
            {/* Green crown leaves */}
            <path d="M46 25 C42 16 34 14 36 22 C38 28 46 25 46 25 Z" fill="#10B981" />
            <path d="M54 25 C58 16 66 14 64 22 C62 28 54 25 54 25 Z" fill="#059669" />
            <defs>
              <linearGradient id="ashwaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'haritaki':
        // Chebulic Myrobalan Oval Ribbed Nut
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className={className} fill="none">
            <circle cx="50" cy="50" r="46" fill="#059669" fillOpacity="0.08" stroke="#059669" strokeWidth="1.5" strokeDasharray="3 3" />
            <ellipse cx="50" cy="50" rx="20" ry="28" fill="url(#haritakiGrad)" stroke="#047857" strokeWidth="2" />
            {/* 5 longitudinal ribs */}
            <path d="M50 22 C46 34 46 66 50 78" stroke="#065F46" strokeWidth="1.5" />
            <path d="M50 22 C40 34 40 66 50 78" stroke="#065F46" strokeWidth="1.2" strokeOpacity="0.7" />
            <path d="M50 22 C56 34 56 66 50 78" stroke="#065F46" strokeWidth="1.2" strokeOpacity="0.7" />
            {/* Pedicel */}
            <path d="M50 22 Q52 14 56 12" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="haritakiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'guduchi':
        // Heart-Leaved Moonseed Stem (Tinospora cordifolia)
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className={className} fill="none">
            <circle cx="50" cy="50" r="46" fill="#14B8A6" fillOpacity="0.08" stroke="#14B8A6" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Stem disk cross section */}
            <circle cx="50" cy="50" r="26" fill="url(#guduchiGrad)" stroke="#0D9488" strokeWidth="2" />
            <circle cx="50" cy="50" r="8" fill="#CCFBF1" stroke="#0F766E" strokeWidth="1.5" />
            {/* Wheel-spoke radiating vascular bundles */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <line
                key={angle}
                x1={50 + Math.cos((angle * Math.PI) / 180) * 8}
                y1={50 + Math.sin((angle * Math.PI) / 180) * 8}
                x2={50 + Math.cos((angle * Math.PI) / 180) * 24}
                y2={50 + Math.sin((angle * Math.PI) / 180) * 24}
                stroke="#115E59"
                strokeWidth="1.5"
              />
            ))}
            <defs>
              <linearGradient id="guduchiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5EEAD4" />
                <stop offset="100%" stopColor="#0F766E" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'amalaki':
        // Indian Gooseberry (Phyllanthus emblica)
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className={className} fill="none">
            <circle cx="50" cy="50" r="46" fill="#22C55E" fillOpacity="0.08" stroke="#22C55E" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Spherical Berry */}
            <circle cx="50" cy="50" r="25" fill="url(#amlaGrad)" stroke="#16A34A" strokeWidth="2" />
            {/* 6 characteristic vertical segments */}
            <path d="M50 25 C43 35 43 65 50 75" stroke="#15803D" strokeWidth="1.2" strokeOpacity="0.8" />
            <path d="M50 25 C57 35 57 65 50 75" stroke="#15803D" strokeWidth="1.2" strokeOpacity="0.8" />
            <ellipse cx="44" cy="42" rx="4" ry="7" fill="white" fillOpacity="0.25" />
            <defs>
              <linearGradient id="amlaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#86EFAC" />
                <stop offset="60%" stopColor="#4ADE80" />
                <stop offset="100%" stopColor="#16A34A" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'tulsi':
        // Holy Basil Leaves & Spire
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className={className} fill="none">
            <circle cx="50" cy="50" r="46" fill="#10B981" fillOpacity="0.08" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Central stem */}
            <path d="M50 80 L50 25" stroke="#065F46" strokeWidth="2" strokeLinecap="round" />
            {/* Left serrated leaf */}
            <path
              d="M50 62 C34 60 26 50 32 40 C38 32 48 48 50 56 Z"
              fill="url(#tulsiGrad)"
              stroke="#047857"
              strokeWidth="1.5"
            />
            {/* Right serrated leaf */}
            <path
              d="M50 50 C66 48 74 38 68 28 C62 20 52 36 50 44 Z"
              fill="url(#tulsiGrad)"
              stroke="#047857"
              strokeWidth="1.5"
            />
            {/* Inflorescence blossom spike tip */}
            <circle cx="50" cy="22" r="2.5" fill="#A7F3D0" />
            <circle cx="50" cy="16" r="2" fill="#A7F3D0" />
            <defs>
              <linearGradient id="tulsiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#065F46" />
              </linearGradient>
            </defs>
          </svg>
        );

      default:
        // Standard Laboratory Assay Flask
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className={className} fill="none">
            <circle cx="50" cy="50" r="46" fill="#10B981" fillOpacity="0.08" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />
            <path
              d="M44 24 L44 42 L26 72 C23 77 27 82 33 82 L67 82 C73 82 77 77 74 72 L56 42 L56 24 Z"
              stroke="#10B981"
              strokeWidth="2"
              fill="url(#flaskGrad)"
            />
            <path d="M42 24 L58 24" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="50" cy="68" rx="14" ry="4" fill="#34D399" fillOpacity="0.3" />
            <defs>
              <linearGradient id="flaskGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="40%" stopColor="#0B100D" />
                <stop offset="70%" stopColor="#064E3B" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.6" />
              </linearGradient>
            </defs>
          </svg>
        );
    }
  };

  return <div className="inline-flex items-center justify-center select-none">{renderIllustration()}</div>;
}
